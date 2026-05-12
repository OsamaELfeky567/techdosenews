/* =========================================================
   Tech Dose News — script.js
   Vanilla JS, no dependencies
   ========================================================= */

'use strict';

/* ── Sample Data ── */
const articles = [
  {
    id: 1,
    title: "OpenAI تطلق GPT-5 بقدرات تفوق توقعات الخبراء",
    excerpt: "كشفت شركة OpenAI النقاب عن الجيل الخامس من نموذجها الشهير بمزايا غير مسبوقة تتجاوز كل التوقعات التي أطلقها خبراء الذكاء الاصطناعي حول العالم.",
    category: "ذكاء اصطناعي",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    date: "منذ ساعتين",
    readTime: "4 دقائق",
    views: "2,341",
    hasEgyptImpact: true,
    featured: true
  },
  {
    id: 2,
    title: "سامسونج تكشف عن Galaxy S25 بشاشة أكثر إشراقاً",
    excerpt: "أعلنت سامسونج رسمياً عن هاتف Galaxy S25 الجديد بمعالج Snapdragon 8 Elite وكاميرا محسّنة بالذكاء الاصطناعي.",
    category: "هواتف ذكية",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
    date: "منذ 5 ساعات",
    readTime: "3 دقائق",
    views: "1,892",
    hasEgyptImpact: true,
    featured: false
  },
  {
    id: 3,
    title: "ثغرة أمنية خطيرة تهدد ملايين مستخدمي أندرويد",
    excerpt: "اكتشف باحثو الأمن السيبراني ثغرة خطيرة في نظام أندرويد تؤثر على أكثر من مليار جهاز حول العالم.",
    category: "أمن سيبراني",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    date: "منذ 8 ساعات",
    readTime: "5 دقائق",
    views: "3,120",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 4,
    title: "جوجل تستثمر 10 مليار دولار في البنية التحتية للذكاء الاصطناعي",
    excerpt: "أعلنت شركة جوجل عن خطة استثمارية ضخمة لتوسيع بنيتها التحتية لخدمات الذكاء الاصطناعي خلال العام الجاري.",
    category: "شركات التقنية",
    image: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&q=80",
    date: "أمس",
    readTime: "6 دقائق",
    views: "987",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 5,
    title: "مصر تطلق أول منصة حكومية للذكاء الاصطناعي",
    excerpt: "أطلقت الحكومة المصرية منصتها الرقمية الجديدة المدعومة بالذكاء الاصطناعي لتحسين الخدمات الحكومية.",
    category: "مصر والتقنية",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
    date: "منذ يومين",
    readTime: "4 دقائق",
    views: "4,560",
    hasEgyptImpact: true,
    featured: false
  },
  {
    id: 6,
    title: "أبل تختبر ميزة الشحن اللاسلكي الفائق السرعة في iPhone 17",
    excerpt: "تكشف التسريبات الأخيرة أن أبل تعمل على تقنية شحن لاسلكي بقدرة 50 واط في جيل iPhone القادم.",
    category: "هواتف ذكية",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
    date: "منذ 3 أيام",
    readTime: "3 دقائق",
    views: "2,100",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 7,
    title: "تسلا تكشف عن روبوت Optimus الجديد بقدرات مذهلة",
    excerpt: "عرضت شركة تسلا الجيل الثاني من روبوتها الإنساني Optimus الذي يستطيع أداء مهام منزلية معقدة باستقلالية عالية.",
    category: "سيارات كهربائية",
    image: "https://images.unsplash.com/photo-1561144257-e32e8506e647?w=800&q=80",
    date: "منذ 4 أيام",
    readTime: "5 دقائق",
    views: "1,734",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 8,
    title: "ميكروسوفت تدمج الذكاء الاصطناعي في كل منتجاتها خلال 2025",
    excerpt: "أعلنت شركة ميكروسوفت عن خطتها الشاملة لدمج نماذج الذكاء الاصطناعي في جميع تطبيقاتها بما فيها Office وWindows.",
    category: "شركات التقنية",
    image: "https://images.unsplash.com/photo-1642952469120-eed4b65104be?w=800&q=80",
    date: "منذ 5 أيام",
    readTime: "4 دقائق",
    views: "1,456",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 9,
    title: "تقرير: مبيعات الهواتف الذكية ترتفع 12% في مصر عام 2024",
    excerpt: "كشف تقرير حديث عن ارتفاع ملحوظ في مبيعات الهواتف الذكية في السوق المصرية خلال العام الماضي رغم التحديات الاقتصادية.",
    category: "مصر والتقنية",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    date: "منذ أسبوع",
    readTime: "3 دقائق",
    views: "3,200",
    hasEgyptImpact: true,
    featured: false
  },
  {
    id: 10,
    title: "Sony تطلق WH-1000XM6 بعزل صوت أذكى وبطارية أطول",
    excerpt: "كشفت سوني عن جيل جديد من سماعاتها الرائدة مع تحسينات كبيرة في عزل الضوضاء بالذكاء الاصطناعي وعمر بطارية يصل إلى 40 ساعة.",
    category: "إلكترونيات",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    date: "منذ أسبوع",
    readTime: "4 دقائق",
    views: "890",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 11,
    title: "هاكر يستغل ثغرة في ChatGPT لاختراق بيانات المستخدمين",
    excerpt: "اكتشف باحثون في الأمن السيبراني طريقة جديدة لاستغلال إعدادات ذاكرة ChatGPT للوصول إلى معلومات المستخدمين الحساسة.",
    category: "أمن سيبراني",
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&q=80",
    date: "منذ أسبوعين",
    readTime: "6 دقائق",
    views: "2,780",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 12,
    title: "Nvidia تطلق بطاقة RTX 5090 بأداء يتجاوز الجيل الماضي بمرتين",
    excerpt: "أطلقت Nvidia بطاقتها الرسومية الجديدة RTX 5090 التي تعد بأداء مضاعف في الألعاب والذكاء الاصطناعي مقارنةً بـ RTX 4090.",
    category: "إلكترونيات",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
    date: "منذ أسبوعين",
    readTime: "5 دقائق",
    views: "1,650",
    hasEgyptImpact: false,
    featured: false
  }
];

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
  const isArticlePage = document.body.classList.contains('article-page');

  initTicker();
  initHamburger();
  initSearch();
  initNewsletterForms();

  if (isArticlePage) {
    initArticlePage();
  } else {
    renderHero();
    renderArticles();
    renderTrending();
    initCategoryFilter();
    initLoadMore();
    lazyLoadImages();
  }
});

/* =========================================================
   1. TICKER
   ========================================================= */
function initTicker() {
  const content = document.getElementById('tickerContent');
  if (!content) return;
  // Clone for seamless loop
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

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !nav.contains(e.target) && nav.classList.contains('open')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      btn.querySelector('i').className = 'fas fa-bars';
    }
  });

  // Close on link click & handle nav filter
  nav.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      btn.querySelector('i').className = 'fas fa-bars';

      const filter = link.dataset.filter;
      if (filter) {
        filterByCategory(filter);
        // Sync desktop cat pills
        syncCatPills(filter);
      }
    });
  });

  // Desktop nav links with data-filter
  document.querySelectorAll('.nav-link[data-filter]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      filterByCategory(link.dataset.filter);
      syncCatPills(link.dataset.filter);
      // Scroll to articles
      document.getElementById('articlesGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  // Scroll to content
  document.getElementById('heroSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  if (!featured) { hero.innerHTML = ''; return; }

  hero.innerHTML = `
    <div class="hero-inner">
      <img class="hero-bg" src="${featured.image}" alt="${escapeHtml(featured.title)}" loading="eager" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="hero-cat-badge">${escapeHtml(featured.category)}</span>
        <h2 class="hero-headline">${escapeHtml(featured.title)}</h2>
        <p class="hero-desc">${escapeHtml(featured.excerpt)}</p>
        <div class="hero-meta">
          <span class="hero-meta-item"><i class="far fa-calendar-alt" aria-hidden="true"></i> ${escapeHtml(featured.date)}</span>
          <span class="hero-meta-item"><i class="far fa-clock" aria-hidden="true"></i> ${escapeHtml(featured.readTime)}</span>
          <span class="hero-meta-item"><i class="far fa-eye" aria-hidden="true"></i> ${escapeHtml(featured.views)}</span>
        </div>
        <a href="article.html?id=${featured.id}" class="hero-read-btn" aria-label="اقرأ المزيد عن ${escapeHtml(featured.title)}">
          اقرأ المزيد <i class="fas fa-arrow-left" aria-hidden="true"></i>
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

  // Exclude featured (shown in hero) from grid when unfiltered
  const gridItems = currentFilter === 'الكل'
    ? pool.filter(a => !a.featured)
    : pool;

  const visible = gridItems.slice(0, currentPage * PAGE_SIZE);

  if (visible.length === 0) {
    grid.innerHTML = `<p class="no-results-msg" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);font-family:'Tajawal',sans-serif;">لا توجد مقالات في هذا التصنيف حالياً.</p>`;
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
    <a href="article.html?id=${article.id}" class="article-card" data-category="${escapeHtml(article.category)}"
       style="animation-delay:${delay}s" aria-label="${escapeHtml(article.title)}">
      <div class="card-img-wrapper">
        <img class="card-img lazy" data-src="${article.image}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect fill='%23D6EAF8' width='800' height='450'/%3E%3C/svg%3E"
          alt="${escapeHtml(article.title)}" loading="lazy" />
        <span class="card-cat-badge ${cls}">${escapeHtml(article.category)}</span>
      </div>
      <div class="card-body">
        <h3 class="card-headline">${escapeHtml(article.title)}</h3>
        <p class="card-excerpt">${escapeHtml(article.excerpt)}</p>
        <div class="card-footer">
          <div class="card-meta">
            <span class="card-meta-item"><i class="far fa-calendar-alt" aria-hidden="true"></i> ${escapeHtml(article.date)}</span>
            <span class="card-meta-item"><i class="far fa-clock" aria-hidden="true"></i> ${escapeHtml(article.readTime)}</span>
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
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    .sort((a, b) => parseInt(b.views.replace(',', '')) - parseInt(a.views.replace(',', '')))
    .slice(0, 5);

  list.innerHTML = top5.map((a, i) => `
    <li class="trending-item" onclick="location.href='article.html?id=${a.id}'" role="button" tabindex="0"
        aria-label="${escapeHtml(a.title)}"
        onkeydown="if(event.key==='Enter')location.href='article.html?id=${a.id}'">
      <span class="trending-num" aria-hidden="true">0${i + 1}</span>
      <div class="trending-info">
        <p class="trending-title">${escapeHtml(a.title)}</p>
        <span class="trending-date"><i class="far fa-calendar-alt" aria-hidden="true"></i> ${escapeHtml(a.date)}</span>
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

  // Close on overlay backdrop click
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeSearch();
  });

  let debounceTimer;
  input?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(input.value.trim(), results), 300);
  });

  function openSearch() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => input?.focus(), 50);
  }

  function closeSearch() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (input) { input.value = ''; }
    if (results) results.innerHTML = '<p class="search-hint">اكتب للبحث في أخبار التكنولوجيا...</p>';
  }
}

function doSearch(query, resultsEl) {
  if (!query) {
    resultsEl.innerHTML = '<p class="search-hint">اكتب للبحث في أخبار التكنولوجيا...</p>';
    return;
  }
  const q = query.toLowerCase();
  const found = articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.category.toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q)
  );

  if (found.length === 0) {
    resultsEl.innerHTML = `<p class="no-results">لم نجد نتائج لـ "<strong>${escapeHtml(query)}</strong>"</p>`;
    return;
  }

  resultsEl.innerHTML = found.map(a => `
    <a href="article.html?id=${a.id}" class="search-result-card">
      <img class="search-result-img" src="${a.image}" alt="${escapeHtml(a.title)}" loading="lazy" />
      <div class="search-result-info">
        <p class="search-result-title">${escapeHtml(a.title)}</p>
        <span class="search-result-cat">${escapeHtml(a.category)} · ${escapeHtml(a.date)}</span>
      </div>
    </a>
  `).join('');
}

/* =========================================================
   9. LAZY LOAD IMAGES
   ========================================================= */
function lazyLoadImages() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all
    document.querySelectorAll('img.lazy').forEach(img => {
      if (img.dataset.src) { img.src = img.dataset.src; img.classList.remove('lazy'); }
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
  }, { rootMargin: '200px 0px' });

  document.querySelectorAll('img.lazy').forEach(img => observer.observe(img));
}

/* =========================================================
   10. NEWSLETTER FORMS
   ========================================================= */
function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form, .footer-newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast('شكراً! تم الاشتراك في النشرة البريدية بنجاح ✓');
        input.value = '';
      }
    });
  });
}

/* =========================================================
   11. ARTICLE PAGE
   ========================================================= */
function initArticlePage() {
  const params     = new URLSearchParams(window.location.search);
  const id         = parseInt(params.get('id') || '1', 10);
  const article    = articles.find(a => a.id === id) || articles[0];

  // Update meta
  document.title   = `${article.title} — Tech Dose News`;
  setMeta('og:title', article.title);
  setMeta('og:image', article.image);
  setMeta('og:description', article.excerpt);

  // Breadcrumb
  setEl('breadcrumbCategory', article.category);
  setEl('breadcrumbTitle', article.title);

  // Meta top
  const badge = document.getElementById('articleCatBadge');
  if (badge) {
    badge.textContent = article.category;
    badge.className   = `article-cat-badge ${catClass[article.category] || 'cat-ai'}`;
  }
  setEl('articleReadTime', article.readTime);
  setEl('articleDate', article.date);
  setEl('articleViews', article.views);

  // Headline & image
  setEl('articleHeadline', article.title);
  const img = document.getElementById('articleImage');
  if (img) { img.src = article.image; img.alt = article.title; }
  setEl('articleCaption', `صورة: ${article.title}`);

  // Egypt impact box
  const egyptBox = document.getElementById('egyptImpactBox');
  if (egyptBox) { egyptBox.style.display = article.hasEgyptImpact ? 'block' : 'none'; }

  // Share buttons
  const url  = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(article.title);
  setHref('shareFacebook',  `https://facebook.com/sharer/sharer.php?u=${url}`);
  setHref('shareTelegram',  `https://t.me/share/url?url=${url}&text=${text}`);
  setHref('shareWhatsapp',  `https://wa.me/?text=${text}%20${url}`);

  const copyBtn = document.getElementById('shareCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToast('تم نسخ الرابط ✓'))
        .catch(() => showToast('تعذّر نسخ الرابط'));
    });
  }

  // Related articles (same category, exclude current)
  renderRelated(article);

  // Init search & hamburger
  initTicker();
  initHamburger();
  initSearch();
  initNewsletterForms();
}

function renderRelated(current) {
  const grid = document.getElementById('relatedGrid');
  if (!grid) return;
  const related = articles
    .filter(a => a.id !== current.id && a.category === current.category)
    .slice(0, 3);

  const fallback = related.length < 3
    ? articles.filter(a => a.id !== current.id && !related.includes(a)).slice(0, 3 - related.length)
    : [];

  const all = [...related, ...fallback].slice(0, 3);
  grid.innerHTML = all.map((a, i) => buildCard(a, i)).join('');
  lazyLoadImages();
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
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function showToast(msg) {
  const existing = document.getElementById('tdnToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'tdnToast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:var(--navy);color:#fff;
    font-family:'Cairo',sans-serif;font-size:.95rem;font-weight:600;
    padding:14px 22px;border-radius:10px;
    box-shadow:0 6px 20px rgba(0,0,0,0.25);
    animation:fadeInUp .3s ease both;
    max-width:320px;line-height:1.5;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
