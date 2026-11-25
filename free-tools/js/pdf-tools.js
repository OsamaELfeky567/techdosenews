(function () {
  var root = document.getElementById('pt-root'), mode = root.dataset.mode;
  var $ = function (s) { return root.querySelector(s); };
  var drop = $('.ft-drop'), file = $('input[type=file]'), list = $('.pt-list'), stat = $('.ft-status'), go = $('.pt-go'), out = $('.pt-out'), files = [];
  function msg(t, e) { stat.textContent = t || ''; stat.className = 'ft-status' + (e ? ' err' : ''); }
  function fmt(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' ميجابايت' : Math.max(1, Math.round(n / 1024)) + ' كيلوبايت'; }
  function ok(f) { return mode === 'images' ? /^image\/(png|jpe?g|webp)$/i.test(f.type) : (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)); }
  function render() {
    list.innerHTML = '';
    files.forEach(function (f, i) {
      var r = document.createElement('div'); r.className = 'pt-row';
      var n = document.createElement('b'); n.textContent = (i + 1) + '. ' + f.name; var s = document.createElement('span'); s.textContent = fmt(f.size);
      r.appendChild(n); r.appendChild(s);
      [['▲', -1], ['▼', 1], ['✕', 0]].forEach(function (a) {
        if (mode === 'split' && a[1] !== 0) return;
        var b = document.createElement('button'); b.type = 'button'; b.textContent = a[0]; b.setAttribute('aria-label', a[1] < 0 ? 'للأعلى' : a[1] > 0 ? 'للأسفل' : 'حذف');
        b.addEventListener('click', function () { if (a[1] === 0) files.splice(i, 1); else { var j = i + a[1]; if (j < 0 || j >= files.length) return; var t = files[i]; files[i] = files[j]; files[j] = t; } render(); });
        r.appendChild(b);
      });
      list.appendChild(r);
    });
    go.hidden = !files.length; var sp = $('.pt-split'); if (sp) sp.hidden = !files.length;
  }
  async function add(fl) {
    msg(''); out.innerHTML = '';
    for (var f of fl) { if (!ok(f)) { msg(mode === 'images' ? 'تم تجاهل ملف ليس صورة (JPG أو PNG أو WebP).' : 'تم تجاهل ملف ليس بصيغة PDF.', true); continue; } if (f.size > 100 * 1048576) { msg('تم تجاهل ملف أكبر من 100 ميجابايت.', true); continue; } if (mode === 'split') files = []; files.push(f); }
    render();
    if (mode === 'split' && files.length) { try { var n = await TDPdf.pageCount(files[0]); $('.pt-pages').textContent = 'عدد صفحات الملف: ' + n; files[0].pages = n; } catch (e) { msg('تعذر فتح الملف. قد يكون محميا بكلمة مرور أو تالفا.', true); files = []; render(); } }
  }
  function link(blob, name, label) { var a = document.createElement('a'); a.className = 'ft-btn'; a.href = URL.createObjectURL(blob); a.download = name; a.textContent = label; a.style.margin = '4px'; out.appendChild(a); }
  go.addEventListener('click', async function () {
    out.innerHTML = ''; go.disabled = true; msg('جاري المعالجة...');
    try {
      if (mode === 'images') { link(await TDPdf.imagesToPdf(files, { page: $('.pt-page').value, margin: +$('.pt-margin').value }), 'td-arabi-images.pdf', 'تحميل ملف PDF'); }
      else if (mode === 'merge') { if (files.length < 2) { msg('اختر ملفين على الأقل للدمج.', true); go.disabled = false; return; } link(await TDPdf.merge(files), 'td-arabi-merged.pdf', 'تحميل الملف المدموج'); }
      else {
        var f = files[0], n = f.pages, sm = $('.pt-smode').value;
        if (sm === 'each') { if (n > 60) throw new Error('many'); for (var i = 0; i < n; i++) link(await TDPdf.extract(f, [i]), 'page-' + (i + 1) + '.pdf', 'صفحة ' + (i + 1)); }
        else { var idx; try { idx = TDPdf.parseRange($('.pt-range').value, n); } catch (e) { msg('نطاق الصفحات غير صحيح. مثال: 1-3, 5, 8-' + n, true); go.disabled = false; return; } link(await TDPdf.extract(f, idx), 'td-arabi-split.pdf', 'تحميل الصفحات المحددة (' + idx.length + ')'); }
      }
      msg('تمت المعالجة. حمّل الناتج من الأسفل.');
    } catch (e) { console.error(e); msg(e.message === 'many' ? 'الملف طويل. استخدم نطاق الصفحات بدل فصل كل صفحة.' : 'تعذرت المعالجة. تأكد أن الملفات سليمة وغير محمية بكلمة مرور.', true); }
    go.disabled = false;
  });
  drop.addEventListener('click', function () { file.click(); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
  file.addEventListener('change', function () { add(Array.from(file.files)); file.value = ''; });
  ['dragover', 'dragenter'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { add(Array.from(e.dataTransfer.files)); });
  window.__ptAdd = add;
})();
