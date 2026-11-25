/* Background removal, fully in the browser. Model: U2-Net-small (u2netp, Apache-2.0), runtime: onnxruntime-web (MIT). */
(function () {
  var MODEL = '/free-tools/models/u2netp.onnx';
  var ORT = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
  var S = 320, session = null, loading = null;
  var $ = function (id) { return document.getElementById(id); };
  var drop = $('rb-drop'), file = $('rb-file'), stat = $('rb-status'), out = $('rb-out');
  var cvOrig = $('rb-orig'), cvRes = $('rb-res'), bgSel = $('rb-bg'), dl = $('rb-dl'), again = $('rb-again');
  var resultCanvas = null, maskAlpha = null, srcImg = null;

  function msg(t, err) { stat.textContent = t || ''; stat.className = 'ft-status' + (err ? ' err' : ''); }
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error('script')); }; document.head.appendChild(s); }); }
  function getSession() {
    if (session) return Promise.resolve(session);
    if (loading) return loading;
    loading = (async function () {
      msg('جاري تحميل نموذج الذكاء الاصطناعي (مرة واحدة فقط، حوالي 5 ميجابايت)...');
      if (!window.ort) await loadScript(ORT + 'ort.min.js');
      ort.env.wasm.wasmPaths = ORT; ort.env.wasm.numThreads = 1; ort.env.wasm.proxy = false;
      session = await ort.InferenceSession.create(MODEL, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
      return session;
    })();
    loading.catch(function () { loading = null; });
    return loading;
  }
  function fit(img, max) { var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h)); return { w: Math.round(w * k), h: Math.round(h * k) }; }

  async function run(img) {
    var d = fit(img, 1600);                                 // work size (output resolution)
    var c = document.createElement('canvas'); c.width = d.w; c.height = d.h;
    var cx = c.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, d.w, d.h);
    var sess = await getSession();
    msg('جاري إزالة الخلفية...');
    await new Promise(function (r) { setTimeout(r, 30); });
    var sc = document.createElement('canvas'); sc.width = S; sc.height = S;
    var sx = sc.getContext('2d', { willReadFrequently: true }); sx.drawImage(img, 0, 0, S, S);
    var px = sx.getImageData(0, 0, S, S).data, n = S * S, buf = new Float32Array(3 * n);
    var mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225];
    for (var i = 0; i < n; i++) for (var k = 0; k < 3; k++) buf[k * n + i] = (px[i * 4 + k] / 255 - mean[k]) / std[k];
    var feeds = {}; feeds[sess.inputNames[0]] = new ort.Tensor('float32', buf, [1, 3, S, S]);
    var res = await sess.run(feeds), o = res[sess.outputNames[0]].data, mn = Infinity, mx = -Infinity;
    for (i = 0; i < n; i++) { if (o[i] < mn) mn = o[i]; if (o[i] > mx) mx = o[i]; }
    var mc = document.createElement('canvas'); mc.width = S; mc.height = S; var mctx = mc.getContext('2d'), mi = mctx.createImageData(S, S);
    for (i = 0; i < n; i++) { var v = (o[i] - mn) / ((mx - mn) || 1); v = Math.max(0, Math.min(1, (v - 0.08) / 0.84)); mi.data[i * 4 + 3] = Math.round(v * 255); }
    mctx.putImageData(mi, 0, 0);
    var big = document.createElement('canvas'); big.width = d.w; big.height = d.h; var bx = big.getContext('2d');
    bx.imageSmoothingQuality = 'high'; bx.drawImage(mc, 0, 0, d.w, d.h);
    var alpha = bx.getImageData(0, 0, d.w, d.h).data, im = cx.getImageData(0, 0, d.w, d.h);
    for (i = 0; i < d.w * d.h; i++) im.data[i * 4 + 3] = alpha[i * 4 + 3];
    cx.putImageData(im, 0, 0);
    return c;
  }
  function paint() {
    if (!resultCanvas) return;
    var w = resultCanvas.width, h = resultCanvas.height;
    cvRes.width = w; cvRes.height = h; var x = cvRes.getContext('2d'), bg = bgSel.value;
    x.clearRect(0, 0, w, h);
    if (bg !== 'transparent') { x.fillStyle = bg; x.fillRect(0, 0, w, h); }
    x.drawImage(resultCanvas, 0, 0);
    cvRes.classList.toggle('checker', bg === 'transparent');
    cvRes.toBlob(function (b) { if (dl.dataset.url) URL.revokeObjectURL(dl.dataset.url); var u = URL.createObjectURL(b); dl.dataset.url = u; dl.href = u; dl.download = 'td-arabi-no-bg.' + (bg === 'transparent' ? 'png' : 'png'); }, 'image/png');
  }
  async function handle(f) {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) return msg('الصيغ المدعومة: JPG و PNG و WebP.', true);
    if (f.size > 20 * 1024 * 1024) return msg('حجم الصورة كبير (الحد 20 ميجابايت).', true);
    msg('جاري قراءة الصورة...'); out.hidden = true;
    var url = URL.createObjectURL(f), img = new Image();
    img.onload = async function () {
      try {
        srcImg = img; var d = fit(img, 1000); cvOrig.width = d.w; cvOrig.height = d.h; cvOrig.getContext('2d').drawImage(img, 0, 0, d.w, d.h);
        resultCanvas = await run(img); out.hidden = false; paint(); msg('تمت إزالة الخلفية. يمكنك تحميل الصورة الآن.');
        out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (e) { console.error(e); msg('تعذر تشغيل الأداة على هذا الجهاز أو المتصفح. جرّب متصفح Chrome أو صورة أصغر.', true); }
      URL.revokeObjectURL(url);
    };
    img.onerror = function () { msg('تعذر فتح الصورة. جرّب ملفا آخر.', true); };
    img.src = url;
  }
  drop.addEventListener('click', function () { file.click(); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
  file.addEventListener('change', function () { handle(file.files[0]); file.value = ''; });
  ['dragover', 'dragenter'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { handle(e.dataTransfer.files[0]); });
  bgSel.addEventListener('change', paint);
  again.addEventListener('click', function () { out.hidden = true; msg(''); file.click(); });
  window.__rbTest = function (img) { return run(img).then(function (c) { resultCanvas = c; out.hidden = false; paint(); return c; }); };
})();
