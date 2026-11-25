(function () {
  var $ = function (i) { return document.getElementById(i); };
  var kind = $('qr-kind'), out = $('qr-canvas'), msg = $('qr-status'), dlp = $('qr-png'), dls = $('qr-svg'), cur = null;
  function show() { ['text', 'wifi', 'whatsapp'].forEach(function (k) { $('qr-f-' + k).hidden = kind.value !== k; }); }
  function val(i) { return $(i).value.trim(); }
  function gen() {
    var k = kind.value, f = { text: val('qr-text'), ssid: val('qr-ssid'), pass: $('qr-pass').value, auth: $('qr-auth').value, phone: val('qr-phone'), msg: val('qr-msg') };
    var need = k === 'text' ? f.text : k === 'wifi' ? f.ssid : f.phone.replace(/\D/g, '');
    if (!need) { out.hidden = true; dlp.hidden = dls.hidden = true; msg.textContent = ''; return; }
    var p = TDQR.payload(k, f), q;
    try { q = TDQR.make(p, $('qr-ec').value); } catch (e) { out.hidden = true; dlp.hidden = dls.hidden = true; msg.textContent = 'النص طويل جدا لرمز QR. اختصره أو خفّض مستوى التصحيح.'; msg.className = 'ft-status err'; return; }
    msg.textContent = ''; msg.className = 'ft-status';
    var fg = $('qr-fg').value, bg = $('qr-bg').value, size = +$('qr-size').value;
    var c = TDQR.toCanvas(q, size, fg, bg); out.width = c.width; out.height = c.height; out.getContext('2d').drawImage(c, 0, 0); out.hidden = false;
    c.toBlob(function (b) { if (dlp.dataset.u) URL.revokeObjectURL(dlp.dataset.u); dlp.dataset.u = dlp.href = URL.createObjectURL(b); dlp.download = 'td-arabi-qr.png'; dlp.hidden = false; });
    var sb = new Blob([TDQR.toSvg(q, fg, bg)], { type: 'image/svg+xml' }); if (dls.dataset.u) URL.revokeObjectURL(dls.dataset.u); dls.dataset.u = dls.href = URL.createObjectURL(sb); dls.download = 'td-arabi-qr.svg'; dls.hidden = false;
  }
  kind.addEventListener('change', function () { show(); gen(); });
  document.querySelectorAll('#qr-root input,#qr-root select,#qr-root textarea').forEach(function (e) { e.addEventListener('input', gen); e.addEventListener('change', gen); });
  show(); gen(); window.__qrGen = gen;
})();
