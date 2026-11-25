(function () {
  var $ = function (i) { return document.getElementById(i); };
  var drop = $('ci-drop'), file = $('ci-file'), list = $('ci-list'), stat = $('ci-status'), q = $('ci-q'), qv = $('ci-qv'), ms = $('ci-max'), ty = $('ci-type'), items = [];
  function fmt(n) { return n > 1048576 ? (n / 1048576).toFixed(2) + ' ميجابايت' : Math.max(1, Math.round(n / 1024)) + ' كيلوبايت'; }
  function msg(t, e) { stat.textContent = t || ''; stat.className = 'ft-status' + (e ? ' err' : ''); }
  function opts() { return { quality: q.value / 100, maxSide: +ms.value, type: ty.value }; }
  async function process(it) {
    try {
      var o = opts(), b = await TDCompress.run(it.img, o);
      if (it.url) URL.revokeObjectURL(it.url);
      it.blob = b; it.url = URL.createObjectURL(b);
      var ext = o.type === 'image/webp' ? 'webp' : 'jpg', base = it.name.replace(/\.[^.]+$/, '');
      var saved = Math.round((1 - b.size / it.size) * 100);
      it.row.querySelector('.ci-info').textContent = fmt(it.size) + ' ← ' + fmt(b.size) + (saved > 0 ? ' (توفير ' + saved + '%)' : ' (لا يوجد توفير، جرّب جودة أقل)');
      var a = it.row.querySelector('a'); a.href = it.url; a.download = base + '-compressed.' + ext; a.hidden = false;
    } catch (e) { it.row.querySelector('.ci-info').textContent = 'تعذر ضغط هذه الصورة'; }
  }
  async function add(files) {
    msg('');
    for (var f of files) {
      if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) { msg('تم تجاهل ملف غير مدعوم. الصيغ المدعومة: JPG و PNG و WebP.', true); continue; }
      if (f.size > 30 * 1048576) { msg('تم تجاهل صورة أكبر من 30 ميجابايت.', true); continue; }
      var row = document.createElement('div'); row.className = 'ci-row';
      row.innerHTML = '<b class="ci-name"></b><span class="ci-info">جاري الضغط...</span><a class="ft-btn" hidden>تحميل</a>';
      row.querySelector('.ci-name').textContent = f.name; list.appendChild(row);
      var it = { name: f.name, size: f.size, row: row };
      try { it.img = await TDCompress.load(f); items.push(it); await process(it); } catch (e) { row.querySelector('.ci-info').textContent = 'تعذر فتح الصورة'; }
    }
  }
  async function redo() { qv.textContent = q.value + '%'; for (var it of items) await process(it); }
  drop.addEventListener('click', function () { file.click(); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
  file.addEventListener('change', function () { add(Array.from(file.files)); file.value = ''; });
  ['dragover', 'dragenter'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { add(Array.from(e.dataTransfer.files)); });
  var t; q.addEventListener('input', function () { qv.textContent = q.value + '%'; clearTimeout(t); t = setTimeout(redo, 250); });
  ms.addEventListener('change', redo); ty.addEventListener('change', redo);
  window.__ciTest = add;
})();
