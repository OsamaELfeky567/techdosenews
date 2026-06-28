const BASE = '/techdosenews/data';

/* ── Dark Mode ── */
function toggleTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('sbThemeToggle');
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    html.removeAttribute('data-theme');
    localStorage.setItem('td-theme', 'light');
    if (btn) btn.textContent = '🌙';
  } else {
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('td-theme', 'dark');
    if (btn) btn.textContent = '☀️';
  }
}
function initTheme() {
  const btn = document.getElementById('sbThemeToggle');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.textContent = isDark ? '☀️' : '🌙';
}
document.addEventListener('DOMContentLoaded', initTheme);

/* ── Telegram Config ── */
let TELEGRAM_CONFIG = null;
function getTelegramUrl() {
  const mode = TELEGRAM_CONFIG?.telegram_mode || 'redirect';
  if (mode === 'direct') return TELEGRAM_CONFIG?.telegram_channel || 'https://t.me/td_arabi';
  if (TELEGRAM_CONFIG?.telegram_redirect) return TELEGRAM_CONFIG.telegram_redirect;
  if (TELEGRAM_CONFIG?.telegram_channel) return TELEGRAM_CONFIG.telegram_channel;
  return 'https://t.me/td_arabi';
}
async function loadTelegramConfig() {
  try {
    const url = 'https://raw.githubusercontent.com/osamaelfeky567/techdosenews/main/admin_config.json?t=' + Date.now();
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const cfg = await res.json();
    TELEGRAM_CONFIG = {
      telegram_channel: cfg.telegram_channel || 'https://t.me/td_arabi',
      telegram_redirect: cfg.telegram_redirect || cfg.telegram || '',
      telegram_mode: cfg.telegram_mode || 'redirect'
    };
  } catch (e) {
    TELEGRAM_CONFIG = {
      telegram_channel: 'https://t.me/td_arabi',
      telegram_redirect: 'https://td-arabi-redirect.blogspot.com/',
      telegram_mode: 'redirect'
    };
  }
  const url = getTelegramUrl();
  document.querySelectorAll('.sb-telegram-btn').forEach(el => { el.href = url; });
  document.addEventListener('click', function(e) {
    if (e.target.closest('.sb-telegram-btn') && typeof gtag === 'function') gtag('event', 'telegram_click');
  });
}
document.addEventListener('DOMContentLoaded', loadTelegramConfig);

/* ── Adsterra Ad Helper ── */
function createAdsterra(key, format, height, width) {
  const div = document.createElement('div');
  div.className = 'ad-container ad-rectangle';
  div.style.cssText = 'text-align:center;margin:20px auto;max-width:' + width + 'px';
  const label = document.createElement('div');
  label.className = 'sb-ad-label';
  label.textContent = 'إعلان';
  div.appendChild(label);
  const s1 = document.createElement('script');
  s1.text = 'atOptions = { "key" : "' + key + '", "format" : "' + format + '", "height" : ' + height + ', "width" : ' + width + ', "params" : {} };';
  div.appendChild(s1);
  const s2 = document.createElement('script');
  s2.src = 'https://www.highperformanceformat.com/' + key + '/invoke.js';
  s2.async = true;
  div.appendChild(s2);
  return div;
}

let allArticles = [];
let filteredArticles = [];
let activeTag = null;
const PAGE_SIZE = 9;
let gridRenderedCount = 0;

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
  if (a.image_url && a.image_url.trim() && a.image_url.includes('raw.githubusercontent.com')) return a.image_url;
  if (a.image && a.image.trim() && a.image.includes('raw.githubusercontent.com')) return a.image;
  const tagsStr = Array.isArray(a.tags) ? a.tags.join(' ') : (typeof a.tags === 'string' ? a.tags.replace(/,/g,' ') : '');
  const text = ((a.title||'')+' '+(a.source||'')+' '+(a.source_name||'')+' '+tagsStr).toLowerCase();
  for (const [keywords,entity] of ENTITY_KEYWORDS) {
    for (const kw of keywords) {
      if (text.includes(kw)) return ENTITY_IMAGES[entity];
    }
  }
  if (a.image && !a.image.includes('photo-1518770660439-4636190af475')) return a.image;
  return ENTITY_IMAGES.default;
}

const ARABIC_DAYS = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

/* ── Skeleton Loading ── */
function showSkeleton() {
  ['sbHeroSkeleton','sbLatestSkeleton','sbTrendingSkeleton','sbMostReadSkeleton','sbGridSkeleton'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = '';
  });
}
function hideSkeleton() {
  ['sbHeroSkeleton','sbLatestSkeleton','sbTrendingSkeleton','sbMostReadSkeleton','sbGridSkeleton'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

/* ── IntersectionObserver for Images ── */
function observeImages(container) {
  if (!container || !window.IntersectionObserver) return;
  var imgs = container.querySelectorAll('img[data-src]');
  if (!imgs.length) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  imgs.forEach(function(img) { obs.observe(img); });
}

/* ── Data Fetching ── */
async function fetchIndex() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) spinner.style.display = 'block';
  showSkeleton();
  const url = 'https://raw.githubusercontent.com/osamaelfeky567/techdosenews/main/data/articles/index.json?t=' + Date.now();
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function loadIndex() {
  try {
    const data = await fetchIndex();
    allArticles = Array.isArray(data) ? data : (data.articles || []);
    allArticles = allArticles.filter(a => a.status === 'published');
    if (allArticles.length === 0) throw new Error('No articles');
    allArticles.sort(function(a, b) { return new Date(getPubDate(b) || 0) - new Date(getPubDate(a) || 0); });
    applyTagFilter();
    renderAll();
    hideSkeleton();
  } catch(e) {
    hideSkeleton();
    document.querySelectorAll('.sb-loading, #sbGrid, #sbHero, #sbTrendingList, #sbLatestList').forEach(el => {
      if (el) el.innerHTML = '<div style="text-align:center;padding:60px 20px"><div style="font-size:48px;margin-bottom:15px;">⚠️</div><h2 style="margin-bottom:10px;">تعذر تحميل الأخبار</h2><p>يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى</p><button onclick="location.reload()" style="margin-top:20px;background:var(--accent,#2563eb);color:#fff;border:none;padding:10px 25px;border-radius:6px;cursor:pointer;font-size:14px">إعادة المحاولة</button></div>';
    });
  } finally {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
  }
}

function applyTagFilter() {
  if (activeTag) {
    filteredArticles = allArticles.filter(a =>
      Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase() === activeTag.toLowerCase())
    );
  } else {
    filteredArticles = [...allArticles];
  }
}

function renderAll() {
  renderHero();
  renderHeroSecondary();
  renderLatest();
  renderTrending();
  renderTagCloud();
  renderGrid();
  renderMostRead();
  renderFooterTags();
  updateLastUpdate();
  renderRelativeTimes();
}

function countTags() {
  const counts = {};
  for (const a of allArticles) {
    if (Array.isArray(a.tags)) {
      for (const t of a.tags) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
  }
  return counts;
}

function renderTagCloud() {
  const container = document.getElementById('sbTagCloud');
  if (!container) return;
  const counts = countTags();
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top10 = sorted.slice(0, 10);
  if (top10.length === 0) { container.style.display = 'none'; return; }
  const maxCount = top10[0][1];
  container.innerHTML = top10.map(([tag, count]) => {
    const weight = 0.7 + (count / maxCount) * 0.5;
    const cls = activeTag === tag ? 'sb-tag-pill sb-tag-active' : 'sb-tag-pill';
    return '<span class="' + cls + '" style="font-size:' + weight + 'rem" onclick="filterByTag(\'' + escAttr(tag) + '\')" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\')this.click()">' + esc(tag) + '</span>';
  }).join('');
}

function renderHero() {
  const hero = document.getElementById('sbHero');
  if (!hero || allArticles.length === 0) return;
  const a = allArticles[0];
  const pubDate = getPubDate(a);
  const tagsHtml = Array.isArray(a.tags) && a.tags.length > 0
    ? a.tags.slice(0, 3).map(t => '<span class="sb-tag-pill sb-tag-pill-sm" onclick="event.stopPropagation();filterByTag(\'' + escAttr(t) + '\')" role="button">' + esc(t) + '</span>').join('')
    : '';
  hero.innerHTML = '<div tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
    '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" decoding="async" width="800" height="480" onerror="this.style.display=\'none\'">' +
    '<div class="sb-hero-overlay">' +
    getFreshnessBadge(pubDate) +
    '<h2>' + esc(a.title) + '</h2>' +
    (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
    '<div class="sb-hero-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + getRelativeTimeHtml(pubDate) + '</span></div>' +
    (tagsHtml ? '<div class="sb-hero-tags">' + tagsHtml + '</div>' : '') +
    '</div></div>';
}

function renderHeroSecondary() {
  const container = document.getElementById('sbHeroSecondary');
  if (!container || allArticles.length < 3) return;
  const items = allArticles.slice(1, 3);
  container.innerHTML = items.map(a => {
    const pubDate = getPubDate(a);
    return '<div class="sb-hero-secondary-item" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
      '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" decoding="async" width="400" height="240" onerror="this.style.display=\'none\'">' +
      '<div class="sb-hero-overlay">' +
      getFreshnessBadge(pubDate) +
      '<h2>' + esc(a.title) + '</h2>' +
      '<div class="sb-hero-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + getRelativeTimeHtml(pubDate) + '</span></div>' +
      '</div></div>';
  }).join('');
}

function renderTrending() {
  const list = document.getElementById('sbTrendingList');
  if (!list) return;
  const items = allArticles.slice(0, 5);
  list.innerHTML = items.map((a, i) => {
    const num = String(i + 1).padStart(2, '0');
    const tagsHtml = Array.isArray(a.tags) && a.tags.length > 0
      ? '<span class="sb-trending-cat">' + esc(a.tags[0]) + '</span>'
      : '';
    return '<div class="sb-trending-item" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
      '<span class="sb-trending-num">' + num + '</span>' +
      '<div class="sb-trending-info">' + tagsHtml +
      '<h4>' + esc(a.title) + '</h4>' +
      '<span class="sb-trending-time">' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div>';
  }).join('');
}

function renderLatest() {
  const list = document.getElementById('sbLatestList');
  if (!list) return;
  const items = allArticles.slice(1, 7);
  list.innerHTML = items.map(a => {
    const tagsHtml = Array.isArray(a.tags) && a.tags.length > 0
      ? '<span class="sb-latest-cat">' + esc(a.tags[0]) + '</span>'
      : '';
    return '<div class="sb-latest-item" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
      '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" decoding="async" width="100" height="70" onerror="this.style.display=\'none\'">' +
      '<div class="sb-latest-info">' + tagsHtml +
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
  for (let i = start; i < end; i++) {
    const a = items[i];
    const card = document.createElement('div');
    card.className = 'sb-card';
    card.style.animation = 'sbFadeIn 0.35s ease';
    card.tabIndex = 0;
    card.role = 'button';
    card.onclick = function() { goto(a.id); };
    card.onkeydown = function(e) { if (e.key === 'Enter' || e.key === 'Space') { e.preventDefault(); this.click(); } };
    const tagsHtml = Array.isArray(a.tags) && a.tags.length > 0
      ? a.tags.slice(0, 3).map(t => '<span class="sb-card-tag" onclick="event.stopPropagation();filterByTag(\'' + escAttr(t) + '\')" role="button">' + esc(t) + '</span>').join('')
      : '';
    card.innerHTML = '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" decoding="async" width="400" height="210" onerror="this.style.display=\'none\'">' +
      '<div class="sb-card-body">' +
      (tagsHtml ? '<div class="sb-card-tags">' + tagsHtml + '</div>' : '') +
      '<h3>' + esc(a.title) + '</h3>' +
      (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
      '<div class="sb-card-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div>';
    frag.appendChild(card);
  }
  grid.appendChild(frag);
  gridRenderedCount = end;
  if (loadMoreContainer) {
    if (end < items.length) {
      loadMoreContainer.innerHTML = '<button class="sb-load-more-btn" onclick="loadMore()"><span>المزيد من الأخبار</span></button>';
    } else {
      loadMoreContainer.innerHTML = '';
    }
  }
}

function loadMore() {
  const btn = document.querySelector('.sb-load-more-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span>جارٍ التحميل...</span>'; }
  appendGridItems();
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<span>المزيد من الأخبار</span>';
    setTimeout(function() {
      const container = document.getElementById('sbLoadMoreContainer');
      if (container) container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

function renderMostRead() {
  const list = document.getElementById('sbMostReadList');
  if (!list) return;
  const items = allArticles.slice(0, 5);
  list.innerHTML = items.map((a, i) => {
    const tagsHtml = Array.isArray(a.tags) && a.tags.length > 0
      ? '<span class="sb-most-read-cat">' + esc(a.tags[0]) + '</span>'
      : '';
    return '<div class="sb-most-read-item" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
      '<span class="sb-most-read-num">' + (i + 1) + '</span>' +
      '<div class="sb-most-read-info">' + tagsHtml +
      '<h4>' + esc(a.title) + '</h4></div></div>';
  }).join('');
}

function renderFooterTags() {
  const list = document.getElementById('sbFooterTags');
  if (!list) return;
  const counts = countTags();
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top8 = sorted.slice(0, 8);
  list.innerHTML = top8.map(([tag]) =>
    '<li><a href="javascript:void(0)" onclick="filterByTag(\'' + escAttr(tag) + '\');window.scrollTo({top:0,behavior:\'smooth\'})">' + esc(tag) + '</a></li>'
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
  if (el) el.textContent = now.getDate() + ' ' + month + ' ' + now.getFullYear() + ' | ' + getHijriDate(now);
  const timeEl = document.getElementById('sbHeaderTime');
  if (timeEl) {
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = h + ':' + m;
  }
}

function filterByTag(tag) {
  activeTag = (activeTag === tag) ? null : tag;
  applyTagFilter();
  renderTagCloud();
  renderGrid();
  closeMenu();
  if (activeTag) { window.location.hash = 'tag=' + encodeURIComponent(activeTag); }
  else { window.location.hash = ''; }
  const grid = document.getElementById('sbGrid');
  if (grid) window.scrollTo({top: grid.offsetTop - 80, behavior: 'smooth'});
}

function clearTagFilter() {
  activeTag = null;
  applyTagFilter();
  renderTagCloud();
  renderGrid();
  window.location.hash = '';
}

let searchTimer;
function filterSearch(query) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function() {
    if (!query.trim()) {
      if (activeTag) { applyTagFilter(); }
      else { filteredArticles = [...allArticles]; }
    } else {
      const q = query.trim().toLowerCase();
      filteredArticles = allArticles.filter(a =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        (Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q)))
      );
      if (typeof gtag === 'function') gtag('event', 'search_used', { search_term: q });
    }
    renderGrid();
    const countEl = document.getElementById('sbSearchCount');
    if (countEl) { countEl.textContent = filteredArticles.length === allArticles.length ? '' : 'نتائج البحث: ' + filteredArticles.length + ' مقال'; }
    const grid = document.getElementById('sbGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 250);
}

/* ── Navigation ── */
function toggleMenu() {
  const nav = document.getElementById('sbNav');
  const overlay = document.getElementById('sbOverlay');
  const btn = document.querySelector('.sb-menu-btn');
  const isOpen = nav.classList.toggle('open');
  overlay.classList.toggle('show');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (btn) btn.setAttribute('aria-expanded', isOpen);
}
function closeMenu() {
  const nav = document.getElementById('sbNav');
  const overlay = document.getElementById('sbOverlay');
  nav.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  const btn = document.querySelector('.sb-menu-btn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}
function toggleSearch() {
  const bar = document.getElementById('sbSearchBar');
  bar.classList.toggle('show');
  if (bar.classList.contains('show')) {
    setTimeout(function() { document.getElementById('sbSearchInput').focus(); }, 100);
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

/* ── Utility ── */
function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
function escAttr(s) { return (s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
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

/* ── Related Articles ── */
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
  if (!container) return;
  const related = getRelatedArticles(article, 4);
  if (related.length === 0) { container.innerHTML = ''; return; }
  const html = related.map(a =>
    '<div class="sb-related-item" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
    '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" decoding="async" width="90" height="65" onerror="this.style.display=\'none\'">' +
    '<div class="sb-related-info"><span class="sb-related-tag">' + esc(Array.isArray(a.tags) && a.tags.length > 0 ? a.tags[0] : 'تقنية') + '</span>' +
    '<h4>' + esc(a.title) + '</h4></div></div>'
  ).join('');
  container.innerHTML = '<section class="sb-related-section"><h2>مقالات ذات صلة</h2><div class="sb-related-grid">' + html + '</div></section>';
}

function injectAdsIntoBody(bodyHtml) {
  if (!bodyHtml) return '';
  const pRegex = /<p[^>]*>[\s\S]*?<\/p>/gi;
  const paragraphs = bodyHtml.match(pRegex);
  if (!paragraphs || paragraphs.length < 3) return bodyHtml;
  let result = '';
  for (let i = 0; i < paragraphs.length; i++) {
    result += paragraphs[i];
    if (i === 2) { result += '<div class="ad-inline-placeholder" data-ad-pos="after-intro"></div>'; }
    else if (i === Math.floor(paragraphs.length / 2)) { result += '<div class="ad-inline-placeholder" data-ad-pos="middle"></div>'; }
    else if (i === paragraphs.length - 2) { result += '<div class="ad-inline-placeholder" data-ad-pos="before-end"></div>'; }
  }
  return result;
}

/* ── Article Page ── */
async function loadArticle() {
  const main = document.getElementById('sbArticleMain');
  if (!main) return;
  const spinner = document.getElementById('loading-spinner');
  if (spinner) spinner.style.display = 'block';
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { if (spinner) spinner.style.display = 'none'; main.innerHTML = '<div class="sb-container"><div class="sb-loading">⚠ معرف المقال غير موجود</div></div>'; return; }
  try {
    if (allArticles.length === 0) {
      const data = await fetchIndex();
      allArticles = (Array.isArray(data) ? data : (data.articles || [])).filter(a => a.status === 'published');
    }
    const a = allArticles.find(art => art.id === id);
    if (!a) throw new Error('لم يتم العثور على المقال');
    const title = a.title_ar || a.title || '';
    const cleanTitle = esc(title);
    const desc = (a.excerpt || '').substring(0, 160);
    const descFull = (a.excerpt || '').substring(0, 200);
    const img = resolveImage(a);
    const url = 'https://td-arabi.com/article.html?id=' + encodeURIComponent(a.id);
    const tagsArr = Array.isArray(a.tags) ? a.tags : [];
    const tagsStr = tagsArr.join(', ');
    const pubDateIso = getPubDate(a) || '';
    const formattedDate = formatExactDateTime(pubDateIso);
    const relativeDate = getRelativeTimeHtml(pubDateIso);
    const wordCount = (a.body || a.content || '').split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const readingTimeStr = readingTime + ' دقائق';

    document.title = title + ' | TD بالعربي';
    const setMeta = function(selector, prop, val) {
      var el = document.querySelector(selector);
      if (el) { if (prop) el[prop] = val; else el.content = val; }
    };
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[name="author"]', 'content', 'TD بالعربي');
    setMeta('meta[name="news_keywords"]', 'content', tagsStr);
    setMeta('[property="og:title"]', 'content', title + ' | TD بالعربي');
    setMeta('[property="og:description"]', 'content', desc);
    setMeta('[property="og:image"]', 'content', img);
    setMeta('[property="og:url"]', 'content', url);
    setMeta('[name="twitter:title"]', 'content', title + ' | TD بالعربي');
    setMeta('[name="twitter:description"]', 'content', desc);
    setMeta('[name="twitter:image"]', 'content', img);
    setMeta('link[rel="canonical"]', 'href', url);

    const tagsHtml = tagsArr.map(t => '<span class="sb-article-tag" onclick="filterByTag(\'' + escAttr(t) + '\')" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\')this.click()">' + esc(t) + '</span>').join('');
    const bodyWithAds = a.body ? injectAdsIntoBody(a.body) : '';
    const breadcrumbHtml = '<nav class="sb-breadcrumb" aria-label="مسار المقال"><a href="index.html">الرئيسية</a> / <span>' + cleanTitle + '</span></nav>';
    injectBreadcrumbSchema(url, cleanTitle);
    const shareUrl = encodeURIComponent(url);
    const shareTitle = encodeURIComponent(title + ' | TD بالعربي');
    const shareHtml = '<div class="sb-share-buttons">' +
      '<a href="https://twitter.com/intent/tweet?text=' + shareTitle + '&url=' + shareUrl + '" target="_blank" rel="noopener" class="sb-share sb-share-twitter" aria-label="مشاركة على X"><i class="fab fa-x-twitter"></i></a>' +
      '<a href="https://t.me/share/url?url=' + shareUrl + '&text=' + shareTitle + '" target="_blank" rel="noopener" class="sb-share sb-share-telegram" aria-label="مشاركة على تيليجرام"><i class="fab fa-telegram"></i></a>' +
      '<a href="https://wa.me/?text=' + shareTitle + '%20' + shareUrl + '" target="_blank" rel="noopener" class="sb-share sb-share-whatsapp" aria-label="مشاركة على واتساب"><i class="fab fa-whatsapp"></i></a>' +
      '<a href="https://www.facebook.com/sharer/sharer.php?u=' + shareUrl + '" target="_blank" rel="noopener" class="sb-share sb-share-facebook" aria-label="مشاركة على فيسبوك"><i class="fab fa-facebook"></i></a>' +
      '</div>';

    if (!document.querySelector('.sb-progress-bar')) {
      var pb = document.createElement('div');
      pb.className = 'sb-progress-bar';
      pb.innerHTML = '<div class="sb-progress-fill" id="sbProgressFill"></div>';
      document.body.appendChild(pb);
      window.addEventListener('scroll', function() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? Math.min(scrollTop / docHeight * 100, 100) : 0;
        var fill = document.getElementById('sbProgressFill');
        if (fill) fill.style.width = pct + '%';
      }, { passive: true });
    }

    var articleSkeleton = document.getElementById('sbArticleSkeleton');
    if (articleSkeleton) articleSkeleton.style.display = 'none';

    main.innerHTML = '<div class="sb-container"><article class="sb-article">' +
      breadcrumbHtml +
      shareHtml +
      '<img src="' + img + '" alt="' + cleanTitle + '" loading="lazy" decoding="async" width="740" height="420" onerror="this.style.display=\'none\'">' +
      (tagsHtml ? '<div class="sb-article-tags">' + tagsHtml + '</div>' : '') +
      '<h1>' + cleanTitle + '</h1>' +
      '<div class="sb-article-meta"><div class="sb-article-author"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="border-radius:50%;background:var(--accent,#2563eb);padding:4px"><path d="M14 14c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm0 2c-5.333 0-10 2.686-10 6v2h20v-2c0-3.314-4.667-6-10-6z" fill="#fff"/></svg>فريق TD بالعربي</div><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + readingTimeStr + '</span><button class="sb-copy-link" onclick="navigator.clipboard.writeText(window.location.href);this.innerHTML=\'<svg width=\\"16\\" height=\\"16\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M20 6L9 17l-5-5\\"/></svg>\';setTimeout(()=>this.innerHTML=\'<svg width=\\"16\\" height=\\"16\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71\\"/><path d=\\"M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71\\"/></svg>\',2000)" aria-label="نسخ الرابط"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg></button></div>' +
      '<div class="sb-article-datetime">' + formattedDate + ' <span class="sb-article-relative">' + relativeDate + '</span></div>' +
      (a.excerpt ? '<div class="sb-article-body"><p><strong>' + esc(a.excerpt) + '</strong></p></div>' : '') +
      (bodyWithAds ? '<div class="sb-article-body">' + bodyWithAds + '</div>' : '') +
      (tagsHtml ? '<div class="sb-article-tags">' + tagsHtml + '</div>' : '') +
      '<div id="ad-before-related"></div>' +
      '<div id="sbRelatedArticles"></div>' +
      '</article><aside class="sb-article-sidebar">' +
      '<div class="sb-ad-sticky"><div id="ad-sidebar-skyscraper"></div></div></aside></div>';

    const adBeforeRelated = document.getElementById('ad-before-related');
    if (adBeforeRelated) adBeforeRelated.replaceWith(createAdsterra('8650abbaa1fd85a5ced9afc2f1f57777', 'iframe', 250, 300));
    const adSkyscraper = document.getElementById('ad-sidebar-skyscraper');
    if (adSkyscraper) {
      const wrap = createAdsterra('c229277af38c3a4d4544dfc44e87757f', 'iframe', 600, 160);
      wrap.className = 'ad-container';
      wrap.style.cssText = 'text-align:center;margin:0;position:sticky;top:80px';
      adSkyscraper.replaceWith(wrap);
    }
    document.querySelectorAll('.ad-inline-placeholder').forEach(function(el) {
      const pos = el.getAttribute('data-ad-pos');
      if (pos === 'after-intro') { el.replaceWith(createAdsterra('8650abbaa1fd85a5ced9afc2f1f57777', 'iframe', 250, 300)); }
      else if (pos === 'middle') { el.replaceWith(createAdsterra('dc29c63238688f937f7bb9cfb4bf3962', 'iframe', 90, 728)); }
      else if (pos === 'before-end') { el.replaceWith(createAdsterra('8650abbaa1fd85a5ced9afc2f1f57777', 'iframe', 250, 300)); }
    });
    renderRelatedArticles(a);
    injectNewsArticleSchema(a);
    if (typeof gtag === 'function') gtag('event', 'article_open', { article_id: a.id, article_title: a.title });
  } catch(e) {
    main.innerHTML = '<div class="sb-container" style="text-align:center;padding:80px 20px"><div style="font-size:48px;margin-bottom:15px;">⚠️</div><h2 style="margin-bottom:10px;">تعذر تحميل المقال</h2><p>يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى</p><button onclick="location.reload()" style="margin-top:20px;background:var(--accent,#2563eb);color:#fff;border:none;padding:10px 25px;border-radius:6px;cursor:pointer;font-size:14px">إعادة المحاولة</button></div>';
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

function injectNewsArticleSchema(a) {
  var existing = document.getElementById('newsarticle-schema');
  if (existing) existing.remove();
  const pubDate = getPubDate(a) || new Date().toISOString();
  const url = 'https://td-arabi.com/article.html?id=' + encodeURIComponent(a.id);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title_ar || a.title || '',
    description: (a.excerpt || '').substring(0, 300),
    image: resolveImage(a),
    author: { '@type': 'Organization', name: 'TD بالعربي' },
    publisher: { '@type': 'Organization', name: 'TD بالعربي', logo: { '@type': 'ImageObject', url: 'https://td-arabi.com/img/og-image.png' } },
    datePublished: pubDate,
    dateModified: pubDate,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }
  };
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(schema);
  document.head.appendChild(el);
}

function injectBreadcrumbSchema(url, title) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': 'https://td-arabi.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': title, 'item': url }
    ]
  };
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(schema);
  document.head.appendChild(el);
}

/* ── Category Page ── */
async function loadCategory() {
  const main = document.getElementById('sbCategoryMain');
  if (!main) return;
  const spinner = document.getElementById('loading-spinner');
  if (spinner) spinner.style.display = 'block';
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat') || '';
  try {
    if (allArticles.length === 0) {
      const data = await fetchIndex();
      allArticles = (Array.isArray(data) ? data : (data.articles || [])).filter(a => a.status === 'published');
    }
    var skeleton = document.getElementById('sbCategorySkeleton');
    if (skeleton) skeleton.style.display = 'none';
    var content = document.getElementById('sbCategoryContent');
    if (content) content.style.display = '';
    const catNames = { ai:'الذكاء الاصطناعي', companies:'شركات', cybersecurity:'أمن سيبراني', phones:'هواتف ذكية', ev:'سيارات كهربائية', security:'أمن سيبراني', mobile:'هواتف ذكية' };
    const catName = catNames[cat] || cat || 'جميع المقالات';
    var titleEl = document.getElementById('sbCategoryTitle');
    if (titleEl) titleEl.textContent = catName;
    const filtered = cat ? allArticles.filter(a => Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase() === cat.toLowerCase() || t.toLowerCase().includes(cat.toLowerCase()))) : allArticles;
    var countEl = document.getElementById('sbCategoryCount');
    if (countEl) countEl.textContent = filtered.length + ' مقال';
    var chips = document.getElementById('sbCategoryChips');
    if (chips) {
      chips.innerHTML = Object.entries(catNames).map(function(e) {
        var active = e[0] === cat ? ' sb-cat-chip-active' : '';
        return '<a href="category.html?cat=' + e[0] + '" class="sb-cat-chip' + active + '">' + e[1] + '</a>';
      }).join('');
    }
    var grid = document.getElementById('sbCategoryGrid');
    if (!grid) return;
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="sb-empty-state">لا توجد مقالات في هذا التصنيف</div>';
      return;
    }
    grid.innerHTML = filtered.map(function(a) {
      var tagsHtml = Array.isArray(a.tags) && a.tags.length > 0
        ? a.tags.slice(0, 3).map(function(t) { return '<span class="sb-card-tag">' + esc(t) + '</span>'; }).join('')
        : '';
      return '<div class="sb-card" tabindex="0" role="button" onclick="goto(\'' + escId(a.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\'Space\'){event.preventDefault();this.click()}">' +
        '<img src="' + resolveImage(a) + '" alt="' + esc(a.title) + '" loading="lazy" decoding="async" width="400" height="210" onerror="this.style.display=\'none\'">' +
        '<div class="sb-card-body">' +
        (tagsHtml ? '<div class="sb-card-tags">' + tagsHtml + '</div>' : '') +
        '<h3>' + esc(a.title) + '</h3>' +
        (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
        '<div class="sb-card-meta"><span>' + esc(a.source_name || a.source || 'TD بالعربي') + '</span><span>' + getRelativeTimeHtml(getPubDate(a)) + '</span></div></div></div>';
    }).join('');
    if (typeof gtag === 'function') gtag('event', 'category_view', { category: cat || 'all' });
  } catch(e) {
    var skeleton2 = document.getElementById('sbCategorySkeleton');
    if (skeleton2) skeleton2.style.display = 'none';
    var content2 = document.getElementById('sbCategoryContent');
    if (content2) { content2.style.display = ''; content2.innerHTML = '<div class="sb-loading">⚠ تعذر تحميل التصنيف</div>'; }
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

/* ── Analytics ── */
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
function initAnalytics() { trackPageView(window.location.pathname); }

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
        recent.map(function(e) {
          return '<div class="sb-analytics-entry"><span>' + (e.cat||'') + '</span><span>' + (e.action||'') + '</span><span class="sb-analytics-ago">' + Math.floor((Date.now() - (e.ts||e.entry||0)) / 60000) + ' دقائق</span></div>';
        }).join('') +
        '</div>';
    }
  } catch(e) {
    container.innerHTML = '<div class="sb-loading">⚠ تعذر تحميل التحليلات</div>';
  }
}

/* ── Scroll Handler ── */
(function() {
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      backToTop.style.display = window.scrollY > 500 ? 'flex' : 'none';
    }, { passive: true });
  }
})();

/* ── Init ── */
if (document.getElementById('sbGrid')) { loadIndex(); setInterval(function() { loadIndex(); }, 30000); setInterval(function() { updateLastUpdate(); renderRelativeTimes(); }, 60000); updateLastUpdate(); }
if (document.getElementById('sbArticleMain')) { loadArticle(); initAnalytics(); }
if (document.getElementById('sbCategoryMain')) { loadCategory(); }
if (document.getElementById('sbAnalyticsDashboard')) { initAnalyticsDashboard(); }
