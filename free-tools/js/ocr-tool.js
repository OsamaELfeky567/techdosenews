(function () {
  var $ = function (i) { return document.getElementById(i); };
  var drop = $('ocr-drop'), file = $('ocr-file'), stat = $('ocr-status'), lang = $('ocr-lang'), box = $('ocr-text'), res = $('ocr-res'), prev = $('ocr-prev'), busy = false;
  function msg(t, e) { stat.textContent = t || ''; stat.className = 'ft-status' + (e ? ' err' : ''); }
  async function handle(f) {
    if (!f || busy) return;
    if (!/^image\/(png|jpe?g|webp|bmp)$/i.test(f.type)) return msg('الصيغ المدعومة: JPG و PNG و WebP.', true);
    if (f.size > 15 * 1048576) return msg('حجم الصورة كبير (الحد 15 ميجابايت).', true);
    busy = true; res.hidden = true; prev.src = URL.createObjectURL(f); prev.hidden = false;
    msg('جاري تحميل محرك التعرف على النص (مرة واحدة)...');
    try {
      var t = await TDOCR.recognize(f, lang.value, function (p) { msg('جاري قراءة النص... ' + Math.round(p * 100) + '%'); });
      box.value = t.trim(); res.hidden = false;
      msg(t.trim() ? 'تم استخراج النص. راجعه وصحّح أي خطأ ثم انسخه أو حمّله.' : 'لم يتم العثور على نص. جرّب صورة أوضح.', !t.trim());
    } catch (e) { console.error(e); msg('تعذر تشغيل الأداة على هذا الجهاز. جرّب متصفح Chrome أو صورة أصغر.', true); }
    busy = false;
  }
  drop.addEventListener('click', function () { file.click(); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
  file.addEventListener('change', function () { handle(file.files[0]); file.value = ''; });
  ['dragover', 'dragenter'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { handle(e.dataTransfer.files[0]); });
  $('ocr-copy').addEventListener('click', function () { box.select(); (navigator.clipboard ? navigator.clipboard.writeText(box.value) : Promise.reject()).then(function () { msg('تم نسخ النص.'); }, function () { document.execCommand('copy'); msg('تم نسخ النص.'); }); });
  $('ocr-dl').addEventListener('click', function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([box.value], { type: 'text/plain;charset=utf-8' })); a.download = 'td-arabi-ocr.txt'; a.click(); });
  window.__ocrTest = handle;
})();
