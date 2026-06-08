const BASE = '.';
let allArticles = [];
let filteredArticles = [];

const CATEGORY_MAP = {
  ai:'الذكاء الاصطناعي',startups:'الشركات الناشئة',cybersecurity:'الأمن السيبراني',
  business:'الأعمال',research:'الأبحاث',consumer:'تقنيات المستهلك',
  bigtech:'الشركات الكبرى',software:'البرمجيات',hardware:'العتاد',
  cloud:'الحوسبة السحابية',robotics:'الروبوتات',innovation:'الابتكار'
};

const COMPANIES = [
  {sym:'Op',name:'OpenAI',mentions:142,change:18},
  {sym:'NV',name:'NVIDIA',mentions:128,change:24},
  {sym:'An',name:'Anthropic',mentions:96,change:31},
  {sym:'Go',name:'Google',mentions:87,change:9},
  {sym:'Mi',name:'Microsoft',mentions:81,change:12},
  {sym:'Me',name:'Meta',mentions:64,change:6}
];

async function loadIndex() {
  try {
    const res = await fetch(BASE + '/index.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    allArticles = data.articles || [];
    if (allArticles.length === 0) throw new Error('No articles');
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
}

function renderHero() {
  const hero = document.getElementById('sbHero');
  if (!hero || allArticles.length === 0) return;
  const a = allArticles[0];
  const catAr = CATEGORY_MAP[a.category] || a.category;
  hero.innerHTML = '<div onclick="goto(\'' + escId(a.id) + '\')">' +
    (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
    '<div class="sb-hero-overlay"><div class="sb-cat-badge">' + esc(catAr) + '</div>' +
    '<h2>' + esc(a.title) + '</h2>' +
    (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
    '<div class="sb-hero-meta"><span>' + esc(a.source || 'TD بالعربي') + '</span><span>' + formatDate(a.date) + '</span></div></div></div>';
}

function renderTrending() {
  const list = document.getElementById('sbTrendingList');
  if (!list) return;
  const items = allArticles.slice(0, 5);
  list.innerHTML = items.map((a, i) => {
    const num = String(i + 1).padStart(2, '0');
    const catAr = CATEGORY_MAP[a.category] || a.category;
    return '<div class="sb-trending-item" onclick="goto(\'' + escId(a.id) + '\')">' +
      '<span class="sb-trending-num">' + num + '</span>' +
      '<div class="sb-trending-info"><span class="sb-trending-cat">' + esc(catAr) + '</span>' +
      '<h4>' + esc(a.title) + '</h4>' +
      '<span class="sb-trending-views">' + (a.views || formatNum(Math.floor(Math.random() * 50) + 10) + 'K') + '</span></div></div>';
  }).join('');
}

function renderLatest() {
  const list = document.getElementById('sbLatestList');
  if (!list) return;
  const items = allArticles.slice(1, 7);
  list.innerHTML = items.map(a => {
    const catAr = CATEGORY_MAP[a.category] || a.category;
    return '<div class="sb-latest-item" onclick="goto(\'' + escId(a.id) + '\')">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
      '<div class="sb-latest-info"><span class="sb-latest-cat">' + esc(catAr) + '</span>' +
      '<h4>' + esc(a.title) + '</h4>' +
      '<span class="sb-latest-date">' + formatDate(a.date) + '</span></div></div>';
  }).join('');
}

function renderEditorsPicks() {
  const grid = document.getElementById('sbEditorsGrid');
  if (!grid || allArticles.length < 3) return;
  const items = [allArticles[0], allArticles[1] || allArticles[0], allArticles[2] || allArticles[0]];
  grid.innerHTML = items.map(a => {
    const catAr = CATEGORY_MAP[a.category] || a.category;
    return '<div class="sb-editor-card" onclick="goto(\'' + escId(a.id) + '\')">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
      '<div class="sb-editor-body"><span class="sb-editor-cat">' + esc(catAr) + '</span>' +
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
    const catAr = CATEGORY_MAP[a.category] || a.category;
    return '<div class="sb-card" onclick="goto(\'' + escId(a.id) + '\')">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
      '<div class="sb-card-body"><div class="sb-card-cat">' + esc(catAr) + '</div>' +
      '<h3>' + esc(a.title) + '</h3>' +
      (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
      '<div class="sb-card-meta"><span>' + esc(catAr) + '</span><span>' + formatDate(a.date) + '</span></div></div></div>';
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
    '<span class="sb-company-mentions">' + c.mentions + ' ذكر</span>' +
    '<span class="sb-company-change up">+' + c.change + '%</span></div>'
  ).join('');
}

function renderMostRead() {
  const list = document.getElementById('sbMostReadList');
  if (!list) return;
  const items = allArticles.slice(0, 5);
  list.innerHTML = items.map((a, i) => {
    const catAr = CATEGORY_MAP[a.category] || a.category;
    return '<div class="sb-most-read-item" onclick="goto(\'' + escId(a.id) + '\')">' +
      '<span class="sb-most-read-num">' + (i + 1) + '</span>' +
      '<div class="sb-most-read-info"><span class="sb-most-read-cat">' + esc(catAr) + '</span>' +
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

function filterCategory(cat) {
  if (cat === 'all') {
    filteredArticles = [...allArticles];
  } else {
    filteredArticles = allArticles.filter(a => a.category === cat);
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
      (a.category && a.category.toLowerCase().includes(q))
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
function formatDate(d) { if (!d) return ''; try { return new Date(d).toLocaleDateString('ar-SA', {year:'numeric',month:'long',day:'numeric'}); } catch(e) { return d; } }
function formatNum(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function goto(id) { window.location.href = 'article.html?id=' + escId(id); }

// === ARTICLE PAGE ===
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
    const catAr = CATEGORY_MAP[a.category] || a.category;
    main.innerHTML = '<div class="sb-container"><article class="sb-article">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '">' : '') +
      '<div style="display:inline-block;background:#e0e7ff;color:var(--accent);padding:2px 10px;border-radius:4px;font-size:.75rem;font-weight:700;margin-bottom:8px">' + esc(catAr) + '</div>' +
      '<h1>' + esc(a.title) + '</h1>' +
      '<div class="sb-article-meta"><span>' + esc(a.source || 'TD بالعربي') + '</span><span>' + (a.date || '') + '</span><span>' + (a.readTime || '') + '</span></div>' +
      (a.excerpt ? '<div class="sb-article-body"><p><strong>' + esc(a.excerpt) + '</strong></p></div>' : '') +
      (a.body ? '<div class="sb-article-body">' + a.body + '</div>' : '') +
      (tagsHtml ? '<div class="sb-article-tags">' + tagsHtml + '</div>' : '') +
      '<div class="sb-article-ad">📢 إعلان — مساحة إعلانية تجريبية</div>' +
      '</article></div>';
  } catch(e) {
    main.innerHTML = '<div class="sb-container"><div class="sb-loading">⚠ تعذر تحميل المقال — ' + e.message + '</div></div>';
  }
}

if (document.getElementById('sbGrid')) loadIndex();
if (document.getElementById('sbArticleMain')) loadArticle();
