// Builds the static, crawlable parts of td-arabi.com from data/articles/index.json (+ archive.json):
//   news/<slug>-<id>/index.html  one pre-rendered page per article (og tags, NewsArticle JSON-LD)
//   news/index.html, news/page/N/index.html  crawlable hub pages with real <a href> links
//   sitemap.xml (index), sitemap-pages.xml, sitemap-articles.xml, news-sitemap.xml (last 48 h only)
//   data/articles/url-map.json and entry.path / entry.techdose_link in index.json
// Usage: node scripts/build-site.mjs [--all] [--sitemaps-only] [--out DIR]
import fs from 'fs';
import path from 'path';
import { slugify, shortId, articlePath } from './lib/urls.mjs';

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const SITEMAPS_ONLY = args.includes('--sitemaps-only');
const OUT = args.includes('--out') ? args[args.indexOf('--out') + 1] : '.';
const rj = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const site = { base_url: 'https://td-arabi.com', site_name: 'TD بالعربي', ...rj('data/site.json', {}) };
const BASE = site.base_url;
const INDEX = 'data/articles/index.json';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = o => JSON.stringify(o).replace(/</g, '\\u003c');
const pathOf = articlePath;
const isoClean = d => new Date(d).toISOString().replace(/\.\d{3}Z$/, 'Z');
const sanitize = h => String(h || '').replace(/<(script|style|iframe|object|embed|form)[\s\S]*?<\/\1>/gi, '').replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, '').replace(/javascript:/gi, '').replace(/<h1/gi, '<h2').replace(/<\/h1>/gi, '</h2>');
const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const CATS = Object.fromEntries(rj('data/categories.json', []).map(c => [c.id, c.name]));
const catLabel = c => CATS[c] || c || 'تقنية';
const fmtDate = d => new Date(d).toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo', year: 'numeric', month: 'long', day: 'numeric' });

// ---------- data ----------
const live = rj(INDEX, []);
const archive = rj('data/articles/archive.json', []);
const seen = new Set();
const articles = [...live, ...archive].filter(a => a && a.id && a.status === 'published' && a.title && !seen.has(a.id) && seen.add(a.id))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

// unique paths
const used = new Map();
for (const a of articles) {
  let p = pathOf(a);
  if (used.has(p) && used.get(p) !== a.id) p = p.replace(/\/$/, '') + '-' + a.id.replace(/\D/g, '').slice(-4) + '/';
  used.set(p, a.id); a.path = p;
}
const url = a => BASE + a.path;

// write path/techdose_link back into index.json entries (so the front end and feeds can use them)
let changed = false;
for (const a of live) { const m = articles.find(x => x.id === a.id); if (m && (a.path !== m.path || a.techdose_link !== BASE + m.path)) { a.path = m.path; a.techdose_link = BASE + m.path; changed = true; } }
if (changed && OUT === '.') fs.writeFileSync(INDEX, JSON.stringify(live, null, 2) + '\n');
const urlMap = Object.fromEntries(articles.map(a => [a.id, a.path]));
const write = (rel, content) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content, 'utf8'); };
if (OUT === '.') write('data/articles/url-map.json', JSON.stringify(urlMap));

// keep the inline redirect map in article.html fresh (old article.html?id=... URLs -> /news/ pages).
// Googlebot renders the page before following a JS redirect, so the lookup must need zero network.
// Skipped in CI: article.html is not in the workflow's git add list, and an unstaged edit breaks its git pull --rebase.
// Refresh by running a local build and pushing article.html (the fetch fallback in article.html covers anything newer).
if (OUT === '.' && !process.env.CI) {
  const ah = 'article.html';
  let src = fs.readFileSync(ah, 'utf8');
  const block = '// URLMAP-START\nvar TD_URL_MAP = ' + JSON.stringify(urlMap) + ';\n// URLMAP-END';
  if (/\/\/ URLMAP-START[\s\S]*?\/\/ URLMAP-END/.test(src)) fs.writeFileSync(ah, src.replace(/\/\/ URLMAP-START[\s\S]*?\/\/ URLMAP-END/, block), 'utf8');
}

// ---------- shared layout ----------
const HEAD_COMMON = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>const theme=localStorage.getItem('td-theme');if(theme==='dark'||(!theme&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.setAttribute('data-theme','dark')</script>
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
<link rel="alternate" type="application/rss+xml" title="TD بالعربي - RSS Feed" href="${BASE}/rss.xml">
<script src="/js/analytics.js" async></script>
<script src="/js/push.js" defer></script>`;
const HEADER = `<header class="sb-header"><div class="sb-container">
<button class="sb-menu-btn" aria-label="القائمة" aria-expanded="false" onclick="var n=document.querySelector('.sb-nav');var o=n.classList.toggle('open');this.setAttribute('aria-expanded',o)">☰</button>
<div class="sb-logo-wrap" style="margin:0;font-size:inherit;font-weight:inherit"><a href="/" class="sb-logo">TD <span>بالعربي</span></a></div>
<nav class="sb-nav" aria-label="القائمة الرئيسية"><a href="/">الرئيسية</a><a href="/news/">كل الأخبار</a><a href="/free-tools/">أدوات</a><a href="/about.html">من نحن</a><a href="/contact.html">تواصل معنا</a>${site.social_verified === true ? `<a href="${esc(site.telegram_url)}" class="sb-telegram-btn" target="_blank" rel="noopener">تيليجرام</a>` : ''}</nav>
</div></header>`;
const FOOTER = `<footer class="sb-footer"><div class="sb-container">
<div class="sb-footer-grid"><div class="sb-footer-col"><div class="sb-footer-logo">TD <span>بالعربي</span></div>
<p>منصة عربية متخصصة في تغطية أخبار التقنية والذكاء الاصطناعي والشركات الناشئة.</p></div></div>
<div class="sb-footer-bottom"><p>© ${new Date().getUTCFullYear()} TD بالعربي — جميع الحقوق محفوظة.</p>
<p style="margin-top:8px;font-size:.8rem"><a href="/free-tools/">أدوات مجانية</a> · <a href="/about.html">من نحن</a> · <a href="/contact.html">اتصل بنا</a> · <a href="/privacy.html">سياسة الخصوصية</a> · <a href="/terms.html">شروط الاستخدام</a> · <a href="/disclaimer.html">إخلاء مسؤولية</a> · <a href="/editorial-policy.html">السياسة التحريرية</a></p></div>
</div></footer>`;

const adSlot = (size, cls = '') => {
  const key = site.ads && site.ads[size];
  if (!key || (site.ads_disabled || []).includes(size)) return '';
  const [w, h] = size.split('x');
  return `<div class="td-ad ${cls}" style="min-height:${+h + 24}px"><div class="td-ad-label">إعلان</div><div class="td-ad-box"><script>atOptions={'key':'${key}','format':'iframe','height':${h},'width':${w},'params':{}};</script><script src="https://www.highperformanceformat.com/${key}/invoke.js"></script></div></div>`;
};
const PAGE_CSS = `<style>
.td-main{max-width:1160px;margin:0 auto;padding:24px 16px;display:grid;grid-template-columns:minmax(0,760px) 300px;gap:32px;justify-content:center;align-items:start}
.td-article{background:var(--surface);border:1px solid var(--border-light,#e5e7eb);border-radius:12px;padding:36px;min-width:0}
.td-article h1{font-size:2rem;line-height:1.5;margin:6px 0 12px;font-weight:800}
.td-article .sb-article-body{font-size:1.15rem;line-height:2}
.td-article .sb-article-body p{margin:0 0 1.1em}
.td-meta{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.85rem;color:var(--muted);margin-bottom:16px}
.td-meta b{color:var(--text);font-weight:600}
.td-fig{margin:0 0 22px}.td-fig img{border-radius:10px;display:block}
.td-fig figcaption{font-size:.78rem;color:var(--muted);margin-top:6px}
.td-side{position:sticky;top:76px;display:flex;flex-direction:column;gap:18px}
.td-card{background:var(--surface);border:1px solid var(--border-light,#e5e7eb);border-radius:12px;padding:16px}
.td-card h2,.td-card h3{font-size:1.05rem;margin:0 0 10px;font-weight:800}
.td-side-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-light,#eee);font-size:.9rem;line-height:1.5}
.td-side-item:last-child{border:0}.td-side-item img{width:72px;height:54px;object-fit:cover;border-radius:6px;flex:none}
.td-ad{margin:22px auto;text-align:center;max-width:100%;overflow:hidden}
.td-ad-label{font-size:.65rem;color:var(--muted);margin-bottom:4px}
.td-ad-box{display:flex;justify-content:center;overflow:hidden}
.td-inline-rel{margin:18px 0;padding:12px 16px;border-right:4px solid var(--accent);background:var(--surface-2,#f1f5f9);border-radius:8px;font-size:.95rem}
.td-inline-rel a{color:var(--accent);font-weight:700}
.td-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:8px}
.td-rc{display:block;border:1px solid var(--border-light,#e5e7eb);border-radius:10px;overflow:hidden;background:var(--surface)}
.td-rc img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}.td-rc span{display:block;padding:10px;font-size:.9rem;line-height:1.5;font-weight:600}
.td-tg{background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;border-radius:12px;padding:22px;text-align:center;margin:24px 0}
.td-tg a{display:inline-block;background:#fff;color:#1d4ed8;font-weight:800;padding:10px 26px;border-radius:8px;margin-top:8px}
#td-progress{position:fixed;top:0;right:0;height:3px;width:0;background:var(--accent);z-index:999}
.td-share{position:sticky;bottom:0;display:none}
@media(max-width:960px){.td-main{grid-template-columns:minmax(0,1fr);padding:12px}.td-side{position:static}.td-article{padding:18px}.td-article h1{font-size:1.5rem}.td-article .sb-article-body{font-size:1.08rem}.td-cards{grid-template-columns:1fr}.td-ad-d{display:none}}
@media(min-width:961px){.td-ad-m{display:none}}
</style>`;

function related(a, n = 5) {
  const same = articles.filter(x => x.id !== a.id && x.category === a.category);
  const rest = articles.filter(x => x.id !== a.id && x.category !== a.category);
  return [...same, ...rest].slice(0, n);
}

function articlePage(a) {
  const u = url(a);
  const title = a.title.trim();
  const desc = (a.meta_description || a.excerpt || strip(a.body).slice(0, 155)).trim();
  const img = a.image && /^https?:/.test(a.image) ? a.image : BASE + '/img/og-image.png';
  const published = isoClean(a.date);
  const modified = isoClean(a.modified || a.date);
  const hasDims = a.image_w && a.image_h;
  const author = { '@type': site.author_type || 'Organization', name: site.author_name, url: site.author_url };
  const ld = {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: title.slice(0, 110), description: desc, image: [img],
    datePublished: published, dateModified: modified, author: [author], inLanguage: 'ar', isAccessibleForFree: true,
    articleSection: catLabel(a.category), keywords: (a.tags || []).join(', '),
    publisher: { '@type': 'Organization', name: site.site_name, url: BASE, logo: { '@type': 'ImageObject', url: site.logo_url } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': u },
  };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: site.site_name, item: BASE + '/' },
    { '@type': 'ListItem', position: 2, name: 'الأخبار', item: BASE + '/news/' },
    { '@type': 'ListItem', position: 3, name: title, item: u }] };
  const imgTag = `<img src="${esc(img)}" alt="${esc(title)}" fetchpriority="high" decoding="async"${hasDims ? ` width="${a.image_w}" height="${a.image_h}"` : ''} style="width:100%;height:auto;aspect-ratio:16/9;object-fit:cover">`;
  const credit = a.image_source && !['default', 'pexels'].includes(a.image_source) ? `<figcaption style="font-size:.8rem;color:var(--muted);margin-top:6px">الصورة من موقع المصدر: ${esc(a.source)}</figcaption>` : (a.image_source === 'pexels' ? '<figcaption style="font-size:.8rem;color:var(--muted);margin-top:6px">الصورة: Pexels</figcaption>' : '');
  const relList = related(a, 6);
  const thumb = r => (r.image && /^https?:/.test(r.image) ? r.image : BASE + '/img/og-image.png');
  const relCards = relList.slice(0, 3).map(r => `<a class="td-rc" href="${r.path}"><img src="${esc(thumb(r))}" alt="" loading="lazy" width="320" height="180"><span>${esc(r.title)}</span></a>`).join('');
  const sideItems = related(a, 12).slice(3, 10).map(r => `<a class="td-side-item" href="${r.path}"><img src="${esc(thumb(r))}" alt="" loading="lazy" width="72" height="54"><span>${esc(r.title)}</span></a>`).join('');
  const bodyWithSlots = a => {
    const body = sanitize(a.body); const parts = body.split('</p>'); const out = [];
    parts.forEach((p, i) => { if (!p.trim()) return; out.push(p + '</p>');
      if (i === 1) out.push(adSlot('300x250', 'td-ad-m'));
      if (i === 2 && relList[0]) out.push(`<div class="td-inline-rel">اقرأ أيضا: <a href="${relList[0].path}">${esc(relList[0].title)}</a></div>`);
      if (i === 4) out.push(adSlot('300x250', 'td-ad-m') + (relList[1] ? `<div class="td-inline-rel">قد يهمك: <a href="${relList[1].path}">${esc(relList[1].title)}</a></div>` : '')); });
    return out.join('');
  };
  const tags = (a.tags || []).map(t => `<span class="sb-tag" style="display:inline-block;margin:0 0 6px 6px;padding:2px 10px;border-radius:12px;background:var(--surface-2,#eef2f7);font-size:.8rem">${esc(t)}</span>`).join('');
  const enc = encodeURIComponent(u), encT = encodeURIComponent(title);
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
${HEAD_COMMON}
<title>${esc((a.seo_title || title).slice(0, 70))} | ${esc(site.site_name)}</title>
<meta name="description" content="${esc(desc.slice(0, 200))}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="author" content="${esc(site.author_name)}">
<link rel="canonical" href="${u}">
<link rel="alternate" hreflang="ar" href="${u}">
<meta property="og:locale" content="ar_AR">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${esc(site.site_name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc.slice(0, 200))}">
<meta property="og:url" content="${u}">
<meta property="og:image" content="${esc(img)}">
${hasDims ? `<meta property="og:image:width" content="${a.image_w}">\n<meta property="og:image:height" content="${a.image_h}">` : ''}
<meta property="article:published_time" content="${published}">
<meta property="article:modified_time" content="${modified}">
<meta property="article:section" content="${esc(catLabel(a.category))}">
${(a.tags || []).slice(0, 5).map(t => `<meta property="article:tag" content="${esc(t)}">`).join('\n')}
${site.social_verified === true && site.facebook_url ? `<meta property="article:publisher" content="${esc(site.facebook_url)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc.slice(0, 200))}">
<meta name="twitter:image" content="${esc(img)}">
${PAGE_CSS}
<script type="application/ld+json">${jsonLd(ld)}</script>
<script type="application/ld+json">${jsonLd(crumbs)}</script>
</head>
<body>
${HEADER}
<div id="td-progress"></div>
<main class="td-main">
<article class="td-article">
<nav aria-label="مسار التنقل" style="font-size:.85rem;color:var(--muted);margin-bottom:8px"><a href="/">الرئيسية</a> › <a href="/news/">الأخبار</a> › <span>${esc(catLabel(a.category))}</span></nav>
<h1>${esc(title)}</h1>
${a.is_rumor ? '<p style="display:inline-block;background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:8px;font-weight:700;font-size:.85rem;margin:0 0 10px">معلومات غير مؤكدة (تسريبات)</p>' : ''}
<div class="td-meta"><b>${esc(site.author_name)}</b><time datetime="${published}">${fmtDate(a.date)}</time><span>${esc(catLabel(a.category))}</span><span>${esc(String(a.readTime || '').replace('min read', 'دقائق قراءة'))}</span></div>
<figure class="td-fig">${imgTag}${credit}</figure>
<div class="td-ad-d">${adSlot('728x90')}</div>
<div class="td-ad-m">${adSlot('320x50')}</div>
<div class="sb-article-body">${bodyWithSlots(a)}</div>
<div class="td-ad-d">${adSlot('728x90')}</div>
<div class="td-ad-m">${adSlot('300x250')}</div>
<div style="margin:24px 0;padding:14px 18px;border-radius:12px;background:var(--surface-2,#f1f5f9);font-size:.95rem">المصدر: <a href="${esc(a.link)}" rel="noopener nofollow" target="_blank">${esc(a.source)}</a>${a.source_title ? ' — ' + esc(a.source_title) : ''}<br><span style="color:var(--muted);font-size:.85rem">${esc(site.ai_disclosure || '')}</span></div>
${site.social_verified === true ? `<div class="td-tg"><b style="font-size:1.1rem">لا يفوتك جديد التقنية</b><br><span style="opacity:.9;font-size:.9rem">أهم الأخبار على قناتنا في تيليجرام أول بأول</span><br><a href="${esc(site.telegram_url)}" target="_blank" rel="noopener">انضم للقناة</a>${site.facebook_url ? ` · <a href="${esc(site.facebook_url)}" target="_blank" rel="noopener">صفحتنا على فيسبوك</a>` : ''}</div>` : ''}
<div>${tags}</div>
<p style="margin-top:18px;font-size:.9rem">شارك: <a href="https://www.facebook.com/sharer/sharer.php?u=${enc}" target="_blank" rel="noopener">فيسبوك</a> · <a href="https://t.me/share/url?url=${enc}&text=${encT}" target="_blank" rel="noopener">تيليجرام</a> · <a href="https://wa.me/?text=${encT}%20${enc}" target="_blank" rel="noopener">واتساب</a> · <a href="https://x.com/intent/post?url=${enc}&text=${encT}" target="_blank" rel="noopener">X</a></p>
<div style="margin:26px 0;padding:16px 18px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2,#f1f5f9)"><b style="display:block;margin-bottom:8px">🛠️ أدوات مجانية قد تفيدك</b><a href="/free-tools/remove-background/">إزالة خلفية الصورة</a> · <a href="/free-tools/compress-image/">ضغط الصور</a> · <a href="/free-tools/images-to-pdf/">تحويل الصور إلى PDF</a> · <a href="/free-tools/arabic-ocr/">استخراج النص من الصورة</a> · <a href="/free-tools/">كل الأدوات</a></div>
<h2 style="font-size:1.2rem;margin:28px 0 10px">اقرأ أيضا</h2>
<div class="td-cards">${relCards}</div>
</article>
<aside class="td-side">
${adSlot('160x600', 'td-ad-d')}${adSlot('300x250', 'td-ad-d')}
<div class="td-card"><h3>أدوات مجانية</h3><p style="margin:0;line-height:2"><a href="/free-tools/remove-background/">إزالة الخلفية</a><br><a href="/free-tools/compress-image/">ضغط الصور</a><br><a href="/free-tools/qr-generator/">مولد QR</a><br><a href="/free-tools/arabic-ocr/">نص من صورة</a></p></div>
<div class="td-card"><h3>الأحدث</h3>${sideItems}</div>
</aside>
</main>
<script>(function(){var b=document.getElementById('td-progress');addEventListener('scroll',function(){var h=document.documentElement;var p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);b.style.width=Math.min(100,p*100)+'%'},{passive:true})})();</script>
${FOOTER}
</body>
</html>
`;
}

function hubPage(items, page, pages) {
  const u = BASE + (page === 1 ? '/news/' : `/news/page/${page}/`);
  const list = items.map(a => `<li style="margin-bottom:18px"><a href="${a.path}" style="font-weight:700;font-size:1.1rem">${esc(a.title)}</a><div style="font-size:.85rem;color:var(--muted)">${fmtDate(a.date)} · ${esc(catLabel(a.category))}</div><p style="margin:4px 0 0;font-size:.95rem">${esc(a.excerpt || '')}</p></li>`).join('');
  const nav = `<nav style="display:flex;gap:14px;margin-top:20px">${page > 1 ? `<a href="${page === 2 ? '/news/' : '/news/page/' + (page - 1) + '/'}">الصفحة السابقة</a>` : ''}${page < pages ? `<a href="/news/page/${page + 1}/">الصفحة التالية</a>` : ''}</nav>`;
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
${HEAD_COMMON}
<title>آخر أخبار التقنية والذكاء الاصطناعي${page > 1 ? ' - صفحة ' + page : ''} | ${esc(site.site_name)}</title>
<meta name="description" content="أحدث أخبار التقنية والذكاء الاصطناعي بالعربية من ${esc(site.site_name)}.">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${u}">
<meta property="og:type" content="website"><meta property="og:locale" content="ar_AR"><meta property="og:site_name" content="${esc(site.site_name)}">
<meta property="og:title" content="آخر أخبار التقنية والذكاء الاصطناعي"><meta property="og:url" content="${u}"><meta property="og:image" content="${esc(site.logo_url)}">
</head>
<body>
${HEADER}
<main class="sb-article-main"><div class="sb-container" style="display:block"><div class="sb-article" style="max-width:900px;margin:0 auto"><h1>آخر الأخبار</h1><ul style="list-style:none;padding:0">${list}</ul>${nav}</div></div></main>
${FOOTER}
</body>
</html>
`;
}

// ---------- pages ----------
if (!SITEMAPS_ONLY) {
  let n = 0;
  for (const a of articles) {
    const rel = a.path.replace(/^\//, '') + 'index.html';
    if (ALL || !fs.existsSync(path.join(OUT, rel))) { write(rel, articlePage(a)); n++; }
  }
  // prune pages of articles that were deleted or unpublished (only in the real tree)
  if (OUT === '.' && fs.existsSync('news')) {
    const keep = new Set(articles.map(a => a.path.split('/')[2]));
    let pr = 0;
    for (const d of fs.readdirSync('news', { withFileTypes: true })) {
      if (!d.isDirectory() || d.name === 'page' || keep.has(d.name)) continue;
      if (fs.existsSync(path.join('news', d.name, 'index.html')) && articles.length > 20) { fs.rmSync(path.join('news', d.name), { recursive: true, force: true }); pr++; }
    }
    if (pr) console.log('pruned ' + pr + ' stale article pages');
  }
  const PER = 40, pages = Math.max(1, Math.ceil(articles.length / PER));
  for (let p = 1; p <= pages; p++) write(p === 1 ? 'news/index.html' : `news/page/${p}/index.html`, hubPage(articles.slice((p - 1) * PER, p * PER), p, pages));
  console.log(`pages: ${n} article pages written, ${pages} hub pages`);
}

// ---------- sitemaps ----------
const xml = s => esc(s);
const now = new Date();
const staticPages = ['/', '/news/', '/free-tools/', '/free-tools/remove-background/', '/free-tools/compress-image/', '/free-tools/images-to-pdf/', '/free-tools/merge-pdf/', '/free-tools/split-pdf/', '/free-tools/qr-generator/', '/free-tools/arabic-ocr/', '/about.html', '/contact.html', '/privacy.html', '/terms.html', '/disclaimer.html', '/editorial-policy.html'];
const today = now.toISOString().slice(0, 10);
write('sitemap-pages.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticPages.map(p => `  <url><loc>${BASE}${p}</loc><lastmod>${p === '/' || p === '/news/' ? isoClean(articles[0]?.date || now) : today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('sitemap-articles.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${articles.map(a => `  <url><loc>${xml(url(a))}</loc><lastmod>${isoClean(a.modified || a.date)}</lastmod></url>`).join('\n')}\n</urlset>\n`);
const recent = articles.filter(a => now - new Date(a.date) < 48 * 36e5).slice(0, 1000);
write('news-sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${recent.map(a => `  <url>\n    <loc>${xml(url(a))}</loc>\n    <news:news>\n      <news:publication><news:name>${xml(site.site_name)}</news:name><news:language>ar</news:language></news:publication>\n      <news:publication_date>${isoClean(a.date)}</news:publication_date>\n      <news:title>${xml(a.title)}</news:title>\n    </news:news>\n  </url>`).join('\n')}\n</urlset>\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['sitemap-pages.xml', 'sitemap-articles.xml', 'news-sitemap.xml'].map(f => `  <sitemap><loc>${BASE}/${f}</loc><lastmod>${isoClean(now)}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>\n`);
console.log(`sitemaps: ${articles.length} articles, ${recent.length} in news sitemap`);
