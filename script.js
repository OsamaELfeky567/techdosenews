const BASE = 'https://raw.githubusercontent.com/osamaelfeky567/techdosenews/main/sandbox';
let allArticles = [];
let filteredArticles = [];

const CATEGORY_MAP = {
  ai:'الذكاء الاصطناعي',startups:'الشركات الناشئة',cybersecurity:'الأمن السيبراني',
  business:'الأعمال',research:'الأبحاث',consumer:'تقنيات المستهلك',
  bigtech:'الشركات الكبرى',software:'البرمجيات',hardware:'العتاد',
  cloud:'الحوسبة السحابية',robotics:'الروبوتات',innovation:'الابتكار',
  تكنولوجيا:'التقنية',تقنية:'التقنية'
};

const TAG_CATEGORY_MAP = {
  'تكنولوجيا':'تقنية','ذكاء اصطناعي':'ai','أمن سيبراني':'cybersecurity',
  'أمان':'cybersecurity','هواتف':'consumer','أعمال':'business',
  'أبحاث':'research','برمجيات':'software','عتاد':'hardware',
  'شركات':'bigtech','روبوتات':'robotics','فضاء':'innovation',
  'سحابة':'cloud'
};

const ARABIC_DAYS = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

const COMPANIES = [
  {sym:'أوب',name:'أوبن‌إيه‌آي',mentions:142,change:18},
  {sym:'إن‌ف',name:'إنفيديا',mentions:128,change:24},
  {sym:'أن',name:'أنثروبيك',mentions:96,change:31},
  {sym:'جوج',name:'جوجل',mentions:87,change:9},
  {sym:'ميك',name:'مايكروسوفت',mentions:81,change:12},
  {sym:'ميت',name:'ميتا',mentions:64,change:6}
];

function getArticleCategory(article) {
  if (article.category && CATEGORY_MAP[article.category]) {
    return CATEGORY_MAP[article.category];
  }
  if (article.tags && article.tags.length > 0) {
    for (const tag of article.tags) {
      const mappedKey = TAG_CATEGORY_MAP[tag];
      if (mappedKey && CATEGORY_MAP[mappedKey]) return CATEGORY_MAP[mappedKey];
    }
  }
  return 'التقنية';
}

function getCategoryKey(article) {
  const arName = getArticleCategory(article);
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (val === arName) return key;
  }
  return 'تقنية';
}

async function loadIndex() {
  try {
    const res = await fetch(BASE + '/index.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    allArticles = data.articles || [];
    if (allArticles.length === 0) throw new Error('No articles');
    for (const a of allArticles) {
      a.categoryAr = getArticleCategory(a);
      a.categoryKey = getCategoryKey(a);
    }
    filteredArticles = [...allArticles];
    renderAll();
  } catch(e) {
    document.querySelectorAll('.sb-loading, #sbGrid, #sbHero, #sbTrendingList, #sbLatestList').forEach(el => {
      if (el) el.innerHTML = '<div class="sb-loading">⚠ تعذر تحميل المقالات — ' + e.message + '</div>';
    });
  }
}

function renderAll() {
  renderHero();
  renderTrending();
  renderLatest();
  renderEditorsPicks();
  renderGrid();
  renderCategories();
  renderCompanies();
  renderMostRead();
  renderFooterCats();
  updatePulse();
  updateLastUpdate();
}

function renderHero() {
  const hero = document.getElementById('sbHero');
  if (!hero || allArticles.length === 0) return;
  const featured = allArticles.filter(a => a.featured);
  const a = featured.length > 0 ? featured[0] : allArticles[0];
  hero.innerHTML = '<div onclick="goto(\'' + escId(a.id) + '\')">' +
    (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
    '<div class="sb-hero-overlay"><div class="sb-cat-badge">' + esc(a.categoryAr) + '</div>' +
    '<h2>' + esc(a.title) + '</h2>' +
    (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
    '<div class="sb-hero-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + formatDate(a.date) + '</span></div></div></div>';
}

function renderTrending() {
  const list = document.getElementById('sbTrendingList');
  if (!list) return;
  const items = allArticles.slice(0, 5);
  list.innerHTML = items.map((a, i) => {
    const num = String(i + 1).padStart(2, '0');
    return '<div class="sb-trending-item" onclick="goto(\'' + escId(a.id) + '\')">' +
      '<span class="sb-trending-num">' + num + '</span>' +
      '<div class="sb-trending-info"><span class="sb-trending-cat">' + esc(a.categoryAr) + '</span>' +
      '<h4>' + esc(a.title) + '</h4>' +
      '<span class="sb-trending-views">' + (a.readTime || 'قراءة دقيقة') + '</span></div></div>';
  }).join('');
}

function renderLatest() {
  const list = document.getElementById('sbLatestList');
  if (!list) return;
  const items = allArticles.slice(1, 7);
  list.innerHTML = items.map(a => {
    return '<div class="sb-latest-item" onclick="goto(\'' + escId(a.id) + '\')">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
      '<div class="sb-latest-info"><span class="sb-latest-cat">' + esc(a.categoryAr) + '</span>' +
      '<h4>' + esc(a.title) + '</h4>' +
      '<span class="sb-latest-date">' + formatDate(a.date) + '</span></div></div>';
  }).join('');
}

function renderEditorsPicks() {
  const grid = document.getElementById('sbEditorsGrid');
  if (!grid || allArticles.length < 3) return;
  const scored = [...allArticles].sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
  const items = scored.slice(0, 3);
  grid.innerHTML = items.map(a => {
    return '<div class="sb-editor-card" onclick="goto(\'' + escId(a.id) + '\')">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
      '<div class="sb-editor-body"><span class="sb-editor-cat">' + esc(a.categoryAr) + '</span>' +
      '<h3>' + esc(a.title) + '</h3></div></div>';
  }).join('');
}

function renderGrid() {
  const grid = document.getElementById('sbGrid');
  if (!grid) return;
  const items = filteredArticles;
  if (items.length === 0) {
    grid.innerHTML = '<div class="sb-loading">لا توجد مقالات متطابقة</div>';
    return;
  }
  grid.innerHTML = items.map(a => {
    return '<div class="sb-card" onclick="goto(\'' + escId(a.id) + '\')">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
      '<div class="sb-card-body"><div class="sb-card-cat">' + esc(a.categoryAr) + '</div>' +
      '<h3>' + esc(a.title) + '</h3>' +
      (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
      '<div class="sb-card-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + formatDate(a.date) + '</span></div></div></div>';
  }).join('');
}

function renderCategories() {
  const grid = document.getElementById('sbCategoriesGrid');
  if (!grid) return;
  grid.innerHTML = Object.entries(CATEGORY_MAP).map(([key, name]) =>
    '<div class="sb-cat-chip" onclick="filterCategory(\'' + key + '\')">' + name + '</div>'
  ).join('');
}

function renderCompanies() {
  const list = document.getElementById('sbCompanyList');
  if (!list) return;
  list.innerHTML = COMPANIES.map(c =>
    '<div class="sb-company-item"><div class="sb-company-logo">' + c.sym + '</div>' +
    '<span class="sb-company-name">' + c.name + '</span>' +
    '<span class="sb-company-mentions">' + c.mentions + ' ذكرًا</span>' +
    '<span class="sb-company-change up">+' + c.change + '%</span></div>'
  ).join('');
}

function renderMostRead() {
  const list = document.getElementById('sbMostReadList');
  if (!list) return;
  const items = allArticles.slice(0, 5);
  list.innerHTML = items.map((a, i) => {
    return '<div class="sb-most-read-item" onclick="goto(\'' + escId(a.id) + '\')">' +
      '<span class="sb-most-read-num">' + (i + 1) + '</span>' +
      '<div class="sb-most-read-info"><span class="sb-most-read-cat">' + esc(a.categoryAr) + '</span>' +
      '<h4>' + esc(a.title) + '</h4></div></div>';
  }).join('');
}

function renderFooterCats() {
  const list = document.getElementById('sbFooterCategories');
  if (!list) return;
  list.innerHTML = Object.entries(CATEGORY_MAP).map(([key, name]) =>
    '<li><a href="#" onclick="filterCategory(\'' + key + '\'); return false;">' + name + '</a></li>'
  ).join('');
}

function updatePulse() {
  document.getElementById('pulseAI') && (document.getElementById('pulseAI').textContent = Math.floor(Math.random() * 30) + 35);
  document.getElementById('pulseFunding') && (document.getElementById('pulseFunding').textContent = Math.floor(Math.random() * 15) + 15);
  document.getElementById('pulsePapers') && (document.getElementById('pulsePapers').textContent = Math.floor(Math.random() * 80) + 100);
  document.getElementById('pulseReleases') && (document.getElementById('pulseReleases').textContent = Math.floor(Math.random() * 10) + 12);
}

function updateLastUpdate() {
  const el = document.getElementById('sbLastUpdate');
  if (!el) return;
  const now = new Date();
  const d = ARABIC_DAYS[now.getDay()];
  const month = ARABIC_MONTHS[now.getMonth()];
  el.textContent = d + '، ' + now.getDate() + ' ' + month + ' ' + now.getFullYear();
  const timeEl = document.getElementById('sbHeaderTime');
  if (timeEl) {
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = h + ':' + m;
  }
}

function filterCategory(cat) {
  if (cat === 'all') {
    filteredArticles = [...allArticles];
  } else {
    const catName = CATEGORY_MAP[cat] || cat;
    filteredArticles = allArticles.filter(a =>
      a.categoryAr === catName || a.categoryKey === cat ||
      (a.tags && a.tags.some(t => TAG_CATEGORY_MAP[t] === cat || t === catName))
    );
  }
  document.querySelectorAll('.sb-nav a').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === cat);
  });
  renderGrid();
  closeMenu();
  window.scrollTo({top: document.getElementById('sbGrid')?.offsetTop - 80 || 0, behavior: 'smooth'});
}

function filterSearch(query) {
  if (!query.trim()) {
    filteredArticles = [...allArticles];
  } else {
    const q = query.trim().toLowerCase();
    filteredArticles = allArticles.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
      (a.categoryAr && a.categoryAr.toLowerCase().includes(q)) ||
      (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
    );
  }
  renderGrid();
}

function toggleMenu() {
  document.getElementById('sbNav').classList.toggle('open');
  document.getElementById('sbOverlay').classList.toggle('show');
}

function closeMenu() {
  document.getElementById('sbNav').classList.remove('open');
  document.getElementById('sbOverlay').classList.remove('show');
}

function toggleSearch() {
  const bar = document.getElementById('sbSearchBar');
  bar.classList.toggle('show');
  if (bar.classList.contains('show')) {
    setTimeout(() => document.getElementById('sbSearchInput').focus(), 100);
  }
}

function closeSearch() {
  document.getElementById('sbSearchBar').classList.remove('show');
  document.getElementById('sbSearchInput').value = '';
  filterSearch('');
}

function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
function escId(id) { return encodeURIComponent(id || ''); }

function formatDate(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return ARABIC_DAYS[dt.getDay()] + '، ' + dt.getDate() + ' ' + ARABIC_MONTHS[dt.getMonth()] + ' ' + dt.getFullYear();
  } catch(e) { return d; }
}

function goto(id) { window.location.href = 'article.html?id=' + escId(id); }

function injectAdsIntoBody(bodyHtml) {
  if (!bodyHtml) return '';
  const pRegex = /<p[^>]*>[\s\S]*?<\/p>/gi;
  const paragraphs = bodyHtml.match(pRegex);
  if (!paragraphs || paragraphs.length < 3) return bodyHtml;
  let result = '';
  for (let i = 0; i < paragraphs.length; i++) {
    result += paragraphs[i];
    if (i === 2) {
      result += '<div class="sb-ad-inarticle sb-ad-after-p3"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">336 × 280</div></div>';
    } else if (i === Math.floor(paragraphs.length / 2)) {
      result += '<div class="sb-ad-inarticle sb-ad-middle"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">336 × 280</div></div>';
    } else if (i === paragraphs.length - 2) {
      result += '<div class="sb-ad-inarticle sb-ad-before-end"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">728 × 90</div></div>';
    }
  }
  return result;
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
    document.title = a.title + ' — TD بالعربي';
    document.querySelector('[property="og:title"]') && (document.querySelector('[property="og:title"]').content = a.title + ' — TD بالعربي');
    document.querySelector('[property="og:description"]') && (document.querySelector('[property="og:description"]').content = a.excerpt || '');
    document.querySelector('[property="og:image"]') && (document.querySelector('[property="og:image"]').content = a.image || '');
    document.querySelector('[name="twitter:image"]') && (document.querySelector('[name="twitter:image"]').content = a.image || '');
    const tagsHtml = (a.tags || []).map(t => '<span>' + esc(t) + '</span>').join('');
    a.categoryAr = getArticleCategory(a);
    const catBadge = '<div style="display:inline-block;background:#e0e7ff;color:var(--accent);padding:2px 10px;border-radius:4px;font-size:.75rem;font-weight:700;margin-bottom:8px">' + esc(a.categoryAr) + '</div>';
    const bodyWithAds = a.body ? injectAdsIntoBody(a.body) : '';
    main.innerHTML = '<div class="sb-container"><article class="sb-article">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '">' : '') +
      catBadge +
      '<h1>' + esc(a.title) + '</h1>' +
      '<div class="sb-ad-inarticle sb-ad-after-title"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">728 × 90</div></div>' +
      '<div class="sb-article-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + formatDate(a.date || a.created_at) + '</span><span>' + (a.readTime || 'قراءة دقيقة') + '</span></div>' +
      (a.excerpt ? '<div class="sb-article-body"><p><strong>' + esc(a.excerpt) + '</strong></p></div>' : '') +
      (bodyWithAds ? '<div class="sb-article-body">' + bodyWithAds + '</div>' : '') +
      (tagsHtml ? '<div class="sb-article-tags">' + tagsHtml + '</div>' : '') +
      '<div class="sb-article-nav"><a href="index.html">← الرجوع للرئيسية</a></div>' +
      '</article><aside class="sb-article-sidebar"><div class="sb-ad-box sb-ad-300x250"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">300 × 250</div></div><div class="sb-ad-box sb-ad-300x600" style="position:sticky;top:80px"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">300 × 600</div></div></aside></div>';
  } catch(e) {
    main.innerHTML = '<div class="sb-container"><div class="sb-loading">⚠ تعذر تحميل المقال — ' + e.message + '</div></div>';
  }
}

if (document.getElementById('sbGrid')) { loadIndex(); setInterval(updateLastUpdate, 60000); updateLastUpdate(); }
if (document.getElementById('sbArticleMain')) loadArticle();
