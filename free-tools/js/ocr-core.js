/* Reusable OCR logic on top of tesseract.js 5.1.1 (Apache-2.0) + tessdata_fast (Apache-2.0), all self-hosted. */
window.TDOCR = (function () {
  var B = '/free-tools/ocr/';
  async function recognize(file, lang, onProgress) {
    var w = await Tesseract.createWorker(lang, 1, { workerPath: B + 'worker.min.js', corePath: B, langPath: B.slice(0, -1), gzip: false, cacheMethod: 'refresh', logger: function (m) { if (onProgress && m.status === 'recognizing text') onProgress(m.progress); } });
    try { var r = await w.recognize(file); return r.data.text; } finally { await w.terminate(); }
  }
  return { recognize: recognize };
})();
