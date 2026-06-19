(function() {
  'use strict';
  var id = 'G-XJD3ENNWK9';
  if (window.tdnGaLoaded) return;
  window.tdnGaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){dataLayer.push(arguments);};
  gtag('js', new Date());
  gtag('config', id, { send_page_view: true });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.appendChild(s);
  gtag('event', 'page_view', { page_title: document.title, page_location: location.href });
  var lastUrl = location.href;
  function handleNav() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      gtag('config', id, { page_path: location.pathname + location.search });
      gtag('event', 'page_view', { page_title: document.title, page_location: location.href });
    }
  }
  window.addEventListener('popstate', handleNav);
  var origPushState = history.pushState;
  history.pushState = function() {
    origPushState.apply(this, arguments);
    setTimeout(handleNav, 100);
  };
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "x9m25ltvs0");
})();