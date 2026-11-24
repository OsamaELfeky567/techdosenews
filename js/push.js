/* Web push opt-in (OneSignal v16). Polite: custom soft prompt after engagement, never blocks content.
   App ID (public, safe) is served from /js/onesignal-app-id.txt so it is managed in one place. */
(function () {
  var debug = location.search.indexOf('tdpush=debug') > -1;
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
  var ua = navigator.userAgent, iOS = /iPad|iPhone|iPod/.test(ua);
  var standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  if (iOS && !standalone && !debug) return;                 // iOS only supports web push for installed web apps
  if (Notification.permission !== 'default' && !debug) return; // already granted or blocked
  try {
    var until = +localStorage.getItem('td_push_snooze') || 0;
    if (Date.now() < until && !debug) return;
    var views = (+localStorage.getItem('td_views') || 0) + 1; localStorage.setItem('td_views', views);
  } catch (e) { return; }

  var shown = false, loaded = false;
  function loadSDK(APP_ID, cb) {
    if (debug) return cb();
    if (loaded) return cb(); loaded = true;
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(function (OS) { OS.init({ appId: APP_ID, notifyButton: { enable: false }, promptOptions: { slidedown: { prompts: [] } } }).then(cb); });
    var s = document.createElement('script'); s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'; s.defer = true; document.head.appendChild(s);
  }
  function snooze(days) { try { localStorage.setItem('td_push_snooze', Date.now() + days * 864e5); } catch (e) {} }
  function show() {
    if (shown) return; shown = true;
    var d = document.createElement('div');
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'تفعيل الإشعارات'); d.dir = 'rtl';
    d.style.cssText = 'position:fixed;z-index:900;bottom:14px;right:14px;left:14px;max-width:400px;margin:0 0 0 auto;background:var(--surface,#fff);color:var(--text,#111);border:1px solid var(--border,#e2e8f0);border-top:3px solid var(--accent,#c81e1e);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:14px 16px;font-family:inherit;font-size:.92rem;line-height:1.6;animation:tdp .35s ease';
    d.innerHTML = '<style>@keyframes tdp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}</style><b style="display:block;margin-bottom:2px">🔔 لا يفوتك أي خبر جديد</b><span style="color:var(--muted,#64748b)">فعّل الإشعارات ويوصلك كل خبر تقني أول بأول. تقدر تلغيها في أي وقت.</span><div style="display:flex;gap:8px;margin-top:10px"><button id="tdp-yes" style="flex:1;background:var(--accent,#c81e1e);color:#fff;border:0;border-radius:8px;padding:9px 12px;font:inherit;font-weight:700;cursor:pointer">تفعيل</button><button id="tdp-no" style="background:transparent;color:var(--muted,#64748b);border:1px solid var(--border,#e2e8f0);border-radius:8px;padding:9px 14px;font:inherit;cursor:pointer">لاحقا</button></div>';
    document.body.appendChild(d);
    d.querySelector('#tdp-no').onclick = function () { snooze(14); d.remove(); };
    d.querySelector('#tdp-yes').onclick = function () {
      d.remove(); snooze(3650);
      fetch('/js/onesignal-app-id.txt').then(function (r) { return r.text(); }).then(function (t) {
        var APP_ID = t.trim();
        if (!/^[0-9a-f-]{36}$/i.test(APP_ID) && !debug) return;
        loadSDK(APP_ID, function () { if (debug) return; OneSignal.Notifications.requestPermission(); });
      }).catch(function () {});
    };
  }
  // Polite trigger: after 25 s AND scrolled 35%, or on the 2nd+ page view after 12 s. Never in the first seconds.
  var t0 = Date.now(), scrolled = false;
  addEventListener('scroll', function () { var h = document.documentElement; if (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1) > .35) scrolled = true; }, { passive: true });
  var iv = setInterval(function () {
    var s = (Date.now() - t0) / 1000;
    if (shown) return clearInterval(iv);
    if ((s > 25 && scrolled) || (views > 1 && s > 12) || (debug && s > 2)) { clearInterval(iv); show(); }
  }, 1000);
})();
