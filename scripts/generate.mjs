// TD Arabi: one-article-per-run generator. Runs on GitHub Actions (Node 20, no dependencies).
// Flow: RSS -> filters -> dedupe -> Gemini (fallback Groq) -> checks -> index.json -> .run/result.json
import fs from 'fs';
import { articleUrl } from './lib/urls.mjs';

const E = process.env;
const DRY_RUN = E.DRY_RUN === 'true';
const MAX_PER_DAY = +(E.MAX_PER_DAY || 15);      // hard ceiling approved by the owner
const BASE_PER_DAY = +(E.BASE_PER_DAY || 6);     // up to this many/day on normal quality; above it only real trends
const TREND_MIN = +(E.TREND_MIN || 25);          // trend score needed for articles beyond BASE_PER_DAY
const FRESH_HOURS = +(E.FRESH_HOURS || 36);
const MIN_SCORE = +(E.MIN_SCORE || 60);
const MIN_WORDS = +(E.MIN_WORDS || 250);
const BASE = 'https://td-arabi.com';
const GEMINI_MODELS = (E.GEMINI_MODELS || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.6-flash').split(',').map(s => s.trim()).filter(Boolean);
const GROQ_MODEL = E.GROQ_MODEL || 'openai/gpt-oss-120b';
const INDEX = 'data/articles/index.json';
const UA = 'Mozilla/5.0 (compatible; TDArabiBot/2.0; +https://td-arabi.com)';

const rj = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const wj = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n', 'utf8');
const log = (...a) => console.log(...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const TECH_KW = ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'openai', 'anthropic', 'claude', 'gemini', 'chatbot', 'software', 'startup', 'cyber', 'security', 'hack', 'breach', 'chip', 'processor', 'nvidia', 'amd', 'intel', 'qualcomm', 'smartphone', 'iphone', 'android', 'samsung', 'pixel', 'windows', 'linux', 'cloud', 'robot', 'tesla', 'electric vehicle', 'ev', 'gpu', 'laptop', 'app', 'google', 'apple', 'microsoft', 'meta', 'amazon', 'chatgpt',
  'ذكاء اصطناعي', 'الذكاء الاصطناعي', 'تقنية', 'تكنولوجيا', 'هاتف', 'آيفون', 'أندرويد', 'سامسونج', 'جوجل', 'أبل', 'مايكروسوفت', 'ميتا', 'أمازون', 'إنفيديا', 'معالج', 'شريحة', 'برمجيات', 'تطبيق', 'سيبراني', 'اختراق', 'روبوت', 'سيارات كهربائية', 'ويندوز', 'لابتوب', 'بطارية'];
const REJ_KW = ['election', 'president trump', 'senate', 'congress', 'nfl', 'nba', 'soccer', 'football match', 'celebrity', 'horoscope', 'recipe', 'best deals', 'deal alert', 'coupon', 'discount code', 'black friday', 'top 10', 'giveaway', 'review roundup',
  'انتخابات', 'رياضة', 'مباراة', 'كرة القدم', 'أبراج', 'وصفة', 'حرب', 'غزة', 'قصف'];

const TECH_RX = new RegExp(TECH_KW.map(k => /^[\x00-\x7f]+$/.test(k.trim()) ? '\\b' + k.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b' : k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
const REJ_RX = new RegExp(REJ_KW.map(k => /^[\x00-\x7f]+$/.test(k) ? '\\b' + k + '\\b' : k).join('|'), 'i');

// ---------- helpers ----------
async function get(url, timeout = 15000, headers = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': UA, Accept: '*/*', ...headers }, redirect: 'follow' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  } finally { clearTimeout(t); }
}
const decode = s => (s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const strip = s => decode(s).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const tag = (x, n) => { const m = x.match(new RegExp('<' + n + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + n + '>', 'i')); return m ? m[1] : ''; };
const attr = (x, n, a) => { const m = x.match(new RegExp('<' + n + '\\s[^>]*' + a + '="([^"]+)"', 'i')); return m ? decode(m[1]) : ''; };

function parseFeed(xml) {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  return blocks.map(b => {
    const link = strip(tag(b, 'link')) || attr(b, 'link', 'href');
    const full = tag(b, 'content:encoded') || tag(b, 'content') || '';
    const desc = tag(b, 'description') || tag(b, 'summary') || '';
    const img = attr(b, 'media:content', 'url') || attr(b, 'media:thumbnail', 'url') || attr(b, 'enclosure', 'url') || ((decode(full || desc).match(/<img[^>]+src="([^"]+)"/i) || [])[1] || '');
    const date = new Date(strip(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date')));
    return { title: strip(tag(b, 'title')), link: link.trim(), text: strip(full || desc).slice(0, 6000), img, date };
  }).filter(i => i.title && /^https?:/.test(i.link) && !isNaN(i.date));
}

const toks = s => new Set((s || '').toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(w => w.length > 2));
function jaccard(a, b) { const A = toks(a), B = toks(b); if (!A.size || !B.size) return 0; let n = 0; for (const w of A) if (B.has(w)) n++; return n / (A.size + B.size - n); }

// ---------- AI ----------
const SYSTEM = `أنت محرر أخبار تقنية عربي محترف في موقع "TD بالعربي". اكتب خبرا أصليا بالعربية الفصحى المبسطة اعتمادا فقط على نص المصدر المعطى.
قواعد صارمة:
- لا تترجم حرفيا ولا تنسخ. أعد الصياغة بأسلوب صحفي واضح.
- لا تضف أي رقم أو اسم أو تاريخ أو سعر غير موجود في نص المصدر. إذا لم يذكر المصدر شيئا لا تخمنه.
- اذكر اسم المصدر في الفقرة الأخيرة (مثال: بحسب تقرير لموقع X).
- العنوان من 40 إلى 100 حرف، بدون علامات تعجب وبدون عبارات إثارة.
- بنية المقال بالترتيب: (1) ماذا حدث في فقرة افتتاحية واضحة، (2) لماذا يهم القارئ العربي (استنتاج مبني فقط على وقائع المصدر، بدون اختلاق تأثير على مصر أو الأسواق العربية)، (3) أبرز النقاط في قائمة <ul>، (4) ما الذي لم يتأكد بعد أو ما الخطوة التالية.
- إن كان الخبر تسريبا أو إشاعة أو معلومات غير رسمية: ضع is_rumor=true، واستخدم صياغة مثل "بحسب تسريبات" و"غير مؤكد رسميا"، ولا تذكر أي مواصفة مسربة كحقيقة، وضع كلمة "تسريبات" أو "غير مؤكد" في العنوان.
- لا تقدم رأيا ولا توقعات من عندك. إن لم يضف الخبر معلومة جديدة ذات قيمة للقارئ ضع is_duplicate=true.
- طول المقال إلزامي: لا يقل أبداً عن 300 كلمة ولا يزيد عن 450 كلمة. هذا أهم شرط؛ راجع عدد الكلمات قبل الرد. بصيغة HTML بسيطة فقط: <p> و <h2> و <ul><li> و <strong>. بدون <h1> وبدون روابط وبدون صور.
- إن كان الخبر نفسه منشورا سابقا في قائمة العناوين المعطاة، ضع is_duplicate=true.
- الرد JSON فقط بدون أي نص آخر.`;

function userPrompt(c, recentTitles, cats) {
  return `المصدر: ${c.sourceName}
عنوان الخبر الأصلي: ${c.title}
النص:
${c.fullText}

عناوين منشورة حديثا (لتجنب التكرار):
${recentTitles.map(t => '- ' + t).join('\n')}

أعد JSON بهذه الحقول بالضبط:
{"is_duplicate":false,"title":"","excerpt":"جملتان","body":"<p>..</p>","category":"واحد من: ${cats.join(', ')}","tags":["3 إلى 6 كلمات"],"seo_title":"","meta_description":"140 إلى 160 حرف","seo_slug":"english-lowercase-slug","focus_keyword":"","primary_company":"","telegram_summary":"سطران بدون وسوم","image_query":"English search words for a stock photo","hasEgyptImpact":false,"is_rumor":false}`;
}

async function callGemini(model, sys, user) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': E.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens: 4096 } }),
  });
  if (!r.ok) throw new Error('gemini ' + model + ' HTTP ' + r.status + ' ' + (await r.text()).slice(0, 160));
  const j = await r.json();
  const t = j.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  if (!t) throw new Error('gemini ' + model + ' empty');
  return t;
}
async function callGroq(sys, user) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + E.GROQ_API_KEY },
    body: JSON.stringify({ model: GROQ_MODEL, temperature: 0.4, max_tokens: 4096, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] }),
  });
  if (!r.ok) throw new Error('groq HTTP ' + r.status + ' ' + (await r.text()).slice(0, 160));
  const j = await r.json();
  return j.choices?.[0]?.message?.content || '';
}
function parseJSON(t) {
  t = t.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  return JSON.parse(t.slice(a, b + 1));
}
// Tries each provider once per candidate. A 429 or error moves to the next provider; never loops.
async function generate(c, recentTitles, cats, errors) {
  if (E.MOCK_AI === '1') return { is_duplicate: false, title: 'عنوان تجريبي لخبر تقني عن ' + c.title.slice(0, 20), excerpt: 'ملخص تجريبي.', body: '<p>' + 'كلمة '.repeat(260) + '</p>', category: cats[0], tags: ['تقنية'], seo_title: 't', meta_description: 'm', seo_slug: 'test-slug', focus_keyword: 'k', primary_company: '', telegram_summary: 'ملخص', image_query: 'technology', hasEgyptImpact: false };
  const user = userPrompt(c, recentTitles, cats);
  const tries = [];
  if (E.GEMINI_API_KEY) for (const m of GEMINI_MODELS) tries.push(['gemini:' + m, () => callGemini(m, SYSTEM, user)]);
  if (E.GROQ_API_KEY) tries.push(['groq:' + GROQ_MODEL, () => callGroq(SYSTEM, user)]);
  if (!tries.length) throw new Error('no AI key configured (GEMINI_API_KEY / GROQ_API_KEY)');
  for (const [name, fn] of tries) {
    try { const out = parseJSON(await fn()); out._provider = name; return out; }
    catch (e) { errors.push(name + ': ' + String(e.message).slice(0, 200)); log('  AI failed', name, e.message.slice(0, 120)); await sleep(2000); }
  }
  return null;
}

// One expansion retry when a draft body lands under the word floor: same providers, asks the model to
// lengthen the same article to 320-450 words using only the source text. Returns a new body or null.
async function expandBody(c, body, errors) {
  const user = `المصدر: ${c.sourceName}\nنص المصدر الأصلي:\n${c.fullText}\n\nمسودة المقال الحالية (أقصر من الحد المطلوب):\n${body}\n\nأعد كتابة المقال ليصبح بين 320 و 450 كلمة مع الالتزام بكل القواعد السابقة: لا معلومة أو رقم أو اسم خارج نص المصدر، نفس البنية المطلوبة، واذكر اسم المصدر في الفقرة الأخيرة.\nالرد JSON فقط بهذا الشكل: {"body":"<p>..</p>"}`;
  const tries = [];
  if (E.GEMINI_API_KEY) for (const m of GEMINI_MODELS) tries.push(['gemini:' + m, () => callGemini(m, SYSTEM, user)]);
  if (E.GROQ_API_KEY) tries.push(['groq:' + GROQ_MODEL, () => callGroq(SYSTEM, user)]);
  for (const [name, fn] of tries) {
    try { const out = parseJSON(await fn()); if (out && typeof out.body === 'string' && out.body.length > 100) { log('  expanded via', name); return out.body; } }
    catch (e) { errors.push('expand ' + name + ': ' + String(e.message).slice(0, 160)); log('  expand failed', name, e.message.slice(0, 120)); await sleep(2000); }
  }
  return null;
}

// ---------- quality ----------
function sanitize(html) {
  return html.replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, '').replace(/\son\w+="[^"]*"/gi, '').replace(/\son\w+='[^']*'/gi, '').replace(/javascript:/gi, '').replace(/<h1/gi, '<h2').replace(/<\/h1>/gi, '</h2>');
}
function check(a, cats) {
  const reasons = []; let score = 100;
  const words = strip(a.body || '').split(/\s+/).filter(Boolean).length;
  if (!a.title || a.title.length < 20 || a.title.length > 120) { reasons.push('title length'); score -= 25; }
  if (!/[\u0600-\u06FF]/.test(a.title || '')) { reasons.push('title not Arabic'); score -= 40; }
  if (words < 180) { reasons.push('body too short ' + words); score -= 40; }
  if (words > 700) { reasons.push('body too long'); score -= 10; }
  if (!a.excerpt || a.excerpt.length < 40) { reasons.push('excerpt'); score -= 10; }
  if (!cats.includes(a.category)) { reasons.push('category'); score -= 10; }
  if (!Array.isArray(a.tags) || a.tags.length < 2) { reasons.push('tags'); score -= 5; }
  if (!a.meta_description) { reasons.push('meta'); score -= 5; }
  if (/\b(lorem|as an ai|language model)\b/i.test(a.body || '')) { reasons.push('ai artifacts'); score -= 50; }
  return { score, reasons, words };
}

const isRumor = a => a.is_rumor === true || a.is_rumor === 'true';
// ---------- image ----------
const BAD_IMG = /logo|avatar|icon|favicon|sprite|badge|pixel|spacer|placeholder|\.svg|\.gif/i;
function imgSize(buf) {
  try {
    if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') {
      const t = buf.slice(12, 16).toString();
      if (t === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (t === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
      if (t === 'VP8L') { const b = buf.readUInt32LE(21); return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 }; }
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const m = buf[i + 1];
        if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
  } catch {}
  return null;
}
async function measure(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Range: 'bytes=0-65535' }, signal: AbortSignal.timeout(12000) });
    if (!r.ok) return null;
    return imgSize(Buffer.from(await r.arrayBuffer()));
  } catch { return null; }
}
async function pickImage(c, a) {
  const ok = u => u && /^https?:\/\//.test(u) && !BAD_IMG.test(u);
  if (ok(c.img)) return { url: c.img, source: 'rss' };
  try {
    const html = await get(c.link, 12000);
    const og = (html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) || [])[1];
    if (ok(og)) return { url: decode(og), source: 'og' };
  } catch {}
  if (E.PEXELS_API_KEY && a.image_query && !isRumor(a)) {
    try {
      const j = JSON.parse(await get('https://api.pexels.com/v1/search?per_page=3&orientation=landscape&query=' + encodeURIComponent(a.image_query), 12000, { Authorization: E.PEXELS_API_KEY }));
      const p = j.photos?.[0]; if (p) return { url: p.src.large || p.src.original, source: 'pexels' };
    } catch {}
  }
  return { url: BASE + '/img/og-image.png', source: 'default' };
}

// ---------- trend signal ----------
// A story is "trending" when several independent sources run it (title clustering) and/or it is high on Hacker News.
async function hnFront() {
  try {
    const j = JSON.parse(await get('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=60', 12000));
    return (j.hits || []).map(h => ({ title: h.title || '', points: h.points || 0 }));
  } catch { return []; }
}
function trendScore(c, pool, hn) {
  const srcs = new Set([c.sourceId]);
  for (const p of pool) if (p.sourceId !== c.sourceId && jaccard(p.title, c.title) > 0.35) srcs.add(p.sourceId);
  let hnPts = 0;
  for (const h of hn) if (jaccard(h.title, c.title) > 0.3) hnPts = Math.max(hnPts, h.points);
  const score = (srcs.size - 1) * 15 + Math.min(40, Math.round(hnPts / 10));
  return { score, sources: srcs.size, hn: hnPts };
}

// ---------- main ----------

async function main() {
  fs.mkdirSync('.run', { recursive: true });
  const now = new Date();
  const res = { status: 'start', dry_run: DRY_RUN, at: now.toISOString(), published: null, errors: [] };
  const finish = (status, extra = {}) => {
    Object.assign(res, { status }, extra);
    wj('.run/result.json', res);
    if (!DRY_RUN) { const h = rj('data/execution_history.json', []); h.unshift({ at: res.at, status, title: res.published?.title || '', errors: res.errors.slice(0, 5), provider: res.provider || '' }); wj('data/execution_history.json', h.slice(0, 60)); }
    log('RESULT', status, res.published?.title || '', res.errors.join(' | '));
  };

  const index = rj(INDEX, []);
  const today = now.toISOString().slice(0, 10);
  const todayCount = index.filter(a => (a.date || '').startsWith(today)).length;
  if (todayCount >= MAX_PER_DAY) return finish('skipped_daily_cap');
  const trendOnly = todayCount >= BASE_PER_DAY; // beyond the base quota only trending stories pass

  const cats = rj('data/categories.json', []).map(c => c.id);
  if (!cats.length) cats.push('technology');
  const sources = rj('data/rss_sources.json', []).filter(s => s.enabled !== false).sort((a, b) => (a.priority || 99) - (b.priority || 99));
  const seenLinks = new Set([...rj('data/published_links.json', []), ...index.map(a => a.link)]);
  const recent = index.slice(0, 120);
  const recentTitles = recent.map(a => a.title).filter(Boolean);
  const recentSrcTitles = recent.map(a => a.source_title).filter(Boolean);

  // 1. fetch all feeds in parallel (failures are only logged, sources are never auto-disabled)
  const feeds = await Promise.all(sources.map(async s => {
    try { return { s, items: parseFeed(await get(s.url, 15000)) }; }
    catch (e) { res.errors.push('feed ' + s.id + ': ' + e.message); return { s, items: [] }; }
  }));
  log('feeds ok:', feeds.filter(f => f.items.length).length + '/' + feeds.length);

  // 2. filter
  let cands = [];
  const pool = [];
  for (const { s, items } of feeds) for (const it of items) {
    const ageH = (now - it.date) / 36e5;
    if (ageH < -1 || ageH > FRESH_HOURS) continue;
    const hay = (it.title + ' ' + it.text.slice(0, 600)).toLowerCase();
    if (REJ_RX.test(hay)) continue;
    const isTech = TECH_RX.test(hay);
    if (!isTech) continue;
    pool.push({ title: it.title, sourceId: s.id });
    if (seenLinks.has(it.link)) continue;
    if ([...recentSrcTitles, ...recentTitles].some(t => jaccard(t, it.title) > 0.55)) continue;
    if (it.text.length < 120) continue;
    cands.push({ ...it, sourceId: s.id, sourceName: s.name, trust: s.trust_score || 50, ageH, score: (s.trust_score || 50) - ageH * 1.5 });
  }
  const hn = await hnFront();
  for (const c of cands) { const t = trendScore(c, pool, hn); c.trend = t.score; c.trendSources = t.sources; c.hnPoints = t.hn; c.score += t.score; }
  if (trendOnly) { cands = cands.filter(c => c.trend >= TREND_MIN); log('trend-only mode (' + todayCount + '/' + MAX_PER_DAY + ' today), trending candidates:', cands.length); }
  log('top trends:', cands.slice().sort((a, b) => b.trend - a.trend).slice(0, 5).map(c => c.trend + ' [' + c.trendSources + ' src, HN ' + c.hnPoints + '] ' + c.title.slice(0, 60)).join(' || '));
  // remove near-duplicates among candidates, best first
  cands.sort((a, b) => b.score - a.score);
  const uniq = [];
  for (const c of cands) if (!uniq.some(u => jaccard(u.title, c.title) > 0.55)) uniq.push(c);
  log('candidates:', uniq.length);
  if (!uniq.length) return finish('no_candidates');

  // 3. try up to 5 candidates
  for (const c of uniq.slice(0, 5)) {
    log('try:', c.sourceName, '|', c.title);
    c.fullText = c.text;
    try { const t = strip(await get('https://r.jina.ai/' + c.link, 15000, { Accept: 'text/plain' })); if (t.length > c.text.length) c.fullText = t.slice(0, 7000); } catch {}
    const a = await generate(c, recentTitles.slice(0, 25), cats, res.errors);
    if (!a) { if (!E.MOCK_AI) { return finish('ai_failed'); } continue; } // all providers failed: stop the run, do not burn quota
    if (a.is_duplicate === true || a.is_duplicate === 'true') { log('  duplicate per AI'); seenLinks.add(c.link); if (!DRY_RUN) { const pl = rj('data/published_links.json', []); pl.push(c.link); wj('data/published_links.json', pl); } continue; }
    a.body = sanitize(String(a.body || ''));
    let q = check(a, cats);
    log('  quality', q.score, q.reasons.join(','), 'words', q.words);
    if (q.words < MIN_WORDS) {
      const ex = await expandBody(c, a.body, res.errors);
      if (ex) { a.body = sanitize(ex); q = check(a, cats); log('  after expand: quality', q.score, q.reasons.join(','), 'words', q.words); }
    }
    if (q.words < MIN_WORDS) { res.errors.push('thin body ' + q.words + 'w < ' + MIN_WORDS); log('  thin body', q.words, '<', MIN_WORDS, '- trying next candidate'); continue; }
    if (q.score < MIN_SCORE) { res.errors.push('quality ' + q.score + ': ' + q.reasons.join(',')); continue; }

    const img = await pickImage(c, a);
    const dims = img.source === 'default' ? null : await measure(img.url);
    if (isRumor(a) && img.source === 'default') { res.errors.push('rumor without source image'); log('  rumor has no source image, skipping'); continue; }
    const id = 'art-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const slug = String(a.seo_slug || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
    const entry = {
      id, title: a.title.trim(), excerpt: a.excerpt.trim(), body: a.body, category: a.category, tags: (a.tags || []).slice(0, 6),
      image: img.url, image_source: img.source, image_query: a.image_query || '', date: now.toISOString(),
      readTime: Math.max(2, Math.round(q.words / 200)) + ' min read', views: 0, hasEgyptImpact: !!a.hasEgyptImpact,
      source: c.sourceName, link: c.link, source_title: c.title, techdose_link: '', status: 'published',
      seo_title: (a.seo_title || a.title).trim(), meta_description: (a.meta_description || a.excerpt).trim(), seo_slug: slug, focus_keyword: a.focus_keyword || '',
      secondary_keywords: [], primary_company: a.primary_company || '', secondary_company: '', products: [], devices: [], technologies: [], ai_models: [], os: [], chipsets: [], browsers: [], cloud_platforms: [], languages: [], opensource_projects: [], executives: [], markets: [], countries: [], people: [], stocks: [], investors: [], image_queries: [], internal_links: [],
      trend_score: c.trend || 0, trend_sources: c.trendSources || 1, is_rumor: isRumor(a), image_w: dims?.w || undefined, image_h: dims?.h || undefined,
      quality_score: q.score, ai_provider: a._provider || '',
    };
    entry.techdose_link = articleUrl(entry); entry.path = entry.techdose_link.replace(BASE, '');
    res.published = { id, title: entry.title, url: entry.techdose_link, telegram_summary: String(a.telegram_summary || entry.excerpt), image: entry.image };
    res.provider = a._provider || '';
    if (DRY_RUN) { log('DRY RUN article:\n', JSON.stringify({ ...entry, body: entry.body.slice(0, 400) + '...' }, null, 2)); return finish('dry_run_ok'); }

    // 4. write data
    const idx = [entry, ...index];
    const KEEP = 200;
    if (idx.length > KEEP) { const arch = rj('data/articles/archive.json', []); wj('data/articles/archive.json', [...arch, ...idx.slice(KEEP)]); }
    wj(INDEX, idx.slice(0, KEEP));
    const pl = rj('data/published_links.json', []); pl.push(c.link); wj('data/published_links.json', pl.slice(-3000));
    const tp = rj('data/published_topics.json', []); tp.unshift({ title: entry.title, source: c.sourceName, timestamp: entry.date, topic_fp: '' }); wj('data/published_topics.json', tp.slice(0, 300));
    wj('.run/new-urls.json', [entry.techdose_link]);
    return finish('published');
  }
  return finish('no_article_passed');
}

main().catch(e => { console.error('FATAL', e); fs.mkdirSync('.run', { recursive: true }); fs.writeFileSync('.run/result.json', JSON.stringify({ status: 'fatal', error: String(e.message) })); process.exit(1); });
