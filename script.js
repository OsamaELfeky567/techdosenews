const BASE = '/techdosenews/data';
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
  ai:'الذكاء الاصطناعي',companies:'شركات',cybersecurity:'أمن سيبراني',
  mobile:'هواتف ذكية',ev:'سيارات كهربائية',
  security:'أمن سيبراني',business:'شركات',startups:'شركات',
  bigtech:'شركات',software:'شركات',cloud:'شركات',
  hardware:'شركات',consumer:'هواتف ذكية',gaming:'هواتف ذكية',
  AI:'الذكاء الاصطناعي',AI_ar:'الذكاء الاصطناعي',
  'Big-Tech':'شركات','big-tech':'شركات',BigTech:'شركات',
  Security:'أمن سيبراني',Startups:'شركات',
  Mobile:'هواتف ذكية',Hardware:'شركات',Gaming:'هواتف ذكية',
  Science:'الذكاء الاصطناعي',Business:'شركات',Cloud:'شركات',
  'تكنولوجيا':'شركات','تقنية':'شركات',
  'Electric Vehicles':'سيارات كهربائية',
  'شركات تقنية':'شركات','الأمن السيبراني':'أمن سيبراني',
  'تطوير':'تطوير',
  EV:'سيارات كهربائية',ev:'سيارات كهربائية'
};

const TAG_CATEGORY_MAP = {
  'تكنولوجيا':'companies','تقنية':'companies','ذكاء اصطناعي':'ai',
  'أمن سيبراني':'cybersecurity','أمان':'cybersecurity',
  'هواتف':'mobile','mobile':'mobile','Mobile':'mobile',
  'أعمال':'companies','business':'companies','Business':'companies',
  'شركات':'companies','startups':'companies','Startups':'companies',
  'برمجيات':'companies','software':'companies',
  'سحابة':'companies','cloud':'companies',
  'عتاد':'companies','hardware':'companies',
  'سيارات':'ev','EV':'ev','سيارات كهربائية':'ev',
  'ai':'ai','AI':'ai','security':'cybersecurity',
  'Security':'cybersecurity','cybersecurity':'cybersecurity',
  'gaming':'mobile','Gaming':'mobile',
  'science':'ai','Science':'ai',
  'روبوتات':'ai','robotics':'ai','فضاء':'ai',
  'bigtech':'companies','big-tech':'companies','BigTech':'companies',
  'Big-Tech':'companies','أبحاث':'ai','research':'ai'
};

const ENTITY_IMAGES = {
  openai:'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  google:'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&q=80',
  apple:'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
  microsoft:'https://images.unsplash.com/photo-1642132652075-7f2f0ab8f1b0?w=800&q=80',
  nvidia:'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
  samsung:'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80',
  tesla:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  meta:'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80',
  amazon:'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&q=80',
  deepmind:'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  anthropic:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  twitter:'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80',
  cybersecurity:'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
  ai:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  mobile:'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
  ev:'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
  companies:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  default:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80'
};
const ENTITY_KEYWORDS = [
  [['openai','chatgpt','gpt-4','gpt4','o1','o3','sora','sam altman'],'openai'],
  [['google','gemini','deepmind','gmail','android','pixel','youtube','chrome','waymo'],'google'],
  [['apple','iphone','ipad','macbook','tim cook','siri','ios','vision pro','app store'],'apple'],
  [['microsoft','windows','azure','copilot','satya','office 365','linkedin','github','xbox'],'microsoft'],
  [['nvidia','jensen','geforce','rtx','cuda','titan'],'nvidia'],
  [['samsung','galaxy','bixby','one ui'],'samsung'],
  [['tesla','cybertruck','model 3','model y','elon musk','full self-driving','fsd','autopilot'],'tesla'],
  [['meta','facebook','instagram','whatsapp','threads','zuckerberg','oculus','quest'],'meta'],
  [['amazon','aws','alexa','prime','kindle','jeff bezos','ring'],'amazon'],
  [['anthropic','claude','dario'],'anthropic'],
  [['twitter','x.com','x corp','tweet','xai','grok'],'twitter'],
  [['أمن سيبراني','cybersecurity','hacking','ransomware','اختراق','فيروس','breach','vulnerability','zero-day'],'cybersecurity']
];
function resolveImage(a) {
  if (!a) return ENTITY_IMAGES.default;
  const tagsStr = Array.isArray(a.tags) ? a.tags.join(' ') : (typeof a.tags === 'string' ? a.tags.replace(/,/g,' ') : '');
  const text = ((a.title||'')+' '+(a.source||'')+' '+(a.source_name||'')+' '+tagsStr).toLowerCase();
  for (const [keywords,entity] of ENTITY_KEYWORDS) {
    for (const kw of keywords) {
      if (text.includes(kw)) return ENTITY_IMAGES[entity];
    }
  }
  if (a.categoryAr) {
    const catLower = a.categoryAr.toLowerCase();
    if (catLower.includes('ذكاء اصطناعي')) return ENTITY_IMAGES.ai;
    if (catLower.includes('أمن')||catLower.includes('سيبراني')) return ENTITY_IMAGES.cybersecurity;
    if (catLower.includes('هواتف')||catLower.includes('جوال')||catLower.includes('موبايل')) return ENTITY_IMAGES.mobile;
    if (catLower.includes('سيارات')||catLower.includes('كهرب')) return ENTITY_IMAGES.ev;
    if (catLower.includes('شركات')||catLower.includes('اعمال')||catLower.includes('تقنية')||catLower.includes('تكنولوجيا')) return ENTITY_IMAGES.companies;
  }
  if (a.image && !a.image.includes('photo-1518770660439-4636190af475')) return a.image;
  return ENTITY_IMAGES.default;
}

const ARABIC_DAYS = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

const COMPANIES = [
  {sym:'أوب',name:'أوبن‌إيه‌آي'},
  {sym:'إن‌ف',name:'إنفيديا'},
  {sym:'أن',name:'أنثروبيك'},
  {sym:'جوج',name:'جوجل'},
  {sym:'ميك',name:'مايكروسوفت'},
  {sym:'ميت',name:'ميتا'}
];

function getArticleCategory(article) {
  if (article.category && CATEGORY_MAP[article.category]) {
    return CATEGORY_MAP[article.category];
  }
  if (Array.isArray(article.tags) && article.tags.length > 0) {
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
  if (Array.isArray(article.tags) && article.tags.length > 0) {
    for (const tag of article.tags) {
      const mappedKey = TAG_CATEGORY_MAP[tag];
      if (mappedKey && mappedKey !== tag) return mappedKey;
    }
  }
  return 'تقنية';
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
      if (el) el.innerHTML = '<div class="sb-loading">⚠ تعذر تحميل المقالات — ' + e.message + '</div>';
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
    if (candidate.image && candidate.categoryAr && candidate.categoryAr !== 'التقنية' && candidate.categoryAr !== 'عام') {
      a = candidate;
      break;
    }
  }
  if (!a) a = sorted[0];
  const pubDate = getPubDate(a);
  hero.innerHTML = '<div tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
    '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
    '<div class="sb-hero-overlay"><div class="sb-cat-badge">' + esc(a.categoryAr) + '</div>' +
    getFreshnessBadge(pubDate) +
    '<h2>' + esc(a.title) + '</h2>' +
    (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
    '<div class="sb-hero-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + getRelativeTimeHtml(pubDate) + '</span></div></div></div>';
}

function renderTrending() {
  const list = document.getElementById('sbTrendingList');
  if (!list) return;
  const items = allArticles.slice(0, 5);
  list.innerHTML = items.map((a, i) => {
    const num = String(i + 1).padStart(2, '0');
    return '<div class="sb-trending-item" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
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
    return '<div class="sb-latest-item" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
      '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
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
    return '<div class="sb-latest-item" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
      '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<div class="sb-latest-info"><span class="sb-latest-cat">' + esc(a.categoryAr) + '</span>' +
      '<h4>' + esc(a.title) + '</h4>' +
      '<span class="sb-latest-date">' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div>';
  }).join('');
}

function renderGrid() {
  const grid = document.getElementById('sbGrid');
  const loadMoreContainer = document.getElementById('sbLoadMoreContainer');
  if (!grid) return;
  const items = filteredArticles;
  if (items.length === 0) {
    grid.innerHTML = '<div class="sb-empty-state">لا توجد مقالات متطابقة</div>';
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
  const ad = '<div class="sb-ad-box" style="min-height:250px;margin:0 0 20px;grid-column:1/-1"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">300 × 250</div></div>';
  for (let i = start; i < end; i++) {
    const a = items[i];
    const card = document.createElement('div');
    card.className = 'sb-card';
    card.style.animation = 'sbFadeIn 0.3s ease';
    card.tabIndex = 0;
    card.role = 'button';
    card.onclick = function() { goto(a.id); };
    card.onkeydown = function(e) { if (e.key === 'Enter' || e.key === 'Space') { e.preventDefault(); this.click(); } };
    let cardHtml = '';
    cardHtml += '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" onerror="this.style.display=\'none\'">';
    cardHtml += '<div class="sb-card-body"><div class="sb-card-cat">' + esc(a.categoryAr) + '</div>' +
      '<h3>' + esc(a.title) + '</h3>' +
      (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
      '<div class="sb-card-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div>';
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
      loadMoreContainer.innerHTML = '<button class="sb-load-more-btn" onclick="loadMore()">المزيد من الأخبار</button>';
    } else {
      loadMoreContainer.innerHTML = '';
    }
  }
}

function loadMore() {
  appendGridItems();
  const btn = document.querySelector('.sb-load-more-btn');
  if (btn) {
    btn.textContent = 'جارٍ التحميل...';
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
  const mainCats = {ai:'الذكاء الاصطناعي',companies:'شركات',cybersecurity:'أمن سيبراني',mobile:'هواتف ذكية',ev:'سيارات كهربائية'};
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
    return '<div class="sb-most-read-item" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
      '<span class="sb-most-read-num">' + (i + 1) + '</span>' +
      '<div class="sb-most-read-info"><span class="sb-most-read-cat">' + esc(a.categoryAr) + '</span>' +
      '<h4>' + esc(a.title) + '</h4></div></div>';
  }).join('');
}

function renderFooterCats() {
  const list = document.getElementById('sbFooterCategories');
  if (!list) return;
  const mainCats = {ai:'الذكاء الاصطناعي',companies:'شركات',cybersecurity:'أمن سيبراني',mobile:'هواتف ذكية',ev:'سيارات كهربائية'};
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
      (Array.isArray(a.tags) && a.tags.some(t => TAG_CATEGORY_MAP[t] === cat || t === catName))
    );
  }
  document.querySelectorAll('.sb-nav a').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === cat);
  });
  renderGrid();
  closeMenu();
  window.scrollTo({top: document.getElementById('sbGrid')?.offsetTop - 80 || 0, behavior: 'smooth'});
}

let searchTimer;
function filterSearch(query) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function() {
    if (!query.trim()) {
      filteredArticles = [...allArticles];
    } else {
      const q = query.trim().toLowerCase();
      filteredArticles = allArticles.filter(a =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        (a.categoryAr && a.categoryAr.toLowerCase().includes(q)) ||
        (Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    renderGrid();
    const countEl = document.getElementById('sbSearchCount');
    if (countEl) {
      countEl.textContent = filteredArticles.length === allArticles.length ? '' : 'نتائج البحث: ' + filteredArticles.length + ' مقال';
    }
    const grid = document.getElementById('sbGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 250);
}

function toggleMenu() {
  const nav = document.getElementById('sbNav');
  const overlay = document.getElementById('sbOverlay');
  const btn = document.querySelector('.sb-menu-btn');
  const isOpen = nav.classList.toggle('open');
  overlay.classList.toggle('show');
  if (btn) btn.setAttribute('aria-expanded', isOpen);
}

function closeMenu() {
  document.getElementById('sbNav').classList.remove('open');
  document.getElementById('sbOverlay').classList.remove('show');
  const btn = document.querySelector('.sb-menu-btn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
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

function handleKeydown(e) {
  if (e.key === 'Escape') {
    const nav = document.getElementById('sbNav');
    if (nav && nav.classList.contains('open')) closeMenu();
    const bar = document.getElementById('sbSearchBar');
    if (bar && bar.classList.contains('show')) closeSearch();
  }
}
document.addEventListener('keydown', handleKeydown);

function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
function escId(id) { return encodeURIComponent(id || ''); }

function formatDate(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return ARABIC_DAYS[dt.getDay()] + '، ' + dt.getDate() + ' ' + ARABIC_MONTHS[dt.getMonth()] + ' ' + dt.getFullYear();
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
  if (diffMs < 0) return 'الآن';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) {
    if (mins === 1) return 'منذ دقيقة';
    if (mins === 2) return 'منذ دقيقتين';
    if (mins <= 10) return 'منذ ' + mins + ' دقائق';
    return 'منذ ' + mins + ' دقيقة';
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    if (hours === 1) return 'منذ ساعة';
    if (hours === 2) return 'منذ ساعتين';
    if (hours <= 10) return 'منذ ' + hours + ' ساعات';
    return 'منذ ' + hours + ' ساعة';
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    if (days === 1) return 'منذ يوم';
    if (days === 2) return 'منذ يومين';
    if (days <= 10) return 'منذ ' + days + ' أيام';
    return 'منذ ' + days + ' يومًا';
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    if (weeks === 1) return 'منذ أسبوع';
    if (weeks === 2) return 'منذ أسبوعين';
    if (weeks <= 10) return 'منذ ' + weeks + ' أسابيع';
    return 'منذ ' + weeks + ' أسبوعًا';
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    if (months === 1) return 'منذ شهر';
    if (months === 2) return 'منذ شهرين';
    if (months <= 10) return 'منذ ' + months + ' أشهر';
    return 'منذ ' + months + ' شهرًا';
  }
  const years = Math.floor(months / 12);
  if (years === 1) return 'منذ سنة';
  if (years === 2) return 'منذ سنتين';
  if (years <= 10) return 'منذ ' + years + ' سنوات';
  return 'منذ ' + years + ' سنة';
}

function formatExactDateTime(dateStr) {
  if (!dateStr) return '';
  try {
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return dateStr;
    const h = String(dt.getHours()).padStart(2, '0');
    const m = String(dt.getMinutes()).padStart(2, '0');
    return dt.getDate() + ' ' + ARABIC_MONTHS[dt.getMonth()] + ' ' + dt.getFullYear() + ' • ' + h + ':' + m;
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
  if (hours < 1) return '<span class="sb-freshness-badge">جديد</span>';
  if (hours < 24) return '<span class="sb-freshness-badge sb-freshness-recent">' + formatRelativeTime(dateStr) + '</span>';
  return '';
}

function goto(id) { window.location.href = 'article.html?id=' + escId(id); }

function getRelatedArticles(article, count) {
  count = count || 4;
  let related = [];
  const articleTags = Array.isArray(article.tags) ? article.tags : [];
  if (articleTags.length > 0) {
    const tagHits = {};
    for (const a of allArticles) {
      if (a.id === article.id) continue;
      const aTags = Array.isArray(a.tags) ? a.tags : [];
      if (aTags.length === 0) continue;
      let score = 0;
      if (a.categoryKey === article.categoryKey || a.categoryAr === article.categoryAr) score += 3;
      for (const tag of articleTags) {
        if (aTags.some(t => t.toLowerCase() === tag.toLowerCase())) score += 2;
        if (aTags.some(t => t.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(t.toLowerCase()))) score += 1;
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
    '<div class="sb-related-item" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
    '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
    '<div class="sb-related-info"><span class="sb-related-cat">' + esc(a.categoryAr) + '</span>' +
    '<h4>' + esc(a.title) + '</h4></div></div>'
  ).join('');
  container.innerHTML = '<section class="sb-related-section"><h2>مقالات ذات صلة</h2><div class="sb-related-grid">' + html + '</div></section>';
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
      result += renderStaticAd('<div class="sb-ad-inarticle sb-ad-after-p3"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">336 × 280</div></div>', '336x280');
    } else if (i === Math.floor(paragraphs.length / 2)) {
      result += renderStaticAd('<div class="sb-ad-inarticle sb-ad-middle"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">336 × 280</div></div>', '336x280');
    } else if (i === paragraphs.length - 2) {
      result += renderStaticAd('<div class="sb-ad-inarticle sb-ad-before-end"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">336 × 280</div></div>', '336x280');
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
    if (!a) throw new Error('لم يتم العثور على المقال');
    document.title = a.title + ' — TD بالعربي';
    document.querySelector('[property="og:title"]') && (document.querySelector('[property="og:title"]').content = a.title + ' — TD بالعربي');
    document.querySelector('[property="og:description"]') && (document.querySelector('[property="og:description"]').content = a.excerpt || '');
    document.querySelector('[property="og:image"]') && (document.querySelector('[property="og:image"]').content = resolveImage(a));
    document.querySelector('[property="og:url"]') && (document.querySelector('[property="og:url"]').content = 'https://osamaelfeky567.github.io/techdosenews/article.html?id=' + a.id);
    document.querySelector('[name="twitter:image"]') && (document.querySelector('[name="twitter:image"]').content = resolveImage(a));
    const tagsArr = Array.isArray(a.tags) ? a.tags : [];
    const tagsHtml = tagsArr.map(t => '<span>' + esc(t) + '</span>').join('');
    a.categoryAr = getArticleCategory(a);
    const catBadge = '<a href="category.html?cat=' + escId(a.categoryKey) + '" style="display:inline-block;background:#e0e7ff;color:var(--accent);padding:2px 10px;border-radius:4px;font-size:.75rem;font-weight:700;margin-bottom:8px;text-decoration:none">' + esc(a.categoryAr) + '</a>';
    const bodyWithAds = a.body ? injectAdsIntoBody(a.body) : '';
    main.innerHTML = '<div class="sb-container"><article class="sb-article">' +
      '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" onerror="this.style.display=\'none\'">' +
      catBadge +
      '<h1>' + esc(a.title) + '</h1>' +
      '<div class="sb-article-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + (a.readTime || 'قراءة دقيقة') + '</span></div>' +
      '<div class="sb-article-datetime">' + formatExactDateTime(getPubDate(a)) + ' <span class="sb-article-relative">' + getRelativeTimeHtml(getPubDate(a)) + '</span></div>' +
      '<div class="sb-ad-inarticle sb-ad-after-title"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">728 × 90</div></div>' +
      (a.excerpt ? '<div class="sb-article-body"><p><strong>' + esc(a.excerpt) + '</strong></p></div>' : '') +
      (bodyWithAds ? '<div class="sb-article-body">' + bodyWithAds + '</div>' : '') +
      (tagsHtml ? '<div class="sb-article-tags">' + tagsHtml + '</div>' : '') +
      '<div class="sb-ad-box sb-ad-728x90" style="margin:24px 0 0"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">728 × 90</div></div>' +
      '<div class="sb-ad-box" style="min-height:250px;margin:24px 0"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">300 × 250</div></div>' +
      '<div id="sbRelatedArticles"></div>' +
      '<div class="sb-article-nav"><a href="index.html">← الرجوع للرئيسية</a><a href="category.html?cat=' + escId(a.categoryKey) + '">' + esc(a.categoryAr) + ' ←</a></div>' +
      '</article><aside class="sb-article-sidebar"><div class="sb-ad-box sb-ad-300x250"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">300 × 250</div></div>' +
      '<div class="sb-ad-sticky"><div class="sb-ad-box sb-ad-300x600"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">300 × 600</div></div></div></aside></div>';
    renderRelatedArticles(a);
    injectNewsArticleSchema(a);
  } catch(e) {
    main.innerHTML = '<div class="sb-container"><div class="sb-loading">⚠ تعذر تحميل المقال — ' + e.message + '</div></div>';
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
    image: resolveImage(a),
    author: { '@type': 'Organization', name: 'TD بالعربي' },
    publisher: { '@type': 'Organization', name: 'TD بالعربي', logo: { '@type': 'ImageObject', url: 'https://osamaelfeky567.github.io/techdosenews/sandbox/og-image.png' } },
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
  const catName = CATEGORY_MAP[catKey] || 'التقنية';
  document.title = catName + ' — TD بالعربي';
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
      (Array.isArray(a.tags) && a.tags.some(t => TAG_CATEGORY_MAP[t] === catKey || t === catName))
    );
    const count = catArticles.length;
    const mainCats = {ai:'الذكاء الاصطناعي',companies:'شركات',cybersecurity:'أمن سيبراني',mobile:'هواتف ذكية',ev:'سيارات كهربائية'};
    const chips = Object.entries(mainCats).map(([key, name]) =>
      '<div class="sb-cat-chip' + (key === catKey ? ' sb-cat-chip-active' : '') + '" onclick="location.href=\'category.html?cat=' + key + '\'">' + name + '</div>'
    ).join('');
    const adFeed = '<div class="sb-ad-box" style="min-height:250px;margin:0 0 20px;grid-column:1/-1"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">300 × 250</div></div>';
    let gridHtml = '';
    if (catArticles.length === 0) {
      gridHtml = '<div class="sb-empty-state">لا توجد مقالات في هذا التصنيف</div>';
    } else {
      const items = catArticles.slice(0, 20);
      for (let i = 0; i < items.length; i++) {
        const a = items[i];
        gridHtml += '<div class="sb-card" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
          '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
          '<div class="sb-card-body"><div class="sb-card-cat">' + esc(a.categoryAr) + '</div>' +
          '<h3>' + esc(a.title) + '</h3>' +
          (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
          '<div class="sb-card-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div></div>';
        if ((i + 1) % 8 === 0 && i + 1 < items.length) {
          gridHtml += adFeed;
        }
      }
    }
    main.innerHTML = '<div class="sb-container">' +
      '<div class="sb-ad-box sb-ad-728x90"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">728 × 90</div></div>' +
      '<div class="sb-category-header"><h1>' + esc(catName) + '</h1><span class="sb-category-count">' + count + ' مقال</span></div>' +
      '<div class="sb-category-chips">' + chips + '</div>' +
      '<div class="sb-grid">' + gridHtml + '</div>' +
      '<div class="sb-ad-box sb-ad-728x90"><div class="sb-ad-label">إعلان</div><div class="sb-ad-placeholder">728 × 90</div></div></div>';
  } catch(e) {
    main.innerHTML = '<div class="sb-container"><div class="sb-loading">⚠ تعذر تحميل التصنيف — ' + e.message + '</div></div>';
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
      '<div class="sb-analytics-card"><span class="sb-analytics-num">' + totalViews + '</span><span class="sb-analytics-label">مشاهدة الصفحات</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">' + articleViews + '</span><span class="sb-analytics-label">مشاهدة المقالات</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">' + adImpressions + '</span><span class="sb-analytics-label">ظهور الإعلانات</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">' + adClicks + '</span><span class="sb-analytics-label">نقرات الإعلانات</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">' + ctr + '%</span><span class="sb-analytics-label">نسبة النقر (CTR)</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">$' + estRevenue + '</span><span class="sb-analytics-label">الإيرادات المقدرة</span></div>' +
      '<div class="sb-analytics-card"><span class="sb-analytics-num">$' + rpm + '</span><span class="sb-analytics-label"> RPM</span></div>' +
      '</div>';
    const recent = raw.slice(-20).reverse();
    if (recent.length > 0) {
      container.innerHTML += '<div class="sb-analytics-log"><h3>آخر الأحداث</h3>' +
        recent.map(e => '<div class="sb-analytics-entry"><span>' + e.cat + '</span><span>' + e.action + '</span><span class="sb-analytics-ago">' + Math.floor((Date.now() - e.ts) / 60000) + ' دقائق</span></div>').join('') +
        '</div>';
    }
  } catch(e) {
    container.innerHTML = '<div class="sb-loading">⚠ تعذر تحميل التحليلات</div>';
  }
}

if (document.getElementById('sbGrid')) { loadIndex(); setInterval(function() { updateLastUpdate(); renderRelativeTimes(); }, 60000); updateLastUpdate(); }
if (document.getElementById('sbArticleMain')) { loadArticle(); initAnalytics(); }
if (document.getElementById('sbCategoryMain')) { initCategoryPage(); initAnalytics(); }
if (document.getElementById('sbAnalyticsDashboard')) { initAnalyticsDashboard(); }
