// Daily Instagram carousel: picks the day's top stories from the live news sitemap, renders 1080x1350 slides
// (Arabic, TD brand style) with headless Chrome, saves JPEGs to carousel/<cairo-date>/ and prints a JSON summary.
// Usage: node scripts/ig-carousel.mjs [--out carousel] [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SITE = 'https://td-arabi.com';
const OUT_ROOT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'carousel';
const MAX = 7, MIN = 3, WANT = 5;

const cairoDate = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(d);
const today = process.env.CAROUSEL_DATE || cairoDate();
const dir = path.join(OUT_ROOT, today);

const dec = s => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const meta = (html, p) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]+content=["']([^"']*)["']`, 'i')) ||
            html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${p}["']`, 'i'));
  return m ? dec(m[1]) : '';
};

// content rules: no betting/gambling, drugs, politics or religion promotion
const BANNED = /(\bcasino\b|betting|\bgambl|\bpoker\b|\bbet365\b|كازينو|مراهنات|قمار|رهان|مخدر|حشيش|\bdrugs?\b|cannabis|\belection|انتخابات|\bvote\b|تصويت|حزب|\bparty\b|سياس|\bpolitic|\bwar\b|حرب|\bislam|إسلام|مسيح|\bchurch|كنيسة|دين\b|ديني|\bchristian|جماعة|houthi|الحوثي|\bmilitary|عسكري|\bsanction)/i;
const CLUSTERS = [[/gta|جي تي إيه|rockstar|روكستار/i, 'gta', 2], [/witcher|ويتشر/i, 'witcher', 1]];

async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'td-arabi-carousel' } });
  if (!r.ok) throw new Error(url + ' ' + r.status);
  return r.text();
}

async function pickStories() {
  const sm = await get(SITE + '/news-sitemap.xml');
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).slice(0, 40);
  const items = [];
  for (const u of urls) {
    try {
      const h = await get(u);
      const pub = meta(h, 'article:published_time');
      items.push({
        url: u, title: meta(h, 'og:title'), desc: meta(h, 'og:description'), image: meta(h, 'og:image'),
        section: meta(h, 'article:section') || 'تقنية', pub: pub ? new Date(pub) : null,
      });
    } catch (e) { console.error('skip', u, e.message); }
  }
  const dayStart = new Date(Date.now() - 24 * 3600e3);
  let pool = items.filter(i => i.title && i.pub && i.pub >= dayStart && !BANNED.test(i.title + ' ' + i.desc));
  if (pool.length < MIN) pool = items.filter(i => i.title && i.pub && i.pub >= new Date(Date.now() - 36 * 3600e3) && !BANNED.test(i.title + ' ' + i.desc));
  // score: newest first, one story per section before repeating, topic clusters capped
  pool.sort((a, b) => b.pub - a.pub);
  const picked = [], sec = {}, clu = {};
  const take = (i, secCap) => {
    if (picked.includes(i) || picked.length >= MAX) return;
    if ((sec[i.section] || 0) >= secCap) return;
    for (const [re, k, cap] of CLUSTERS) if (re.test(i.title + ' ' + i.desc) && (clu[k] || 0) >= cap) return;
    for (const [re, k] of CLUSTERS) if (re.test(i.title + ' ' + i.desc)) clu[k] = (clu[k] || 0) + 1;
    sec[i.section] = (sec[i.section] || 0) + 1; picked.push(i);
  };
  for (const cap of [1, 2, 3]) { for (const i of pool) { if (picked.length >= WANT && cap > 1) break; take(i, cap); } }
  return picked.slice(0, MAX);
}

const AR_DIGITS = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const arDate = new Intl.DateTimeFormat('ar-EG', { timeZone: 'Africa/Cairo', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

const short = (s, n) => { s = s.replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; return s.slice(0, n).replace(/\s+\S*$/, '') + '…'; };

const CSS = `<meta charset=utf-8><style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;800&display=swap');
*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:Cairo,'Noto Sans Arabic',sans-serif;direction:rtl;color:#fff;position:relative;background:#0b1530}
.bg{position:absolute;inset:-60px;background-size:cover;background-position:center;filter:blur(22px) brightness(.34)}
.ov{position:absolute;inset:0;background:linear-gradient(180deg,#0b1530dd,#0b153099 45%,#0b1530ee)}
.in{position:absolute;inset:0;padding:90px 80px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center}
.logo{font-size:46px;font-weight:800}.logo span{color:#38bdf8}
.pg{font-size:30px;color:#bae6fd;font-weight:600;direction:ltr}
.card{margin:auto 0;background:#fff;color:#0b1530;border-radius:44px;padding:64px 60px;box-shadow:0 30px 80px #0006}
.tag{display:inline-block;background:#0ea5e9;color:#fff;font-size:32px;font-weight:800;border-radius:30px;padding:4px 30px}
.num{float:left;font-size:110px;font-weight:800;color:#bae6fd;line-height:1}
h1{font-size:64px;font-weight:800;line-height:1.4;margin:34px 0 26px}
p{font-size:36px;font-weight:600;line-height:1.6;color:#334155}
.foot{display:flex;justify-content:center;font-size:32px;color:#bae6fd;font-weight:600;direction:ltr}
.c{margin:auto 0;text-align:center;display:flex;flex-direction:column;align-items:center;gap:26px}
.big{font-size:150px;font-weight:800;line-height:1.1}.big span{color:#38bdf8}
.h2{font-size:68px;font-weight:800;line-height:1.35}.sub{font-size:40px;color:#bae6fd;font-weight:600}
.pill{background:#0ea5e9;border-radius:50px;padding:10px 54px;font-size:46px;font-weight:800;direction:ltr}
.pill.t{background:#229ed9;font-size:40px}
.chip{background:#ffffff1f;border:2px solid #ffffff44;border-radius:40px;padding:6px 40px;font-size:38px;font-weight:600}
</style>`;

function coverHtml(stories) {
  const bg = stories.slice(0, 1).map(s => s.image).filter(Boolean)[0] || '';
  return `${CSS}<div class=bg style="background-image:url('${bg}')"></div><div class=ov></div><div class=in>
<div class=top><div class=logo>TD <span>بالعربي</span></div><div class=pg>td-arabi.com</div></div>
<div class=c><div class=sub>${esc(arDate)}</div><div class=big>أهم <span>أخبار</span><br>التقنية اليوم</div>
<div class=chip>${AR_DIGITS(stories.length)} أخبار في دقيقة واحدة</div><div class=sub>اسحب لقراءة الأخبار ←</div></div>
<div class=foot>t.me/td_arabi</div></div>`;
}
function storyHtml(s, i, total) {
  return `${CSS}<div class=bg style="background-image:url('${s.image || ''}')"></div><div class=ov></div><div class=in>
<div class=top><div class=logo>TD <span>بالعربي</span></div><div class=pg>${i + 1} / ${total}</div></div>
<div class=card><div class=num>${AR_DIGITS(String(i).padStart(2, '0'))}</div><span class=tag>${esc(s.section)}</span>
<h1>${esc(short(s.title, 95))}</h1><p>${esc(short(s.desc, 150))}</p></div>
<div class=foot>td-arabi.com</div></div>`;
}
function ctaHtml(total, n) {
  return `${CSS}<div class=bg style="background:#0b1530"></div><div class=ov></div><div class=in>
<div class=top><div class=logo>TD <span>بالعربي</span></div><div class=pg>${total} / ${total}</div></div>
<div class=c><div class=h2>الخبر كامل:<br>الرابط في البايو</div><div class=pill>td-arabi.com</div>
<div class=sub>وتابعنا على تيليجرام للأدوات المجانية</div><div class="pill t">t.me/td_arabi</div></div><div class=foot style="direction:rtl">TD بالعربي</div></div>`;
}

function render(html, jpgPath) {
  const tmpHtml = path.resolve(dir, '_s.html'), png = path.resolve(dir, '_s.png');
  fs.writeFileSync(tmpHtml, html);
  const chrome = process.env.CHROME || 'google-chrome';
  execFileSync(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1080,1350', '--virtual-time-budget=12000', `--screenshot=${png}`, 'file://' + tmpHtml], { stdio: 'ignore', timeout: 60000 });
  execFileSync('convert', [png, '-background', '#0b1530', '-flatten', '-quality', '90', jpgPath]);
  fs.rmSync(tmpHtml); fs.rmSync(png);
}

const stories = await pickStories();
console.error('stories:', stories.length);
if (stories.length < MIN) { console.log(JSON.stringify({ ok: false, skipped: 'fewer than ' + MIN + ' stories', count: stories.length })); process.exit(0); }
fs.mkdirSync(dir, { recursive: true });
const slides = [];
render(coverHtml(stories), path.join(dir, 's1.jpg')); slides.push('s1.jpg');
stories.forEach((s, i) => { const f = `s${i + 2}.jpg`; render(storyHtml(s, i + 1, stories.length + 2), path.join(dir, f)); slides.push(f); });
const last = `s${stories.length + 2}.jpg`; render(ctaHtml(stories.length + 2, stories.length), path.join(dir, last)); slides.push(last);
const caption = `أهم أخبار التقنية والذكاء الاصطناعي اليوم في ${AR_DIGITS(stories.length)} شرائح 👆\nاحفظ المنشور وتابعنا لأخبار كل يوم.\n\n#تقنية #ذكاء_اصطناعي #أخبار_التقنية`;
fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ date: today, slides, caption, stories: stories.map(s => ({ url: s.url, title: s.title })) }, null, 1));
console.log(JSON.stringify({ ok: true, date: today, slides, count: stories.length }));
