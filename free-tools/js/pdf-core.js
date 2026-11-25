/* Reusable PDF logic on top of pdf-lib (MIT, https://github.com/Hopding/pdf-lib). Browser only. */
window.TDPdf = (function () {
  var PDF = function () { return window.PDFLib; };
  var A4 = [595.28, 841.89];
  function readBuf(f) { return f.arrayBuffer(); }
  function toPngBytes(file) { // webp or anything non-jpg/png -> png via canvas
    return new Promise(function (res, rej) { var u = URL.createObjectURL(file), i = new Image(); i.onload = function () { var c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0); URL.revokeObjectURL(u); c.toBlob(function (b) { b.arrayBuffer().then(res); }, 'image/png'); }; i.onerror = function () { rej(new Error('img')); }; i.src = u; });
  }
  // opts: {page:'a4'|'fit', margin:0..60}
  async function imagesToPdf(files, opts) {
    var doc = await PDF().PDFDocument.create();
    for (var f of files) {
      var img;
      if (/jpe?g/i.test(f.type)) img = await doc.embedJpg(await readBuf(f));
      else if (/png/i.test(f.type)) img = await doc.embedPng(await readBuf(f));
      else img = await doc.embedPng(await toPngBytes(f));
      var m = opts.margin || 0, w = img.width, h = img.height, pw, ph;
      if (opts.page === 'fit') { pw = w + 2 * m; ph = h + 2 * m; }
      else { pw = A4[0]; ph = A4[1]; if (w > h) { pw = A4[1]; ph = A4[0]; } }
      var page = doc.addPage([pw, ph]), k = Math.min((pw - 2 * m) / w, (ph - 2 * m) / h), dw = w * k, dh = h * k;
      page.drawImage(img, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
    }
    return new Blob([await doc.save()], { type: 'application/pdf' });
  }
  async function merge(files) {
    var out = await PDF().PDFDocument.create();
    for (var f of files) {
      var src = await PDF().PDFDocument.load(await readBuf(f));
      (await out.copyPages(src, src.getPageIndices())).forEach(function (p) { out.addPage(p); });
    }
    return new Blob([await out.save()], { type: 'application/pdf' });
  }
  async function pageCount(file) { return (await PDF().PDFDocument.load(await readBuf(file))).getPageCount(); }
  // "1-3, 5, 8-" -> zero-based indices (throws on invalid)
  function parseRange(str, n) {
    var set = [], seen = {};
    String(str).replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632; }).split(/[,،\s]+/).filter(Boolean).forEach(function (part) {
      var m = part.match(/^(\d*)-(\d*)$/), a, b;
      if (m) { a = m[1] ? +m[1] : 1; b = m[2] ? +m[2] : n; } else if (/^\d+$/.test(part)) { a = b = +part; } else throw new Error('range');
      if (a < 1 || b > n || a > b) throw new Error('range');
      for (var i = a; i <= b; i++) if (!seen[i]) { seen[i] = 1; set.push(i - 1); }
    });
    if (!set.length) throw new Error('range');
    return set;
  }
  async function extract(file, indices) {
    var src = await PDF().PDFDocument.load(await readBuf(file)), out = await PDF().PDFDocument.create();
    (await out.copyPages(src, indices)).forEach(function (p) { out.addPage(p); });
    return new Blob([await out.save()], { type: 'application/pdf' });
  }
  return { imagesToPdf: imagesToPdf, merge: merge, pageCount: pageCount, parseRange: parseRange, extract: extract };
})();
