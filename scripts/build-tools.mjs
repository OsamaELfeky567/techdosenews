// Builds the "أدوات" (free browser tools) section: /free-tools/ hub + one SEO page per tool.
// Run: node scripts/build-tools.mjs   (output is committed; build-site.mjs lists these URLs in sitemap-pages.xml)
import fs from 'fs';
const rj = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const site = { base_url: 'https://td-arabi.com', telegram_url: 'https://t.me/td_arabi', ...rj('data/site.json', {}) };
const BASE = site.base_url;
const SOCIAL_OK = site.social_verified === true; // set true in data/site.json once real channel/page URLs are confirmed
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const NAV = `<a href="/">الرئيسية</a><a href="/news/">كل الأخبار</a><a href="/free-tools/">أدوات</a><a href="/about.html">من نحن</a><a href="/contact.html">تواصل معنا</a>`;
const HEADER = `<header class="sb-header"><div class="sb-container">
<button class="sb-menu-btn" aria-label="القائمة" aria-expanded="false" onclick="var n=document.querySelector('.sb-nav');var o=n.classList.toggle('open');this.setAttribute('aria-expanded',o)">☰</button>
<div class="sb-logo-wrap" style="margin:0;font-size:inherit;font-weight:inherit"><a href="/" class="sb-logo">TD <span>بالعربي</span></a></div>
<nav class="sb-nav" aria-label="القائمة الرئيسية">${NAV}${SOCIAL_OK ? `<a href="${esc(site.telegram_url)}" class="sb-telegram-btn" target="_blank" rel="noopener">تيليجرام</a>` : ''}</nav>
</div></header>`;
const FOOTER = `<footer class="sb-footer"><div class="sb-container">
<div class="sb-footer-grid"><div class="sb-footer-col"><div class="sb-footer-logo">TD <span>بالعربي</span></div>
<p>منصة عربية متخصصة في تغطية أخبار التقنية والذكاء الاصطناعي، مع أدوات مجانية تعمل داخل متصفحك.</p></div></div>
<div class="sb-footer-bottom"><p>© ${new Date().getUTCFullYear()} TD بالعربي — جميع الحقوق محفوظة.</p>
<p style="margin-top:8px;font-size:.8rem">${SOCIAL_OK ? `<a href="${esc(site.telegram_url)}" target="_blank" rel="noopener">تيليجرام</a> · <a href="${esc(site.facebook_url)}" target="_blank" rel="noopener">فيسبوك</a> · ` : ''}<a href="/free-tools/">أدوات مجانية</a> · <a href="/about.html">من نحن</a> · <a href="/contact.html">اتصل بنا</a> · <a href="/privacy.html">سياسة الخصوصية</a> · <a href="/terms.html">شروط الاستخدام</a> · <a href="/disclaimer.html">إخلاء مسؤولية</a> · <a href="/editorial-policy.html">السياسة التحريرية</a></p></div>
</div></footer>`;
const HEAD_COMMON = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>const theme=localStorage.getItem('td-theme');if(theme==='dark'||(!theme&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.setAttribute('data-theme','dark')</script>
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
<script src="/js/analytics.js" async></script>`;
const adSlot = (size, cls = '') => {
  const key = site.ads && site.ads[size];
  if (!key || (site.ads_disabled || []).includes(size)) return '';
  const [w, h] = size.split('x');
  return `<div class="td-ad ${cls}" style="min-height:${+h + 24}px"><div class="td-ad-label">إعلان</div><div class="td-ad-box"><script>atOptions={'key':'${key}','format':'iframe','height':${h},'width':${w},'params':{}};</script><script src="https://www.highperformanceformat.com/${key}/invoke.js"></script></div></div>`;
};
const CSS = `<style>
.ft-wrap{max-width:900px;margin:0 auto;padding:24px 16px}
.ft-card{background:var(--surface);border:1px solid var(--border-light,#e5e7eb);border-radius:14px;padding:28px}
.ft-wrap h1{font-size:1.9rem;line-height:1.5;margin:6px 0 10px;font-weight:800}
.ft-wrap h2{font-size:1.3rem;margin:28px 0 10px;font-weight:800}
.ft-wrap p,.ft-wrap li{font-size:1.05rem;line-height:2}
.ft-crumb{font-size:.85rem;color:var(--muted)}.ft-crumb a{color:var(--accent)}
.ft-lead{color:var(--text-2)}
.ft-drop{border:2px dashed var(--accent);border-radius:14px;padding:38px 16px;text-align:center;cursor:pointer;background:var(--accent-glass);transition:background .2s;margin:18px 0}
.ft-drop.over,.ft-drop:hover,.ft-drop:focus-visible{background:var(--accent-light)}
.ft-drop b{display:block;font-size:1.2rem;margin-bottom:6px}.ft-drop span{color:var(--muted);font-size:.95rem}
.ft-btn{display:inline-block;background:var(--accent);color:#fff;border:0;border-radius:10px;padding:11px 24px;font-family:inherit;font-weight:700;font-size:1rem;cursor:pointer;text-decoration:none}
.ft-btn.sec{background:var(--surface-2);color:var(--text);border:1px solid var(--border)}
.ft-status{min-height:1.6em;font-size:.98rem;color:var(--text-2);margin:6px 0}.ft-status.err{color:#dc2626;font-weight:700}
.ft-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0}
.ft-grid2 figure{margin:0;text-align:center}.ft-grid2 figcaption{font-size:.85rem;color:var(--muted);margin-top:4px}
.ft-grid2 canvas{max-width:100%;height:auto;border-radius:10px;border:1px solid var(--border)}
.ft-grid2 canvas.checker{background:repeating-conic-gradient(#e5e7eb 0 25%,#fff 0 50%) 0 0/20px 20px}
.ft-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:10px 0}
.ft-row select,.ft-row input[type=range]{font-family:inherit;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text)}
.ft-tools{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin:18px 0}
.ft-tool{display:block;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;transition:transform .15s,box-shadow .15s}
.ft-tool:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}.ft-tool b{display:block;font-size:1.1rem;margin-bottom:6px}.ft-tool span{color:var(--text-2);font-size:.92rem;line-height:1.8}
.ft-faq details{border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin:8px 0;background:var(--surface-2)}.ft-faq summary{cursor:pointer;font-weight:700}
.ft-follow{background:var(--accent-glass);border:1px solid var(--accent);border-radius:14px;padding:16px 18px;margin:22px 0;text-align:center}.ft-follow p{margin:4px 0 12px}.ft-follow .ft-btn{margin:4px}\n.ft-note{background:var(--surface-2);border-right:4px solid var(--accent);border-radius:8px;padding:10px 14px;font-size:.95rem;margin:14px 0}
.td-ad{margin:22px auto;text-align:center;max-width:100%;overflow:hidden}.td-ad-label{font-size:.65rem;color:var(--muted);margin-bottom:4px}.td-ad-box{display:flex;justify-content:center;overflow:hidden}
@media(max-width:960px){.td-ad-d{display:none}}@media(min-width:961px){.td-ad-m{display:none}}
@media(max-width:640px){.ft-card{padding:16px}.ft-wrap h1{font-size:1.45rem}.ft-grid2{grid-template-columns:1fr}}
</style>`;

const FOLLOW = !SOCIAL_OK ? '' : `<div class="ft-follow"><b>تابعنا ليصلك كل جديد</b><p>أخبار التقنية والذكاء الاصطناعي وأدوات جديدة أولا بأول.</p><a class="ft-btn" href="${esc(site.telegram_url)}" target="_blank" rel="noopener">قناتنا على تيليجرام</a> <a class="ft-btn sec" href="${esc(site.facebook_url || 'https://facebook.com/techdosenews')}" target="_blank" rel="noopener">صفحتنا على فيسبوك</a></div>`;
const TOOLS = rj('free-tools/tools.json', []);
const jsonLd = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const write = (rel, c) => { fs.mkdirSync(rel.split('/').slice(0, -1).join('/') || '.', { recursive: true }); fs.writeFileSync(rel, c, 'utf8'); };
const ads = () => adSlot('728x90', 'td-ad-d') + adSlot('300x250', 'td-ad-m');

function page({ path, title, desc, h1, body, ld }) {
  const url = BASE + path;
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
${HEAD_COMMON}
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="ar" href="${url}">
<meta property="og:locale" content="ar_AR"><meta property="og:type" content="website"><meta property="og:site_name" content="TD بالعربي">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${BASE}/img/og-image.png">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">
${ld.map(jsonLd).join('\n')}
${CSS}
</head>
<body>
${HEADER}
<main class="ft-wrap"><div class="ft-card">
<div class="ft-crumb"><a href="/">الرئيسية</a> › <a href="/free-tools/">أدوات</a>${path === '/free-tools/' ? '' : ' › ' + esc(h1)}</div>
<h1>${esc(h1)}</h1>
${body}
</div></main>
${FOOTER}
</body></html>
`;
}

// hub
const hubBody = `<p class="ft-lead">مجموعة أدوات مجانية بالعربية تعمل مباشرة داخل متصفحك: بدون تسجيل، بدون رفع ملفاتك إلى أي خادم، وبدون أي رسوم.</p>
<div class="ft-tools">${TOOLS.map(t => `<a class="ft-tool" href="/free-tools/${t.slug}/"><b>${esc(t.name)}</b><span>${esc(t.blurb)}</span></a>`).join('')}</div>
${ads()}
<h2>لماذا أدوات TD بالعربي؟</h2>
<ul><li><b>خصوصية كاملة:</b> المعالجة تتم على جهازك، ولا تُرفع صورك أو ملفاتك.</li><li><b>مجانية بالكامل:</b> بدون علامة مائية وبدون حد يومي.</li><li><b>سريعة:</b> تعمل على الهاتف والكمبيوتر دون تثبيت أي برنامج.</li></ul>
${FOLLOW}
<div class="ft-note">تحتاج أداة غير موجودة؟ <a href="/contact.html">اقترحها علينا</a> وسنضيفها.</div>`;
write('free-tools/index.html', page({
  path: '/free-tools/', title: 'أدوات مجانية أونلاين بالعربية: إزالة الخلفية وضغط الصور وأكثر | TD بالعربي',
  desc: 'أدوات مجانية بالعربية تعمل داخل المتصفح: إزالة خلفية الصور، ضغط الصور، تحويل الصور إلى PDF وغيرها. بدون تسجيل وبدون رفع ملفاتك.',
  h1: 'أدوات مجانية أونلاين', body: hubBody,
  ld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'أدوات مجانية أونلاين', url: BASE + '/free-tools/', inLanguage: 'ar', hasPart: TOOLS.map(t => ({ '@type': 'WebPage', name: t.h1, url: `${BASE}/free-tools/${t.slug}/` })) }],
}));

// tool pages
for (const t of TOOLS) {
  const widget = fs.readFileSync(`free-tools/widgets/${t.slug}.html`, 'utf8');
  const others = TOOLS.filter(x => x.slug !== t.slug);
  const body = `<p class="ft-lead">${t.intro}</p>
${widget}
${ads()}
<h2>كيف تستخدم الأداة في ${t.steps.length} خطوات</h2>
<ol>${t.steps.map(s => `<li>${s}</li>`).join('')}</ol>
<h2>${t.featuresTitle}</h2>
<ul>${t.features.map(s => `<li>${s}</li>`).join('')}</ul>
${t.extra || ''}
<div class="ft-note">🔒 <b>خصوصيتك محفوظة:</b> تتم معالجة الملفات بالكامل داخل متصفحك. لا نرفع ولا نحفظ أي صورة أو ملف.</div>
${FOLLOW}
<h2>أسئلة شائعة</h2>
<div class="ft-faq">${t.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
${ads()}
${others.length ? `<h2>أدوات أخرى قد تهمك</h2><div class="ft-tools">${others.map(o => `<a class="ft-tool" href="/free-tools/${o.slug}/"><b>${esc(o.name)}</b><span>${esc(o.blurb)}</span></a>`).join('')}</div>` : ''}
<script src="${t.script}" defer></script>`;
  write(`free-tools/${t.slug}/index.html`, page({
    path: `/free-tools/${t.slug}/`, title: t.title, desc: t.desc, h1: t.h1, body,
    ld: [
      { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: t.h1, applicationCategory: 'MultimediaApplication', operatingSystem: 'Any (web browser)', inLanguage: 'ar', url: `${BASE}/free-tools/${t.slug}/`, description: t.desc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'الرئيسية', item: BASE + '/' }, { '@type': 'ListItem', position: 2, name: 'أدوات', item: BASE + '/free-tools/' }, { '@type': 'ListItem', position: 3, name: t.h1, item: `${BASE}/free-tools/${t.slug}/` }],
      },
    ],
  }));
}
console.log('tools pages:', TOOLS.length + 1);
