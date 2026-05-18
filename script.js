
/* =========================================================
   Tech Dose News — script.js
   Vanilla JS, no dependencies
   ========================================================= */

'use strict';

/* ── Dynamic Articles Loader ── */
let articles = [];

async function loadArticles() {
  try {
    const response = await fetch('./articles/index.json');

    if (!response.ok) {
      throw new Error('Failed to load articles');
    }

    articles = await response.json();

    if (!Array.isArray(articles)) {
      articles = [];
    }

    const isArticlePage = document.body.classList.contains('article-page');

    if (isArticlePage) {
      initArticlePage();
    } else {
      renderHero();
      renderArticles();
      renderTrending();
      initCategoryFilter();
      initLoadMore();
      lazyLoadImages();
      initScrollReveal();
    }

  } catch (error) {
    console.error('Error loading articles:', error);
  }
}

/* ── Category to CSS class map ── */
const catClass = {
  'ذكاء اصطناعي':    'cat-ai',
  'هواتف ذكية':      'cat-phone',
  'أمن سيبراني':     'cat-security',
  'شركات التقنية':   'cat-company',
  'مصر والتقنية':    'cat-egypt',
  'إلكترونيات':      'cat-elec',
  'سيارات كهربائية': 'cat-car'
};

/* ── State ── */
const PAGE_SIZE = 6;
let currentFilter = 'الكل';
let currentPage   = 1;

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  initTicker();
  initHamburger();
  initSearch();
  initNewsletterForms();
  initDateTime();
  initScrollReveal();

  loadArticles();

});

/* =========================================================
   1. TICKER
   ========================================================= */
function initTicker() {
  const content = document.getElementById('tickerContent');
  if (!content) return;

  const clone = content.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  content.parentNode.appendChild(clone);
}

/* =========================================================
   2. HAMBURGER
   ========================================================= */
function initHamburger() {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    nav.setAttribute('aria-hidden', !isOpen);
    btn.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
  });

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !nav.contains(e.target) && nav.classList.contains('open')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      btn.querySelector('i').className = 'fas fa-bars';
    }
  });

  nav.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      btn.querySelector('i').className = 'fas fa-bars';

      const filter = link.dataset.filter;
      if (filter) {
        filterByCategory(filter);
        syncCatPills(filter);
      }
    });
  });

  document.querySelectorAll('.nav-link[data-filter]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      filterByCategory(link.dataset.filter);
      syncCatPills(link.dataset.filter);

      document.getElementById('articlesGrid')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });
}

/* =========================================================
   3. CATEGORY FILTER
   ========================================================= */
function initCategoryFilter() {
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.dataset.category;
      filterByCategory(cat);
    });
  });
}

function filterByCategory(category) {
  currentFilter = category;
  currentPage   = 1;

  syncCatPills(category);

  renderHero();
  renderArticles();

  document.getElementById('heroSection')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function syncCatPills(category) {
  document.querySelectorAll('.cat-pill').forEach(p => {
    const isActive = p.dataset.category === category;

    p.classList.toggle('active', isActive);
    p.setAttribute('aria-pressed', isActive);
  });
}

/* =========================================================
   4. HERO SECTION
   ========================================================= */
function renderHero() {
  const hero = document.getElementById('heroSection');
  if (!hero) return;

  const pool = currentFilter === 'الكل'
    ? articles
    : articles.filter(a => a.category === currentFilter);

  const featured = pool.find(a => a.featured) || pool[0];

  if (!featured) {
    hero.innerHTML = '';
    return;
  }

  hero.innerHTML = `
    <div class="hero-inner fade-up">
      <img class="hero-bg" src="${featured.image}" alt="${escapeHtml(featured.title)}" loading="eager" />
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <span class="hero-cat-badge">${escapeHtml(featured.category)}</span>

        <h2 class="hero-headline">${escapeHtml(featured.title)}</h2>

        <p class="hero-desc">${escapeHtml(featured.excerpt)}</p>

        <div class="hero-meta">
          <span class="hero-meta-item">
            <i class="far fa-calendar-alt"></i>
            ${escapeHtml(featured.date)}
          </span>

          <span class="hero-meta-item">
            <i class="far fa-clock"></i>
            ${escapeHtml(featured.readTime)}
          </span>

          <span class="hero-meta-item">
            <i class="far fa-eye"></i>
            ${escapeHtml(featured.views)}
          </span>
        </div>

        <a href="article.html?id=${featured.id}" class="hero-read-btn">
          اقرأ المزيد
          <i class="fas fa-arrow-left"></i>
        </a>
      </div>
    </div>
  `;
}

/* =========================================================
   5. ARTICLES GRID
   ========================================================= */
function renderArticles() {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;

  const pool = currentFilter === 'الكل'
    ? articles
    : articles.filter(a => a.category === currentFilter);

  const gridItems = currentFilter === 'الكل'
    ? pool.filter(a => !a.featured)
    : pool;

  const visible = gridItems.slice(0, currentPage * PAGE_SIZE);

  if (visible.length === 0) {
    grid.innerHTML = `
      <p class="no-results-msg"
         style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);font-family:'Tajawal',sans-serif;">
         لا توجد مقالات حالياً
      </p>
    `;

    updateLoadMoreBtn(0, 0);
    return;
  }

  grid.innerHTML = visible.map((a, i) => buildCard(a, i)).join('');

  updateLoadMoreBtn(visible.length, gridItems.length);

  lazyLoadImages();
}

function buildCard(article, index) {
  const cls = catClass[article.category] || 'cat-ai';

  const delay = (index % PAGE_SIZE) * 0.07;

  const egyptBadge = article.hasEgyptImpact
    ? `<span class="egypt-badge">★ يشمل تأثير مصر</span>`
    : '';

  return `
    <a href="article.html?id=${article.id}"
       class="article-card reveal"
       data-category="${escapeHtml(article.category)}"
       style="animation-delay:${delay}s">

      <div class="card-img-wrapper">

        <img class="card-img lazy"
             data-src="${article.image}"
             src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect fill='%23D6EAF8' width='800' height='450'/%3E%3C/svg%3E"
             alt="${escapeHtml(article.title)}"
             loading="lazy" />

        <span class="card-cat-badge ${cls}">
          ${escapeHtml(article.category)}
        </span>

      </div>

      <div class="card-body">

        <h3 class="card-headline">
          ${escapeHtml(article.title)}
        </h3>

        <p class="card-excerpt">
          ${escapeHtml(article.excerpt)}
        </p>

        <div class="card-footer">

          <div class="card-meta">

            <span class="card-meta-item">
              <i class="far fa-calendar-alt"></i>
              ${escapeHtml(article.date)}
            </span>

            <span class="card-meta-item">
              <i class="far fa-clock"></i>
              ${escapeHtml(article.readTime)}
            </span>

          </div>

          ${egyptBadge}

        </div>
      </div>
    </a>
  `;
}

/* =========================================================
   6. LOAD MORE
   ========================================================= */
function initLoadMore() {
  const btn = document.getElementById('loadMoreBtn');

  if (!btn) return;

  btn.addEventListener('click', () => {
    currentPage++;
    renderArticles();

    btn.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  });
}

function updateLoadMoreBtn(shown, total) {
  const btn = document.getElementById('loadMoreBtn');

  if (!btn) return;

  btn.classList.toggle('hidden', shown >= total);
}

/* =========================================================
   7. TRENDING SIDEBAR
   ========================================================= */
function renderTrending() {
  const list = document.getElementById('trendingList');

  if (!list) return;

  const top5 = [...articles]
    .sort((a, b) => parseInt(b.views || 0) - parseInt(a.views || 0))
    .slice(0, 5);

  list.innerHTML = top5.map((a, i) => `
    <li class="trending-item"
        onclick="location.href='article.html?id=${a.id}'">

      <span class="trending-num">0${i + 1}</span>

      <div class="trending-info">

        <p class="trending-title">
          ${escapeHtml(a.title)}
        </p>

        <span class="trending-date">
          <i class="far fa-calendar-alt"></i>
          ${escapeHtml(a.date)}
        </span>

      </div>
    </li>
  `).join('');
}

/* =========================================================
   8. SEARCH OVERLAY
   ========================================================= */
function initSearch() {
  const overlay  = document.getElementById('searchOverlay');
  const toggle   = document.getElementById('searchToggle');
  const closeBtn = document.getElementById('searchClose');
  const input    = document.getElementById('searchInput');
  const results  = document.getElementById('searchResults');

  if (!overlay || !toggle) return;

  toggle.addEventListener('click', openSearch);

  closeBtn?.addEventListener('click', closeSearch);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) {
      closeSearch();
    }
  });

  let debounceTimer;

  input?.addEventListener('input', () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      doSearch(input.value.trim(), results);
    }, 300);
  });

  function openSearch() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    setTimeout(() => input?.focus(), 50);
  }

  function closeSearch() {
    overlay.hidden = true;
    document.body.style.overflow = '';

    if (input) input.value = '';

    if (results) {
      results.innerHTML = '<p class="search-hint">اكتب للبحث...</p>';
    }
  }
}

function doSearch(query, resultsEl) {

  if (!query) {
    resultsEl.innerHTML = '<p class="search-hint">اكتب للبحث...</p>';
    return;
  }

  const q = query.toLowerCase();

  const found = articles.filter(a =>
    a.title?.toLowerCase().includes(q) ||
    a.category?.toLowerCase().includes(q) ||
    a.excerpt?.toLowerCase().includes(q)
  );

  if (found.length === 0) {
    resultsEl.innerHTML = `
      <p class="no-results">
        لا توجد نتائج
      </p>
    `;
    return;
  }

  resultsEl.innerHTML = found.map(a => `
    <a href="article.html?id=${a.id}" class="search-result-card">

      <img class="search-result-img"
           src="${a.image}"
           alt="${escapeHtml(a.title)}"
           loading="lazy" />

      <div class="search-result-info">

        <p class="search-result-title">
          ${escapeHtml(a.title)}
        </p>

        <span class="search-result-cat">
          ${escapeHtml(a.category)}
        </span>

      </div>

    </a>
  `).join('');
}

/* =========================================================
   9. LAZY LOAD IMAGES
   ========================================================= */
function lazyLoadImages() {

  if (!('IntersectionObserver' in window)) {

    document.querySelectorAll('img.lazy').forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      }
    });

    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        const img = entry.target;

        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy');
        }

        obs.unobserve(img);
      }
    });

  }, {
    rootMargin: '200px 0px'
  });

  document.querySelectorAll('img.lazy').forEach(img => observer.observe(img));
}

/* =========================================================
   10. NEWSLETTER FORMS
   ========================================================= */
function initNewsletterForms() {

  document.querySelectorAll('.newsletter-form, .footer-newsletter-form')
    .forEach(form => {

      form.addEventListener('submit', (e) => {

        e.preventDefault();

        const input = form.querySelector('input[type="email"]');

        if (input && input.value) {

          showToast('تم الاشتراك بنجاح ✓');

          input.value = '';
        }
      });
    });
}

/* =========================================================
   11. ARTICLE PAGE
   ========================================================= */
function initArticlePage() {

  const params = new URLSearchParams(window.location.search);

  const id = parseInt(params.get('id') || '1', 10);

  const article = articles.find(a => a.id === id) || articles[0];

  if (!article) return;

  document.title = `${article.title} — Tech Dose News`;

  setMeta('og:title', article.title);
  setMeta('og:image', article.image);
  setMeta('og:description', article.excerpt);

  setEl('breadcrumbCategory', article.category);
  setEl('breadcrumbTitle', article.title);

  const badge = document.getElementById('articleCatBadge');

  if (badge) {
    badge.textContent = article.category;
    badge.className = `article-cat-badge ${catClass[article.category] || 'cat-ai'}`;
  }

  setEl('articleReadTime', article.readTime);
  setEl('articleDate', article.date);
  setEl('articleViews', article.views);

  setEl('articleHeadline', article.title);

  const img = document.getElementById('articleImage');

  if (img) {
    img.src = article.image;
    img.alt = article.title;
  }

  setEl('articleCaption', `صورة: ${article.title}`);

  setEl('articleBody', '');
  const bodyEl = document.getElementById('articleBody');
  if (bodyEl && article.body) bodyEl.innerHTML = article.body;

  const egyptBox = document.getElementById('egyptImpactBox');
  if (egyptBox && article.egyptImpact) {
    const body = egyptBox.querySelector('.egypt-impact-body');
    if (body) body.innerHTML = article.egyptImpact;
    egyptBox.style.display = '';
  } else if (egyptBox) {
    egyptBox.style.display = 'none';
  }

  const sourceDiv = document.querySelector('.article-source');
  if (sourceDiv) {
    if (article.source) {
      sourceDiv.style.display = '';
      const sourceEl = sourceDiv.querySelector('span');
      if (sourceEl) {
        sourceEl.innerHTML = 'المصدر: <a href="' + escapeHtml(article.source) + '" target="_blank" rel="noopener noreferrer" style="color:var(--blue)">' + escapeHtml(new URL(article.source).hostname) + '</a> | أُعيدت كتابته بواسطة <strong>Tech Dose News</strong>';
      }
    } else {
      sourceDiv.style.display = 'none';
    }
  }

  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(article.title);
  const fb = document.getElementById('shareFacebook');
  if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + pageUrl;
  const tg = document.getElementById('shareTelegram');
  if (tg) tg.href = 'https://t.me/share/url?url=' + pageUrl + '&text=' + pageTitle;
  const wa = document.getElementById('shareWhatsapp');
  if (wa) wa.href = 'https://wa.me/?text=' + pageTitle + '%20' + pageUrl;
  const copy = document.getElementById('shareCopy');
  if (copy) {
    copy.onclick = function(e) {
      e.preventDefault();
      navigator.clipboard.writeText(window.location.href).then(function() {
        showToast('تم نسخ الرابط');
      });
    };
  }

  renderRelated(article);

  initTicker();
  initHamburger();
  initSearch();
  initNewsletterForms();
  initDateTime();
  initScrollReveal();
}

function renderRelated(current) {

  const grid = document.getElementById('relatedGrid');

  if (!grid) return;

  const related = articles
    .filter(a => a.id !== current.id && a.category === current.category)
    .slice(0, 3);

  grid.innerHTML = related.map((a, i) => buildCard(a, i)).join('');

  lazyLoadImages();
}

/* =========================================================
   12. DATE/TIME CLOCK
   ========================================================= */
function initDateTime() {
  const timeEl = document.getElementById('dtTime');
  const gregEl = document.getElementById('dtGreg');
  const hijriEl = document.getElementById('dtHijri');
  const dayEl = document.getElementById('dtDay');
  if (!timeEl) return;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function update() {
    const now = new Date();
    const egypt = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
    timeEl.textContent = pad(egypt.getHours()) + ':' + pad(egypt.getMinutes());

    if (gregEl) {
      const d = egypt.getDate();
      const m = ['يناير','فبراير','مارس','إبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      gregEl.textContent = d + ' ' + m[egypt.getMonth()] + ' ' + egypt.getFullYear();
    }
    if (hijriEl) {
      try {
        const h = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day:'numeric', month:'long', year:'numeric' }).format(egypt);
        hijriEl.textContent = h;
      } catch(e) {
        hijriEl.textContent = '';
      }
    }
    if (dayEl) {
      const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
      dayEl.textContent = days[egypt.getDay()];
    }
  }

  update();
  setInterval(update, 1000);
}

/* =========================================================
   13. SCROLL REVEAL
   ========================================================= */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* =========================================================
   HELPERS
   ========================================================= */
function escapeHtml(str) {

  if (!str) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setEl(id, text) {

  const el = document.getElementById(id);

  if (el) el.textContent = text;
}

function setHref(id, href) {

  const el = document.getElementById(id);

  if (el) el.href = href;
}

function setMeta(property, content) {

  let el = document.querySelector(`meta[property="${property}"]`);

  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }

  el.setAttribute('content', content);
}

function showToast(msg) {

  const existing = document.getElementById('tdnToast');

  if (existing) existing.remove();

  const toast = document.createElement('div');

  toast.id = 'tdnToast';

  toast.style.cssText = `
    position:fixed;
    bottom:24px;
    right:24px;
    z-index:9999;
    background:#0f172a;
    color:#fff;
    font-family:'Cairo',sans-serif;
    font-size:.95rem;
    font-weight:600;
    padding:14px 22px;
    border-radius:10px;
    box-shadow:0 6px 20px rgba(0,0,0,0.25);
  `;

  toast.textContent = msg;

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}
