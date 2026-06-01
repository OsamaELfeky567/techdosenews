const BASE = window.location.pathname.includes('/sandbox') ? '.' : '.';

async function loadIndex() {
  const hero = document.getElementById('sbHero');
  const grid = document.getElementById('sbGrid');
  if (!grid) return;
  try {
    const res = await fetch(BASE + '/index.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const articles = data.articles || [];
    if (articles.length === 0) throw new Error('No articles');
    const featured = articles[0];
    hero.innerHTML = '<div class="sb-hero-card" onclick="goto(\'' + featured.id + '\')">' +
      (featured.image ? '<img src="' + featured.image + '" alt="' + esc(featured.title) + '" loading="lazy">' : '') +
      '<div class="sb-hero-overlay"><div class="sb-hero-cat">' + esc(featured.category) + '</div>' +
      '<h2>' + esc(featured.title) + '</h2>' +
      '<p>' + esc(featured.excerpt || '') + '</p></div></div>';
    grid.innerHTML = articles.map(a => '<div class="sb-card" onclick="goto(\'' + a.id + '\')">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
      '<div class="sb-card-body"><div class="sb-card-cat">' + esc(a.category) + '</div>' +
      '<h3>' + esc(a.title) + '</h3>' +
      '<p>' + esc(a.excerpt || '') + '</p>' +
      '<div class="sb-card-meta"><span>' + esc(a.category) + '</span><span>' + (a.date || '') + '</span></div></div></div>'
    ).join('');
  } catch(e) {
    grid.innerHTML = '<div class="sb-loading">⚠ تعذر تحميل المقالات — ' + e.message + '</div>';
  }
}

async function loadArticle() {
  const main = document.getElementById('sbArticleMain');
  if (!main) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { main.innerHTML = '<div class="sb-container"><div class="sb-loading">⚠ معرف المقال غير موجود</div></div>'; return; }
  try {
    const res = await fetch(BASE + '/articles/' + encodeURIComponent(id) + '.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const a = await res.json();
    document.title = a.title + ' — Tech Dose Sandbox';
    document.querySelector('[property="og:title"]') && (document.querySelector('[property="og:title"]').content = a.title);
    document.querySelector('[property="og:description"]') && (document.querySelector('[property="og:description"]').content = a.excerpt || '');
    document.querySelector('[property="og:image"]') && (document.querySelector('[property="og:image"]').content = a.image || '');
    document.querySelector('[name="twitter:image"]') && (document.querySelector('[name="twitter:image"]').content = a.image || '');
    const tagsHtml = (a.tags || []).map(t => '<span>' + esc(t) + '</span>').join('');
    main.innerHTML = '<div class="sb-container"><article class="sb-article">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '">' : '') +
      '<h1>' + esc(a.title) + '</h1>' +
      '<div class="sb-article-meta"><span>' + esc(a.category) + '</span><span>' + (a.date || '') + '</span><span>' + (a.source || '') + '</span></div>' +
      (a.excerpt ? '<div class="sb-article-body"><p><strong>' + esc(a.excerpt) + '</strong></p></div>' : '') +
      (a.body ? '<div class="sb-article-body">' + a.body + '</div>' : '') +
      (tagsHtml ? '<div class="sb-article-tags">' + tagsHtml + '</div>' : '') +
      '<div class="sb-article-ad">📢 إعلان — مساحة إعلانية تجريبية</div>' +
      '</article></div>';
  } catch(e) {
    main.innerHTML = '<div class="sb-container"><div class="sb-loading">⚠ تعذر تحميل المقال — ' + e.message + '</div></div>';
  }
}

function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
function goto(id) { window.location.href = 'article.html?id=' + encodeURIComponent(id); }

if (document.getElementById('sbGrid')) loadIndex();
if (document.getElementById('sbArticleMain')) loadArticle();