/* Reusable QR logic on top of qrcode-generator (MIT, https://github.com/kazuhikoarase/qrcode-generator). */
window.TDQR = (function () {
  qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
  function esc(s) { return String(s).replace(/([\\;,:"])/g, '\\$1'); }
  // kind: text | wifi | whatsapp ; f: fields
  function payload(kind, f) {
    if (kind === 'wifi') return 'WIFI:T:' + (f.auth || 'WPA') + ';S:' + esc(f.ssid) + ';P:' + esc(f.pass || '') + ';;';
    if (kind === 'whatsapp') { var n = String(f.phone).replace(/[^\d]/g, ''); return 'https://wa.me/' + n + (f.msg ? '?text=' + encodeURIComponent(f.msg) : ''); }
    return f.text;
  }
  function make(text, ec) { var q = qrcode(0, ec || 'M'); q.addData(text, 'Byte'); q.make(); return q; }
  function toCanvas(q, px, fg, bg) {
    var n = q.getModuleCount(), quiet = 4, cell = Math.max(1, Math.floor(px / (n + 2 * quiet))), size = cell * (n + 2 * quiet);
    var c = document.createElement('canvas'); c.width = c.height = size; var x = c.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, size, size); x.fillStyle = fg;
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect((k + quiet) * cell, (r + quiet) * cell, cell, cell);
    return c;
  }
  function toSvg(q, fg, bg) {
    var n = q.getModuleCount(), quiet = 4, t = n + 2 * quiet, d = '';
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) d += 'M' + (k + quiet) + ' ' + (r + quiet) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="' + bg + '"/><path fill="' + fg + '" d="' + d + '"/></svg>';
  }
  return { payload: payload, make: make, toCanvas: toCanvas, toSvg: toSvg };
})();
