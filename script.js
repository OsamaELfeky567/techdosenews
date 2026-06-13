const BASE = 'https://raw.githubusercontent.com/osamaelfeky567/techdosenews/main/sandbox';
let allArticles = [];
let filteredArticles = [];
const PAGE_SIZE = 9;
let gridRenderedCount = 0;

const AD_CONFIG = {
  enabled: false,
  adsterraCodes: {
    '300x250': '',
    '300x600': '',
    '728x90': '',
    '336x280': '',
  }
};



const CATEGORY_MAP = {
  ai:'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',companies:'Ø´Ø±ÙƒØ§Øª',cybersecurity:'Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ',
  mobile:'Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©',ev:'Ø³ÙŠØ§Ø±Ø§Øª ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©',
  security:'Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ',business:'Ø´Ø±ÙƒØ§Øª',startups:'Ø´Ø±ÙƒØ§Øª',
  bigtech:'Ø´Ø±ÙƒØ§Øª',software:'Ø´Ø±ÙƒØ§Øª',cloud:'Ø´Ø±ÙƒØ§Øª',
  hardware:'Ø´Ø±ÙƒØ§Øª',consumer:'Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©',gaming:'Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©',
  AI:'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',AI_ar:'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',
  'Big-Tech':'Ø´Ø±ÙƒØ§Øª','big-tech':'Ø´Ø±ÙƒØ§Øª',BigTech:'Ø´Ø±ÙƒØ§Øª',
  Security:'Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ',Startups:'Ø´Ø±ÙƒØ§Øª',
  Mobile:'Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©',Hardware:'Ø´Ø±ÙƒØ§Øª',Gaming:'Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©',
  Science:'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',Business:'Ø´Ø±ÙƒØ§Øª',Cloud:'Ø´Ø±ÙƒØ§Øª',
  'ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§':'Ø´Ø±ÙƒØ§Øª','ØªÙ‚Ù†ÙŠØ©':'Ø´Ø±ÙƒØ§Øª',EV:'Ø³ÙŠØ§Ø±Ø§Øª ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©',ev:'Ø³ÙŠØ§Ø±Ø§Øª ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©'
};

const TAG_CATEGORY_MAP = {
  'ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§':'companies','ØªÙ‚Ù†ÙŠØ©':'companies','Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ':'ai',
  'Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ':'cybersecurity','Ø£Ù…Ø§Ù†':'cybersecurity',
  'Ù‡ÙˆØ§ØªÙ':'mobile','mobile':'mobile','Mobile':'mobile',
  'Ø£Ø¹Ù…Ø§Ù„':'companies','business':'companies','Business':'companies',
  'Ø´Ø±ÙƒØ§Øª':'companies','startups':'companies','Startups':'companies',
  'Ø¨Ø±Ù…Ø¬ÙŠØ§Øª':'companies','software':'companies',
  'Ø³Ø­Ø§Ø¨Ø©':'companies','cloud':'companies',
  'Ø¹ØªØ§Ø¯':'companies','hardware':'companies',
  'Ø³ÙŠØ§Ø±Ø§Øª':'ev','EV':'ev','Ø³ÙŠØ§Ø±Ø§Øª ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©':'ev',
  'ai':'ai','AI':'ai','security':'cybersecurity',
  'Security':'cybersecurity','cybersecurity':'cybersecurity',
  'gaming':'mobile','Gaming':'mobile',
  'science':'ai','Science':'ai',
  'Ø±ÙˆØ¨ÙˆØªØ§Øª':'ai','robotics':'ai','ÙØ¶Ø§Ø¡':'ai',
  'bigtech':'companies','big-tech':'companies','BigTech':'companies',
  'Big-Tech':'companies','Ø£Ø¨Ø­Ø§Ø«':'ai','research':'ai'
};

const ARABIC_DAYS = ['Ø§Ù„Ø£Ø­Ø¯','Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†','Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡','Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡','Ø§Ù„Ø®Ù…ÙŠØ³','Ø§Ù„Ø¬Ù…Ø¹Ø©','Ø§Ù„Ø³Ø¨Øª'];
const ARABIC_MONTHS = ['ÙŠÙ†Ø§ÙŠØ±','ÙØ¨Ø±Ø§ÙŠØ±','Ù…Ø§Ø±Ø³','Ø£Ø¨Ø±ÙŠÙ„','Ù…Ø§ÙŠÙˆ','ÙŠÙˆÙ†ÙŠÙˆ','ÙŠÙˆÙ„ÙŠÙˆ','Ø£ØºØ³Ø·Ø³','Ø³Ø¨ØªÙ…Ø¨Ø±','Ø£ÙƒØªÙˆØ¨Ø±','Ù†ÙˆÙÙ…Ø¨Ø±','Ø¯ÙŠØ³Ù…Ø¨Ø±'];

const COMPANIES = [
  {sym:'Ø£ÙˆØ¨',name:'Ø£ÙˆØ¨Ù†â€ŒØ¥ÙŠÙ‡â€ŒØ¢ÙŠ'},
  {sym:'Ø¥Ù†â€ŒÙ',name:'Ø¥Ù†ÙÙŠØ¯ÙŠØ§'},
  {sym:'Ø£Ù†',name:'Ø£Ù†Ø«Ø±ÙˆØ¨ÙŠÙƒ'},
  {sym:'Ø¬ÙˆØ¬',name:'Ø¬ÙˆØ¬Ù„'},
  {sym:'Ù…ÙŠÙƒ',name:'Ù…Ø§ÙŠÙƒØ±ÙˆØ³ÙˆÙØª'},
  {sym:'Ù…ÙŠØª',name:'Ù…ÙŠØªØ§'}
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
  return 'Ø§Ù„ØªÙ‚Ù†ÙŠØ©';
}

function getCategoryKey(article) {
  const arName = getArticleCategory(article);
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (val === arName) return key;
  }
  if (article.tags && article.tags.length > 0) {
    for (const tag of article.tags) {
      const mappedKey = TAG_CATEGORY_MAP[tag];
      if (mappedKey && mappedKey !== tag) return mappedKey;
    }
  }
  return 'ØªÙ‚Ù†ÙŠØ©';
}

async function loadIndex() {
  try {
    const res = await fetch(BASE + '/articles/index.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    allArticles = Array.isArray(data) ? data : (data.articles || []);
    if (allArticles.length === 0) throw new Error('No articles');
    for (const a of allArticles) {
      a.categoryAr = getArticleCategory(a);
      a.categoryKey = getCategoryKey(a);
    }
    allArticles.sort(function(a, b) { return new Date(getPubDate(b) || 0) - new Date(getPubDate(a) || 0); });
    filteredArticles = [...allArticles];
    renderAll();
  } catch(e) {
    document.querySelectorAll('.sb-loading, #sbGrid, #sbHero, #sbTrendingList, #sbLatestList').forEach(el => {
      if (el) el.innerHTML = '<div class="sb-loading">âš  ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª â€” ' + e.message + '</div>';
    });
  }
}

function renderAll() {
  renderHero();
  renderLatest();
  renderTrending();
  renderEditorsPicks();
  renderCategories();
  renderGrid();
  renderCompanies();
  renderMostRead();
  renderFooterCats();
  updateLastUpdate();
  renderRelativeTimes();
}

function renderHero() {
  const hero = document.getElementById('sbHero');
  if (!hero || allArticles.length === 0) return;
  const sorted = [...allArticles].sort(function(a, b) {
    return new Date(getPubDate(b) || 0) - new Date(getPubDate(a) || 0);
  });
  let a = null;
  for (const candidate of sorted) {
    if (candidate.image && candidate.categoryAr && candidate.categoryAr !== 'Ø§Ù„ØªÙ‚Ù†ÙŠØ©' && candidate.categoryAr !== 'Ø¹Ø§Ù…') {
      a = candidate;
      break;
    }
  }
  if (!a) a = sorted[0];
  const pubDate = getPubDate(a);
  hero.innerHTML = '<div onclick="goto(\'' + escId(a.id) + '\')">' +
    (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
    '<div class="sb-hero-overlay"><div class="sb-cat-badge">' + esc(a.categoryAr) + '</div>' +
    getFreshnessBadge(pubDate) +
    '<h2>' + esc(a.title) + '</h2>' +
    (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
    '<div class="sb-hero-meta"><span>' + esc(a.source_name || a.source || 'TD Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ') + '</span><span>' + getRelativeTimeHtml(pubDate) + '</span></div></div></div>';
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
      '<span class="sb-trending-time">' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div>';
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
      '<span class="sb-latest-date">' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div>';
  }).join('');
}

function renderEditorsPicks() {
  const grid = document.getElementById('sbEditorsGrid');
  if (!grid || allArticles.length < 3) return;
  const scored = [...allArticles].sort(function(a, b) {
    return (b.quality_score || 0) - (a.quality_score || 0);
  });
  const items = scored.slice(0, 3);
  grid.innerHTML = items.map(a => {
    return '<div class="sb-editor-card" onclick="goto(\'' + escId(a.id) + '\')">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
      '<div class="sb-editor-body"><span class="sb-editor-cat">' + esc(a.categoryAr) + '</span>' +
      '<h3>' + esc(a.title) + '</h3>' +
      '<span class="sb-editor-time">' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div>';
  }).join('');
}

function renderGrid() {
  const grid = document.getElementById('sbGrid');
  const loadMoreContainer = document.getElementById('sbLoadMoreContainer');
  if (!grid) return;
  const items = filteredArticles;
  if (items.length === 0) {
    grid.innerHTML = '<div class="sb-loading">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‚Ø§Ù„Ø§Øª Ù…ØªØ·Ø§Ø¨Ù‚Ø©</div>';
    if (loadMoreContainer) loadMoreContainer.innerHTML = '';
    return;
  }
  gridRenderedCount = 0;
  grid.innerHTML = '';
  if (loadMoreContainer) loadMoreContainer.innerHTML = '';
  appendGridItems();
}

function appendGridItems() {
  const grid = document.getElementById('sbGrid');
  const loadMoreContainer = document.getElementById('sbLoadMoreContainer');
  if (!grid) return;
  const items = filteredArticles;
  if (items.length === 0) return;
  const frag = document.createDocumentFragment();
  const start = gridRenderedCount;
  const end = Math.min(start + PAGE_SIZE, items.length);
  const ad = '<div class="sb-ad-box" style="min-height:250px;margin:0 0 20px;grid-column:1/-1"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">300 Ã— 250</div></div>';
  for (let i = start; i < end; i++) {
    const a = items[i];
    const card = document.createElement('div');
    card.className = 'sb-card';
    card.style.animation = 'sbFadeIn 0.3s ease';
    card.onclick = function() { goto(a.id); };
    let cardHtml = '';
    if (a.image) cardHtml += '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">';
    cardHtml += '<div class="sb-card-body"><div class="sb-card-cat">' + esc(a.categoryAr) + '</div>' +
      '<h3>' + esc(a.title) + '</h3>' +
      (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
      '<div class="sb-card-meta"><span>' + esc(a.source_name || a.source || 'TD Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ') + '</span><span>' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div>';
    card.innerHTML = cardHtml;
    frag.appendChild(card);
    const globalIndex = i;
    if ((globalIndex + 1) % 6 === 0 && globalIndex + 1 < items.length) {
      const adDiv = document.createElement('div');
      adDiv.innerHTML = ad;
      frag.appendChild(adDiv.firstChild || adDiv);
    }
  }
  grid.appendChild(frag);
  gridRenderedCount = end;
  if (loadMoreContainer) {
    if (end < items.length) {
      loadMoreContainer.innerHTML = '<button class="sb-load-more-btn" onclick="loadMore()">Ø§Ù„Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„Ø£Ø®Ø¨Ø§Ø±</button>';
    } else {
      loadMoreContainer.innerHTML = '';
    }
  }
}

function loadMore() {
  appendGridItems();
  const btn = document.querySelector('.sb-load-more-btn');
  if (btn) {
    btn.textContent = 'Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù…ÙŠÙ„...';
    setTimeout(function() {
      const container = document.getElementById('sbLoadMoreContainer');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }
}

function renderCategories() {
  const grid = document.getElementById('sbCategoriesGrid');
  if (!grid) return;
  const mainCats = {ai:'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',companies:'Ø´Ø±ÙƒØ§Øª',cybersecurity:'Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ',mobile:'Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©',ev:'Ø³ÙŠØ§Ø±Ø§Øª ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©'};
  grid.innerHTML = Object.entries(mainCats).map(([key, name]) =>
    '<div class="sb-cat-chip" onclick="location.href=\'category.html?cat=' + key + '\'">' + name + '</div>'
  ).join('');
}

function renderCompanies() {
  const list = document.getElementById('sbCompanyList');
  if (!list) return;
  list.innerHTML = COMPANIES.map(c =>
    '<div class="sb-company-item"><div class="sb-company-logo">' + c.sym + '</div>' +
    '<span class="sb-company-name">' + c.name + '</span></div>'
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
  const mainCats = {ai:'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',companies:'Ø´Ø±ÙƒØ§Øª',cybersecurity:'Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ',mobile:'Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©',ev:'Ø³ÙŠØ§Ø±Ø§Øª ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©'};
  list.innerHTML = Object.entries(mainCats).map(([key, name]) =>
    '<li><a href="category.html?cat=' + key + '">' + name + '</a></li>'
  ).join('');
}

function renderRelativeTimes() {
  document.querySelectorAll('.sb-relative-time').forEach(function(el) {
    var pub = el.getAttribute('data-pub');
    if (pub) el.textContent = formatRelativeTime(pub);
  });
}

function getHijriDate(date) {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day:'numeric',month:'long',year:'numeric'}).format(date);
  } catch(e) { return ''; }
}

function updateLastUpdate() {
  const now = new Date();
  const month = ARABIC_MONTHS[now.getMonth()];
  const el = document.getElementById('sbLastUpdate');
  if (el) {
    el.textContent = now.getDate() + ' ' + month + ' ' + now.getFullYear() + ' | ' + getHijriDate(now);
  }
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
  const countEl = document.getElementById('sbSearchCount');
  if (countEl) {
    countEl.textContent = filteredArticles.length === allArticles.length ? '' : 'Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø¨Ø­Ø«: ' + filteredArticles.length + ' Ù…Ù‚Ø§Ù„';
  }
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
    return ARABIC_DAYS[dt.getDay()] + 'ØŒ ' + dt.getDate() + ' ' + ARABIC_MONTHS[dt.getMonth()] + ' ' + dt.getFullYear();
  } catch(e) { return d; }
}

function formatDateShort(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return dt.getDate() + ' ' + ARABIC_MONTHS[dt.getMonth()];
  } catch(e) { return d; }
}

function getPubDate(a) { return a.published_at || a.date || a.created_at || ''; }

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const pub = new Date(dateStr).getTime();
  if (isNaN(pub)) return '';
  const diffMs = now - pub;
  if (diffMs < 0) return 'Ø§Ù„Ø¢Ù†';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Ø§Ù„Ø¢Ù†';
  if (mins < 60) {
    if (mins === 1) return 'Ù…Ù†Ø° Ø¯Ù‚ÙŠÙ‚Ø©';
    if (mins === 2) return 'Ù…Ù†Ø° Ø¯Ù‚ÙŠÙ‚ØªÙŠÙ†';
    if (mins <= 10) return 'Ù…Ù†Ø° ' + mins + ' Ø¯Ù‚Ø§Ø¦Ù‚';
    return 'Ù…Ù†Ø° ' + mins + ' Ø¯Ù‚ÙŠÙ‚Ø©';
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    if (hours === 1) return 'Ù…Ù†Ø° Ø³Ø§Ø¹Ø©';
    if (hours === 2) return 'Ù…Ù†Ø° Ø³Ø§Ø¹ØªÙŠÙ†';
    if (hours <= 10) return 'Ù…Ù†Ø° ' + hours + ' Ø³Ø§Ø¹Ø§Øª';
    return 'Ù…Ù†Ø° ' + hours + ' Ø³Ø§Ø¹Ø©';
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    if (days === 1) return 'Ù…Ù†Ø° ÙŠÙˆÙ…';
    if (days === 2) return 'Ù…Ù†Ø° ÙŠÙˆÙ…ÙŠÙ†';
    if (days <= 10) return 'Ù…Ù†Ø° ' + days + ' Ø£ÙŠØ§Ù…';
    return 'Ù…Ù†Ø° ' + days + ' ÙŠÙˆÙ…Ù‹Ø§';
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    if (weeks === 1) return 'Ù…Ù†Ø° Ø£Ø³Ø¨ÙˆØ¹';
    if (weeks === 2) return 'Ù…Ù†Ø° Ø£Ø³Ø¨ÙˆØ¹ÙŠÙ†';
    if (weeks <= 10) return 'Ù…Ù†Ø° ' + weeks + ' Ø£Ø³Ø§Ø¨ÙŠØ¹';
    return 'Ù…Ù†Ø° ' + weeks + ' Ø£Ø³Ø¨ÙˆØ¹Ù‹Ø§';
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    if (months === 1) return 'Ù…Ù†Ø° Ø´Ù‡Ø±';
    if (months === 2) return 'Ù…Ù†Ø° Ø´Ù‡Ø±ÙŠÙ†';
    if (months <= 10) return 'Ù…Ù†Ø° ' + months + ' Ø£Ø´Ù‡Ø±';
    return 'Ù…Ù†Ø° ' + months + ' Ø´Ù‡Ø±Ù‹Ø§';
  }
  const years = Math.floor(months / 12);
  if (years === 1) return 'Ù…Ù†Ø° Ø³Ù†Ø©';
  if (years === 2) return 'Ù…Ù†Ø° Ø³Ù†ØªÙŠÙ†';
  if (years <= 10) return 'Ù…Ù†Ø° ' + years + ' Ø³Ù†ÙˆØ§Øª';
  return 'Ù…Ù†Ø° ' + years + ' Ø³Ù†Ø©';
}

function formatExactDateTime(dateStr) {
  if (!dateStr) return '';
  try {
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return dateStr;
    const h = String(dt.getHours()).padStart(2, '0');
    const m = String(dt.getMinutes()).padStart(2, '0');
    return dt.getDate() + ' ' + ARABIC_MONTHS[dt.getMonth()] + ' ' + dt.getFullYear() + ' â€¢ ' + h + ':' + m;
  } catch(e) { return dateStr; }
}

function getRelativeTimeHtml(dateStr) {
  if (!dateStr) return '';
  return '<span class="sb-relative-time" data-pub="' + dateStr + '">' + formatRelativeTime(dateStr) + '</span>';
}

function getFreshnessBadge(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const pub = new Date(dateStr).getTime();
  if (isNaN(pub)) return '';
  const diffMs = now - pub;
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return '<span class="sb-freshness-badge">Ø¬Ø¯ÙŠØ¯</span>';
  if (hours < 24) return '<span class="sb-freshness-badge sb-freshness-recent">' + formatRelativeTime(dateStr) + '</span>';
  return '';
}

function goto(id) { window.location.href = 'article.html?id=' + escId(id); }

function getRelatedArticles(article, count) {
  count = count || 4;
  let related = [];
  if (article.tags && article.tags.length > 0) {
    const tagHits = {};
    for (const a of allArticles) {
      if (a.id === article.id) continue;
      if (!a.tags) continue;
      let score = 0;
      if (a.categoryKey === article.categoryKey || a.categoryAr === article.categoryAr) score += 3;
      for (const tag of article.tags) {
        if (a.tags.some(t => t.toLowerCase() === tag.toLowerCase())) score += 2;
        if (a.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(t.toLowerCase()))) score += 1;
      }
      if (score > 0) tagHits[a.id] = { article: a, score: score };
    }
    related = Object.values(tagHits).sort((x, y) => y.score - x.score).slice(0, count).map(x => x.article);
  }
  if (related.length < count) {
    const more = allArticles.filter(a => a.id !== article.id && !related.some(r => r.id === a.id));
    more.sort(() => Math.random() - 0.5);
    related = related.concat(more.slice(0, count - related.length));
  }
  return related;
}

function renderRelatedArticles(article) {
  const container = document.getElementById('sbRelatedArticles');
  if (!container) return '';
  const related = getRelatedArticles(article, 4);
  if (related.length === 0) return '';
  const html = related.map(a =>
    '<div class="sb-related-item" onclick="goto(\'' + escId(a.id) + '\')">' +
    (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
    '<div class="sb-related-info"><span class="sb-related-cat">' + esc(a.categoryAr) + '</span>' +
    '<h4>' + esc(a.title) + '</h4></div></div>'
  ).join('');
  container.innerHTML = '<section class="sb-related-section"><h2>Ù…Ù‚Ø§Ù„Ø§Øª Ø°Ø§Øª ØµÙ„Ø©</h2><div class="sb-related-grid">' + html + '</div></section>';
}

function renderAd(containerId, size) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (AD_CONFIG.enabled && AD_CONFIG.adsterraCodes[size]) {
    container.innerHTML = AD_CONFIG.adsterraCodes[size];
  }
}

function renderStaticAd(html, size) {
  if (AD_CONFIG.enabled && AD_CONFIG.adsterraCodes[size]) {
    return AD_CONFIG.adsterraCodes[size];
  }
  return html;
}

function injectAdsIntoBody(bodyHtml) {
  if (!bodyHtml) return '';
  const pRegex = /<p[^>]*>[\s\S]*?<\/p>/gi;
  const paragraphs = bodyHtml.match(pRegex);
  if (!paragraphs || paragraphs.length < 3) return bodyHtml;
  let result = '';
  for (let i = 0; i < paragraphs.length; i++) {
    result += paragraphs[i];
    if (i === 2) {
      result += renderStaticAd('<div class="sb-ad-inarticle sb-ad-after-p3"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">336 Ã— 280</div></div>', '336x280');
    } else if (i === Math.floor(paragraphs.length / 2)) {
      result += renderStaticAd('<div class="sb-ad-inarticle sb-ad-middle"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">336 Ã— 280</div></div>', '336x280');
    } else if (i === paragraphs.length - 2) {
      result += renderStaticAd('<div class="sb-ad-inarticle sb-ad-before-end"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">336 Ã— 280</div></div>', '336x280');
    }
  }
  return result;
}

async function loadArticle() {
  const main = document.getElementById('sbArticleMain');
  if (!main) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { main.innerHTML = '<div class="sb-container"><div class="sb-loading">âš  Ù…Ø¹Ø±Ù Ø§Ù„Ù…Ù‚Ø§Ù„ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯</div></div>'; return; }
  try {
    if (allArticles.length === 0) {
      const res = await fetch(BASE + '/articles/index.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      allArticles = Array.isArray(data) ? data : (data.articles || []);
      for (const a of allArticles) {
        a.categoryAr = getArticleCategory(a);
        a.categoryKey = getCategoryKey(a);
      }
    }
    const a = allArticles.find(art => art.id === id);
    if (!a) throw new Error('Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù‚Ø§Ù„');
    document.title = a.title + ' â€” TD Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ';
    document.querySelector('[property="og:title"]') && (document.querySelector('[property="og:title"]').content = a.title + ' â€” TD Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ');
    document.querySelector('[property="og:description"]') && (document.querySelector('[property="og:description"]').content = a.excerpt || '');
    document.querySelector('[property="og:image"]') && (document.querySelector('[property="og:image"]').content = a.image || '');
    document.querySelector('[property="og:url"]') && (document.querySelector('[property="og:url"]').content = 'https://osamaelfeky567.github.io/techdosenews/article.html?id=' + a.id);
    document.querySelector('[name="twitter:image"]') && (document.querySelector('[name="twitter:image"]').content = a.image || '');
    const tagsHtml = (a.tags || []).map(t => '<span>' + esc(t) + '</span>').join('');
    a.categoryAr = getArticleCategory(a);
    const catBadge = '<a href="category.html?cat=' + escId(a.categoryKey) + '" style="display:inline-block;background:#e0e7ff;color:var(--accent);padding:2px 10px;border-radius:4px;font-size:.75rem;font-weight:700;margin-bottom:8px;text-decoration:none">' + esc(a.categoryAr) + '</a>';
    const bodyWithAds = a.body ? injectAdsIntoBody(a.body) : '';
    main.innerHTML = '<div class="sb-container"><article class="sb-article">' +
      (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '">' : '') +
      catBadge +
      '<h1>' + esc(a.title) + '</h1>' +
      '<div class="sb-article-meta"><span>' + esc(a.source_name || a.source || 'TD Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ') + '</span><span>' + (a.readTime || 'Ù‚Ø±Ø§Ø¡Ø© Ø¯Ù‚ÙŠÙ‚Ø©') + '</span></div>' +
      '<div class="sb-article-datetime">' + formatExactDateTime(getPubDate(a)) + ' <span class="sb-article-relative">' + getRelativeTimeHtml(getPubDate(a)) + '</span></div>' +
      '<div class="sb-ad-inarticle sb-ad-after-title"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">728 Ã— 90</div></div>' +
      (a.excerpt ? '<div class="sb-article-body"><p><strong>' + esc(a.excerpt) + '</strong></p></div>' : '') +
      (bodyWithAds ? '<div class="sb-article-body">' + bodyWithAds + '</div>' : '') +
      (tagsHtml ? '<div class="sb-article-tags">' + tagsHtml + '</div>' : '') +
      '<div class="sb-ad-box sb-ad-728x90" style="margin:24px 0 0"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">728 Ã— 90</div></div>' +
      '<div class="sb-ad-box" style="min-height:250px;margin:24px 0"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">300 Ã— 250</div></div>' +
      '<div id="sbRelatedArticles"></div>' +
      '<div class="sb-article-nav"><a href="index.html">â† Ø§Ù„Ø±Ø¬ÙˆØ¹ Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</a><a href="category.html?cat=' + escId(a.categoryKey) + '">' + esc(a.categoryAr) + ' â†</a></div>' +
      '</article><aside class="sb-article-sidebar"><div class="sb-ad-box sb-ad-300x250"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">300 Ã— 250</div></div>' +
      '<div class="sb-ad-sticky"><div class="sb-ad-box sb-ad-300x600"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">300 Ã— 600</div></div></div></aside></div>';
    renderRelatedArticles(a);
    injectNewsArticleSchema(a);
  } catch(e) {
    main.innerHTML = '<div class="sb-container"><div class="sb-loading">âš  ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‚Ø§Ù„ â€” ' + e.message + '</div></div>';
  }
}

function injectNewsArticleSchema(a) {
  const pubDate = getPubDate(a) || new Date().toISOString();
  const url = 'https://osamaelfeky567.github.io/techdosenews/article.html?id=' + escId(a.id);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title,
    description: (a.excerpt || '').substring(0, 300),
    image: a.image || 'https://osamaelfeky567.github.io/techdosenews/sandbox/og-image.png',
    author: { '@type': 'Organization', name: 'TD Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ' },
    publisher: { '@type': 'Organization', name: 'TD Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ', logo: { '@type': 'ImageObject', url: 'https://osamaelfeky567.github.io/techdosenews/sandbox/og-image.png' } },
    datePublished: pubDate,
    dateModified: pubDate,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }
  };
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(el);
}

async function initCategoryPage() {
  const main = document.getElementById('sbCategoryMain');
  if (!main) return;
  const params = new URLSearchParams(window.location.search);
  const catKey = params.get('cat') || 'all';
  const catName = CATEGORY_MAP[catKey] || 'Ø§Ù„ØªÙ‚Ù†ÙŠØ©';
  document.title = catName + ' â€” TD Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ';
  try {
    const res = await fetch(BASE + '/articles/index.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    allArticles = Array.isArray(data) ? data : (data.articles || []);
    for (const a of allArticles) {
      a.categoryAr = getArticleCategory(a);
      a.categoryKey = getCategoryKey(a);
    }
    const catArticles = catKey === 'all' ? allArticles : allArticles.filter(a =>
      a.categoryKey === catKey || a.categoryAr === catName ||
      (a.tags && a.tags.some(t => TAG_CATEGORY_MAP[t] === catKey || t === catName))
    );
    const count = catArticles.length;
    const mainCats = {ai:'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',companies:'Ø´Ø±ÙƒØ§Øª',cybersecurity:'Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ',mobile:'Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©',ev:'Ø³ÙŠØ§Ø±Ø§Øª ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©'};
    const chips = Object.entries(mainCats).map(([key, name]) =>
      '<div class="sb-cat-chip' + (key === catKey ? ' sb-cat-chip-active' : '') + '" onclick="location.href=\'category.html?cat=' + key + '\'">' + name + '</div>'
    ).join('');
    const adFeed = '<div class="sb-ad-box" style="min-height:250px;margin:0 0 20px;grid-column:1/-1"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">300 Ã— 250</div></div>';
    let gridHtml = '';
    if (catArticles.length === 0) {
      gridHtml = '<div class="sb-loading">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‚Ø§Ù„Ø§Øª ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ØªØµÙ†ÙŠÙ</div>';
    } else {
      const items = catArticles.slice(0, 20);
      for (let i = 0; i < items.length; i++) {
        const a = items[i];
        gridHtml += '<div class="sb-card" onclick="goto(\'' + escId(a.id) + '\')">' +
          (a.image ? '<img src="' + a.image + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
          '<div class="sb-card-body"><div class="sb-card-cat">' + esc(a.categoryAr) + '</div>' +
          '<h3>' + esc(a.title) + '</h3>' +
          (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
          '<div class="sb-card-meta"><span>' + esc(a.source_name || a.source || 'TD Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ') + '</span><span>' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div></div>';
        if ((i + 1) % 8 === 0 && i + 1 < items.length) {
          gridHtml += adFeed;
        }
      }
    }
    main.innerHTML = '<div class="sb-container">' +
      '<div class="sb-ad-box sb-ad-728x90"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">728 Ã— 90</div></div>' +
      '<div class="sb-category-header"><h1>' + esc(catName) + '</h1><span class="sb-category-count">' + count + ' Ù…Ù‚Ø§Ù„</span></div>' +
      '<div class="sb-category-chips">' + chips + '</div>' +
      '<div class="sb-grid">' + gridHtml + '</div>' +
      '<div class="sb-ad-box sb-ad-728x90"><div class="sb-ad-label">Ø¥Ø¹Ù„Ø§Ù†</div><div class="sb-ad-placeholder">728 Ã— 90</div></div></div>';
  } catch(e) {
    main.innerHTML = '<div class="sb-container"><div class="sb-loading">âš  ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØµÙ†ÙŠÙ â€” ' + e.message + '</div></div>';
  }
}

const ANALYTICS_KEY = 'td_analytics';
function trackEvent(category, action, label) {
  try {
    let data = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    data.push({ cat: category, action: action, label: label, ts: Date.now() });
    if (data.length > 10000) data = data.slice(-5000);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch(e) {}
}
function trackAdImpression(size) { trackEvent('Ad', 'impression', size); }
function trackAdClick(size) { trackEvent('Ad', 'click', size); }
function trackPageView(page) { trackEvent('Page', 'view', page); }
function trackArticleView(id, title) { trackEvent('Article', 'view', id); }

function initAnalytics() {
  trackPageView(window.location.pathname);
}

function initAnalyticsDashboard() {
  const container = document.getElementById('sbAnalyticsDashboard');
  if (!container) return;
  try {
    const raw = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    const totalViews = raw.filter(e => e.cat === 'Page' && e.action === 'view').length;
    const articleViews = raw.filter(e => e.cat === 'Article').length;
    const adImpressions = raw.filter(e => e.action === 'impression').length;
    const adClicks = raw.filter(e => e.action === 'click').length;
    const ctr = adImpressions > 0 ? ((adClicks / adImpressions) * 100).toFixed(2) : '0.00';
    const estRevenue = (adImpressions * 0.002).toFixed(2);
    const rpm = totalViews > 0 ? ((estRevenue / totalViews) * 1000).toFixed(2) : '0.00';
    container.innerHTML =
      '<div class="sb-analytics-grid">' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">' + totalViews + '</span><span class="sb-analytics-label">Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„ØµÙØ­Ø§Øª</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">' + articleViews + '</span><span class="sb-analytics-label">Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">' + adImpressions + '</span><span class="sb-analytics-label">Ø¸Ù‡ÙˆØ± Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">' + adClicks + '</span><span class="sb-analytics-label">Ù†Ù‚Ø±Ø§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">' + ctr + '%</span><span class="sb-analytics-label">Ù†Ø³Ø¨Ø© Ø§Ù„Ù†Ù‚Ø± (CTR)</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">$' + estRevenue + '</span><span class="sb-analytics-label">Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª Ø§Ù„Ù…Ù‚Ø¯Ø±Ø©</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">$' + rpm + '</span><span class="sb-analytics-label"> RPM</span></div>' +
      '</div>';
    const recent = raw.slice(-20).reverse();
    if (recent.length > 0) {
      container.innerHTML += '<div class="sb-analytics-log"><h3>Ø¢Ø®Ø± Ø§Ù„Ø£Ø­Ø¯Ø§Ø«</h3>' +
        recent.map(e => '<div class="sb-analytics-entry"><span>' + e.cat + '</span><span>' + e.action + '</span><span class="sb-analytics-ago">' + Math.floor((Date.now() - e.ts) / 60000) + ' Ø¯Ù‚Ø§Ø¦Ù‚</span></div>').join('') +
        '</div>';
    }
  } catch(e) {
    container.innerHTML = '<div class="sb-loading">âš  ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª</div>';
  }
}

if (document.getElementById('sbGrid')) { loadIndex(); setInterval(function() { updateLastUpdate(); renderRelativeTimes(); }, 60000); updateLastUpdate(); }
if (document.getElementById('sbArticleMain')) { loadArticle(); initAnalytics(); }
if (document.getElementById('sbCategoryMain')) { initCategoryPage(); initAnalytics(); }
if (document.getElementById('sbAnalyticsDashboard')) { initAnalyticsDashboard(); }
