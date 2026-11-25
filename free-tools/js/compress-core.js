/* Reusable image compression core (browser Canvas, no dependencies). Same logic can be ported to the bot. */
window.TDCompress = {
  load: function (file) { return new Promise(function (res, rej) { var u = URL.createObjectURL(file), i = new Image(); i.onload = function () { URL.revokeObjectURL(u); res(i); }; i.onerror = function () { URL.revokeObjectURL(u); rej(new Error('load')); }; i.src = u; }); },
  /* opts: {quality 0.1-1, maxSide px or 0, type 'image/jpeg'|'image/webp'} -> Promise<Blob> */
  run: function (img, opts) {
    var w = img.naturalWidth, h = img.naturalHeight, k = opts.maxSide ? Math.min(1, opts.maxSide / Math.max(w, h)) : 1;
    w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
    var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d');
    if (opts.type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); }
    x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
    return new Promise(function (res, rej) { c.toBlob(function (b) { b ? res(b) : rej(new Error('blob')); }, opts.type, opts.quality); });
  }
};
