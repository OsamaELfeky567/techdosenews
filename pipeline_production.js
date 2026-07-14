
const DEFAULT_SOURCES = [
  { id: "bbcar", name: "BBC Arabic", url: "https://feeds.bbci.co.uk/arabic/rss.xml", lang: "ar", tier: 1, priority: 1, enabled: true, trust_score: 98, category: "general" },
  { id: "arabhd", name: "عرب هاردوير", url: "https://arabhardware.net/feed/", lang: "ar", tier: 1, priority: 2, enabled: true, trust_score: 97, category: "hardware" },
  { id: "techwd", name: "التقنية بلا حدود", url: "https://www.tech-wd.com/wd/feed/", lang: "ar", tier: 1, priority: 3, enabled: true, trust_score: 96, category: "general" },
  { id: "aitnews", name: "AIT News", url: "https://aitnews.com/feed", lang: "ar", tier: 1, priority: 4, enabled: true, trust_score: 95, category: "general" },
  { id: "techcr", name: "TechCrunch", url: "https://techcrunch.com/feed/", lang: "en", tier: 2, priority: 5, enabled: true, trust_score: 90, category: "startups" },
  { id: "verge", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", lang: "en", tier: 2, priority: 6, enabled: true, trust_score: 88, category: "consumer-tech" },
  { id: "arstech", name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", lang: "en", tier: 2, priority: 7, enabled: true, trust_score: 92, category: "deep-tech" },
  { id: "gsmarena", name: "GSMArena", url: "https://www.gsmarena.com/rss-news-reviews.php3", lang: "en", tier: 2, priority: 8, enabled: true, trust_score: 85, category: "mobile" },
  { id: "androidauth", name: "Android Authority", url: "https://www.androidauthority.com/feed/", lang: "en", tier: 2, priority: 9, enabled: true, trust_score: 84, category: "mobile" },
  { id: "tomshw", name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/all", lang: "en", tier: 2, priority: 10, enabled: true, trust_score: 86, category: "hardware" },
  { id: "techxar", name: "TECHx Arabic", url: "https://techxmediaarabic.com/feed/", lang: "ar", tier: 2, priority: 11, enabled: true, trust_score: 87, category: "general" },
  { id: "mitrev", name: "MIT Technology Review Arabic", url: "https://technologyreview.ae/feed", lang: "ar", tier: 2, priority: 12, enabled: true, trust_score: 93, category: "deep-tech" },
  { id: "openai", name: "OpenAI Blog", url: "https://openai.com/news/rss.xml", lang: "en", tier: 3, priority: 13, enabled: true, trust_score: 80, category: "ai" },
  { id: "nvidia", name: "NVIDIA Blog", url: "https://blogs.nvidia.com/feed/", lang: "en", tier: 3, priority: 14, enabled: true, trust_score: 78, category: "hardware" },
  { id: "msai", name: "Microsoft AI Blog", url: "https://blogs.microsoft.com/feed/", lang: "en", tier: 3, priority: 15, enabled: true, trust_score: 76, category: "ai" },
  { id: "googleai", name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/", lang: "en", tier: 3, priority: 16, enabled: true, trust_score: 75, category: "ai" },
  { id: "zdnetai", name: "ZDNet AI", url: "https://www.zdnet.com/news/rss.xml", lang: "en", tier: 3, priority: 17, enabled: true, trust_score: 72, category: "ai" },
];

let RSS_SOURCES = [...DEFAULT_SOURCES];

async function loadSources() {
  try {
    const res = await this.helpers.httpRequest({
      method: "GET",
      url: GH_API + "/data/rss_sources.json",
      headers: GH_H
    });
    if (res && res.content) {
      const decoded = JSON.parse(Buffer.from(res.content, "base64").toString("utf-8"));
      if (Array.isArray(decoded) && decoded.length > 0) {
        RSS_SOURCES = decoded.map(s => ({ ...s, lang: s.language || s.lang || "ar" }));
        return;
      }
    }
  } catch(e) {}
  RSS_SOURCES = [...DEFAULT_SOURCES];
}

const GH_TOKEN = "" || "";
const GH_API = "https://api.github.com/repos/osamaelfeky567/techdosenews/contents";
const GH_H = { "Authorization": "token " + GH_TOKEN, "Accept": "application/vnd.github.v3+json" };

const TG_TOKEN = "" || "";
const TG_CHAT_ID = "-1003896125398" || "-1003896125398";
const FRONTEND_URL = "https://osamaelfeky567.github.io/techdosenews";

const GROQ_API_KEY = "" || "";
const GROQ_MODEL = "llama-3.1-8b-instant";

const PEXELS_API_KEY = "";
const UNSPLASH_ACCESS_KEY = "";

const TECH_KW = ["ai","artificial intelligence","machine learning","deep learning","llm","gpt","openai","anthropic","claude","gemini","chatbot","software","startup","cybersecurity","security","cloud","saas","mobile","smartphone","developer","programming","coding","api","github","database","blockchain","quantum","robotics","drone","autonomous","self-driving","ev","electric vehicle","chip","processor","gpu","cpu","nvidia","intel","amd","apple","google","microsoft","meta","amazon","aws","iphone","ipad","mac","windows","linux","android","5g","6g","iot","vr","ar","metaverse","tech","technology","innovation","ipo","acquisition","funding","venture capital","silicon valley","robot","automation","digital","privacy","data breach","vulnerability","patch","cyber attack","ransomware"];

const REJ_KW = ["politics","election","president","congress","senate","lifestyle","fashion","beauty","shopping","sports","nfl","nba","soccer","football","basketball","recipe","cooking","restaurant","travel","tourism","celebrity","gossip","entertainment","movie review","top 10","top 5","best ai tools","make money","earn money","passive income","click here","subscribe now"];

const QUALITY_THRESHOLD = 65;
const QUALITY_MODE = "EMERGENCY";

function gradeLabel(score) {
  if (!score || score <= 0) return '';
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

const AI_SYSTEM_PROMPT = "أنت صحفي تقني محترف في منصة Tech Dose News. تكتب مقالات أصلية بالعربية بأسلوب صحافة الجودة.\nقواعد: 1) الطول 700-1200 كلمة 2) المقال أصلي وليس ترجمة 3) ابدأ مباشرة: ماذا حدث؟ لمن؟ لماذا؟ 4) اشرح التقنيات بلغة بسيطة 5) حلّل التأثير على المستخدم والسوق 6) لا رأي شخصي ولا clickbait 7) اختم باستنتاج واضح.\nمحظورات: في عالم التكنولوجيا المتسارع، يُعد هذا تطوراً مهماً، من الجدير بالذكر، تعرف على.\nأسماء الشركات بالإنجليزية: Google، Apple، iPhone، ChatGPT، NVIDIA، OpenAI";

const LOGO_PATTERNS = /logo|avatar|icon|favicon|banner|thumbnail|sprite|badge|button|tracking-pixel|pixel\.gif|spacer|placeholder|advertisement|ad\.|banner-ad/i;
const TRACKING_PATTERNS = /doubleclick|googleadservices|googlesyndication|facebook\.com\/tr|quantserve|scorecardresearch|outbrain|taboola/i;
const IMAGE_EXT_OK = /\.(jpe?g|png|webp|avif|gif)(\?|$)/i;

function strip(s) {
  return (s||"").replace(/<[^>]*>/g," ").replace(/<!\[CDATA\[|\]\]>/g,"").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim();
}

function parseRSS(xml) {
  const out = [];
  let re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const it = m[1];
    const t = (it.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "";
    const l = (it.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || "";
    const d = (it.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || "";
    const c = (it.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i) || [])[1] || d;
    const p = (it.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || "";
    const s = (it.match(/<source[^>]*>([\s\S]*?)<\/source>/i) || [])[1] || "";
    const img = (it.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image\/[^"]+"/i) || [])[1] ||
               (it.match(/<media:content[^>]*url="([^"]+)"[^>]*medium="image"/i) || [])[1] ||
               (it.match(/<media:content[^>]*url="([^"]+)"[^>]*type="image\/[^"]+"/i) || [])[1] || "";
    if (t && l) {
      out.push({
        title: strip(t),
        link: strip(l),
        desc: strip(d),
        contentEncoded: strip(c),
        pubDate: strip(p),
        source: strip(s),
        image: img
      });
    }
  }
  re = /<entry>([\s\S]*?)<\/entry>/gi;
  while ((m = re.exec(xml)) !== null) {
    const it = m[1];
    const t = (it.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
    const l = (it.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || "";
    const s = (it.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || [])[1] || "";
    const u = (it.match(/<updated>([\s\S]*?)<\/updated>/i) || [])[1] || (it.match(/<published>([\s\S]*?)<\/published>/i) || [])[1] || "";
    if (t && l) {
      out.push({
        title: strip(t),
        link: l.trim(),
        desc: strip(s),
        pubDate: strip(u),
        source: "",
        image: ""
      });
    }
  }
  return out;
}

function isFresh(pubDate, maxHours) {
  if (!pubDate) return false;
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return false;
  return (Date.now() - d.getTime()) / 3600000 <= maxHours;
}

function isTech(title, desc) {
  const txt = ((title||"") + " " + (desc||"")).toLowerCase();
  for (const kw of REJ_KW) { if (txt.includes(kw)) return false; }
  for (const kw of TECH_KW) { if (txt.includes(kw)) return true; }
  return false;
}

function makeId() {
  return "art-" + Date.now() + "-" + Math.random().toString(36).slice(2,8);
}

function contentHash(title, desc) {
  function norm(s) { return (s||"").replace(/[\u0623\u0625\u0622]/g,"\u0627").replace(/\u0629/g,"\u0647").replace(/[\u0649\u064A]/g,"\u064A").replace(/\s+/g," ").trim().toLowerCase(); }
  const hi = norm(title) + "|" + norm(desc||"").substring(0,100);
  let h = 0;
  const t = hi.replace(/[^\w\u0600-\u06FF]/g,"");
  for (let i = 0; i < t.length; i++) { h = ((h << 5) - h) + t.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

function similarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;
  if (longer.length === 0) return 1;
  const costs = [];
  for (let i = 0; i <= shorter.length; i++) costs[i] = i;
  for (let i = 1; i <= longer.length; i++) {
    let prev = i;
    for (let j = 1; j <= shorter.length; j++) {
      const val = shorter[j-1] === longer[i-1] ? costs[j-1] : Math.min(costs[j-1] + 1, prev + 1, costs[j] + 1);
      costs[j-1] = prev;
      prev = val;
    }
    costs[shorter.length] = prev;
  }
  return 1 - costs[shorter.length] / longer.length;
}

async function ghGet(path) {
  try {
    return await this.helpers.httpRequest({
      method: "GET",
      url: GH_API + "/" + path,
      headers: GH_H
    });
  } catch(e) {
    return {};
  }
}

async function ghPut(path, content, msg) {
  try {
    const existing = await ghGet(path);
    return await this.helpers.httpRequest({
      method: "PUT",
      url: GH_API + "/" + path,
      headers: GH_H,
      body: {
        message: msg || "TDN v7",
        content: Buffer.from(content).toString("base64"),
        sha: existing.sha || ""
      }
    });
  } catch(e) {
    throw new Error("GitHub PUT " + path + ": " + e.message);
  }
}

function b64decode(encoded) {
  try { return JSON.parse(Buffer.from(encoded, "base64").toString()); }
  catch(e) { return null; }
}

async function fetchArticleContent(url) {
  try {
    const jinaUrl = "https://r.jina.ai/http://" + url.replace(/^https?:\/\//, "");
    const jinaRes = await this.helpers.httpRequest({ method: "GET", url: jinaUrl, timeout: 15000, headers: { "User-Agent": "TechDoseNews/1.0", "Accept": "text/plain" } });
    const jinaText = typeof jinaRes === "string" ? jinaRes : (jinaRes.data || jinaRes.content || jinaRes.body || "");
    if (jinaText && jinaText.length > 1000) {
      const clean = jinaText.replace(/!\[\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\n{3,}/g, "\n\n").trim();
      if (clean.length >= 800) return clean.substring(0, 10000);
    }
  } catch(e) {}

  try {
    const res = await this.helpers.httpRequest({ method: "GET", url: url, timeout: 10000, headers: { "User-Agent": "Mozilla/5.0 (compatible; TechDoseNews/1.0)" } });
    const html = typeof res === "string" ? res : (res.data || res.body || "");
    if (html && html.length >= 500) {
      const paragraphs = [];
      let match;
      const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
      const htmlTarget = articleMatch ? articleMatch[1] : html;
      const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      while ((match = pRe.exec(htmlTarget)) !== null) {
        const text = match[1].replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
        if (text.length > 60 && !text.includes("cookie") && !text.includes("subscribe") && !text.includes("newsletter")) {
          paragraphs.push(text);
        }
      }
      if (paragraphs.length >= 3) {
        const combined = paragraphs.join("\n\n");
        if (combined.length >= 500) return combined.substring(0, 10000);
      }
    }
  } catch(e) {}

  return null;
}

function editorialFormat(ai) {
  if (!ai || !ai.body) return ai;
  let body = ai.body;

  body = body
    .replace(/\s+،/g, "،")
    .replace(/\s+\./g, ".")
    .replace(/\.\.\.\./g, "…")
    .replace(/،،/g, "،")
    .replace(/\s+:/g, ":")
    .replace(/:\s+/g, ": ")
    .replace(/\s+؛/g, "؛");

  let pars = body.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  const entityTerms = [];
  if (ai.primary_company) entityTerms.push(ai.primary_company);
  if (ai.secondary_company) entityTerms.push(ai.secondary_company);
  if (Array.isArray(ai.products)) entityTerms.push(...ai.products);
  if (Array.isArray(ai.technologies)) entityTerms.push(...ai.technologies);
  if (Array.isArray(ai.ai_models)) entityTerms.push(...ai.ai_models);
  if (Array.isArray(ai.chipsets)) entityTerms.push(...ai.chipsets);
  if (Array.isArray(ai.os)) entityTerms.push(...ai.os);

  const processed = [];
  const seenOpenings = new Set();
  const openingPatterns = [/^(أعلنت|وأعلنت|وكشفت|أوضحت|أكدت|وأضافت|كما أعلنت|كما كشفت)/];

  for (let p of pars) {
    let text = p.trim();
    if (!text) continue;

    for (const pattern of openingPatterns) {
      const match = text.match(pattern);
      if (match) {
        const opening = match[1];
        if (seenOpenings.has(opening)) {
          const variations = ["في سياق متصل، ", "من جهة أخرى، ", "وبحسب المصادر، ", "وفي التفاصيل، "];
          const idx = processed.length % variations.length;
          text = text.replace(opening, variations[idx]);
        } else {
          seenOpenings.add(opening);
        }
      }
    }

    const enumMatch = text.match(/^(تشمل|تتضمن|يضم|منها|هي:|عدة|العديد من|عدد من|مجموعة)/);
    if (enumMatch && (text.match(/،|و/g) || []).length >= 3) {
      const items = text.split(/(?:،|\.\s*و|\s*و)/).map(i => i.trim()).filter(i => i.length > 5);
      if (items.length >= 3) {
        const bulletList = items.map(i => "• " + i.replace(/^[•\-*]\s*/, "")).join("\n");
        processed.push(bulletList);
        continue;
      }
    }

    for (const term of entityTerms) {
      if (!term) continue;
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp("(?<![\\u0600-\\u06FFa-zA-Z])(" + escaped + ")(?![\\u0600-\\u06FFa-zA-Z])", "g");
      text = text.replace(regex, "<strong>$1</strong>");
    }

    const quoteMatch = text.match(/^(قال|صرح|أكد|ذكر)\s+/);
    if (quoteMatch) {
      processed.push("> " + text);
      continue;
    }

    const sentences = text.split(/(?<=[.!?؟!])\s+/);
    const adjusted = [];
    for (const sentence of sentences) {
      const words = sentence.split(/\s+/).filter(Boolean);
      if (words.length > 35) {
        const breakIdx = sentence.indexOf("،");
        if (breakIdx > 20 && breakIdx < sentence.length - 20) {
          adjusted.push(sentence.substring(0, breakIdx));
          adjusted.push(sentence.substring(breakIdx + 1).trim());
        } else if (sentence.includes("،")) {
          const parts = sentence.split("،");
          let current = "";
          for (const part of parts) {
            if ((current + " " + part).split(/\s+/).filter(Boolean).length > 30) {
              adjusted.push(current.trim());
              current = part;
            } else {
              current += (current ? "، " : "") + part;
            }
          }
          if (current.trim()) adjusted.push(current.trim());
        } else {
          adjusted.push(sentence);
        }
      } else {
        adjusted.push(sentence);
      }
    }
    text = adjusted.join(". ").replace(/\.\s+\./g, ".");

    processed.push(text);
  }

  const headings = [
    { trigger: /تأثير|تأثيرات|الآثار|انعكاسات/, label: "## التأثير المتوقع" },
    { trigger: /مزايا|مميزات|فوائد|تحسينات/, label: "## أبرز المزايا" },
    { trigger: /خلفية|سياق|السياق|تاريخ/, label: "## خلفية الحدث" },
    { trigger: /منافسة|المنافسون|المنافسين/, label: "## المشهد التنافسي" },
    { trigger: /توقعات|مستقبل|المرحلة المقبلة/, label: "## التوقعات المستقبلية" },
    { trigger: /الخلاصة|استنتاج|في النهاية/, label: "## الخلاصة" }
  ];

  const finalPars = [];
  let lastWasHeading = false;
  for (const p of processed) {
    let addedHeading = false;
    if (!lastWasHeading && !p.startsWith(">") && !p.startsWith("•")) {
      for (const h of headings) {
        if (h.trigger.test(p)) {
          finalPars.push(h.label);
          lastWasHeading = true;
          addedHeading = true;
          break;
        }
      }
    }
    if (!addedHeading) {
      lastWasHeading = false;
    }
    finalPars.push(p);
  }

  const lastPar = finalPars[finalPars.length - 1];
  if (lastPar && !lastPar.startsWith("##") && lastPar.split(/\s+/).length < 25) {
    const closingPatterns = [/متوقع|المقبلة|المنافسة|تطور|قادم|المرحلة/];
    const hasClosing = closingPatterns.some(cp => cp.test(lastPar));
    if (!hasClosing) {
      finalPars.push("ومن المتوقع أن تكشف الشركة عن مزيد من التفاصيل خلال الفترة المقبلة، مع استمرار المنافسة في هذا القطاع سريع التطور.");
    }
  }

  ai.body = finalPars.join("\n\n");

  return ai;
}

/* ───── Phase 7.4 — Editorial Quality Calibration ───── */

const QUALITY_TARGETS = { info: 36, flow: 12, headline: 12, intro: 8, tech: 18, readability: 5, seo: 4 };

function calculateQuality(article) {
  const body = article.body || "";
  const title = article.title_ar || "";
  const words = body.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const paragraphs = body.split(/\n{2,}/).filter(p => p.trim().length > 20);
  const paraCount = paragraphs.length;
  const bodyText = body.replace(/<[^>]*>/g, " ");
  const hasCompany = !!article.primary_company;
  const hasProduct = Array.isArray(article.products) && article.products.length > 0;

  /* ───── 1. Substance & Journalistic Value (36 pts) ───── */
  let infoScore = 0;
  const digits = (bodyText.match(/\d+(\.\d+)?/g) || []);
  const uniqueDigits = new Set(digits.filter(d => d.length >= 2));
  if (uniqueDigits.size >= 5) infoScore += 6;
  else if (uniqueDigits.size >= 3) infoScore += 4;
  else if (uniqueDigits.size >= 1) infoScore += 2;
  if (wordCount >= 700) infoScore += 7;
  else if (wordCount >= 500) infoScore += 5;
  else if (wordCount >= 350) infoScore += 3;
  if (hasCompany && hasProduct) infoScore += 5;
  else if (hasCompany || hasProduct) infoScore += 2;
  const whySig = /يؤدي|يؤثر|بسبب|نتيجة|تأثير|يتسبب|يساهم/i;
  const bgSig = /بدأ|أطلقت|منذ|سابقاً|تأسست|كانت|خلفية/i;
  const futureSig = /سوف|مستقبل|يتوقع|سيتم|سيشهد|المرحلة/i;
  const cmpSig = /مقارنة|أكبر|أصغر|أسرع|أفضل|أسوأ|مقابل/i;
  const techExplain = /يعمل|تقوم|آلية|طريقة|خطوات|مراحل|عملية/i;
  if (whySig.test(bodyText)) infoScore += 5;
  if (bgSig.test(bodyText)) infoScore += 5;
  if (futureSig.test(bodyText)) infoScore += 5;
  if (cmpSig.test(bodyText)) infoScore += 5;
  if (techExplain.test(bodyText)) infoScore += 5;

  /* ───── 2. Editorial Flow (12 pts) ───── */
  let flowScore = 0;
  if (paraCount >= 3 && paraCount <= 20) flowScore += 3;
  else if (paraCount >= 2) flowScore += 1;
  const cliches = ["في عالم التكنولوجيا المتسارع", "يُعد هذا تطوراً مهماً", "من الجدير بالذكر", "تعرف على", "شهدنا مؤخراً", "في خطوة جديدة", "تشهد الساحة التقنية", "يشهد العالم", "في تطور لافت", "يُشار إلى أن"];
  let clicheCount = 0;
  for (const c of cliches) { if (bodyText.includes(c)) clicheCount++; }
  if (clicheCount <= 1) flowScore += 3;
  else if (clicheCount <= 2) flowScore += 1;
  if (paraCount >= 3) {
    const paraLengths = paragraphs.map(p => p.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length);
    const avg = paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length;
    const variance = paraLengths.reduce((sum, len) => sum + Math.abs(len - avg), 0) / paraLengths.length;
    if (variance > 8) flowScore += 3;
  }
  const flowSig = /من ناحية|بالمقابل|علاوة على|فضلاً عن|إضافة إلى|كما أن|بالإضافة|في سياق/i;
  if (flowSig.test(bodyText)) flowScore += 3;

  /* ───── 3. Headline Quality (12 pts) ───── */
  let headScore = 0;
  const titleLen = title.length;
  if (titleLen >= 30 && titleLen <= 65) headScore += 4;
  else if (titleLen >= 20 && titleLen <= 80) headScore += 2;
  if (hasCompany || hasProduct || (Array.isArray(article.technologies) && article.technologies.length > 0)) headScore += 3;
  if (!title.includes("؟") && !title.includes("?")) headScore += 1;
  const genericWords = ["جديد", "أحدث", "مهم", "كبير", "قوي"];
  if (!genericWords.some(gw => title.includes(gw))) headScore += 2;
  if (/تكشف|تعلن|تطلق|تطرح|تستحوذ/i.test(title)) headScore += 2;

  /* ───── 4. Intro Quality (8 pts) ───── */
  let introScore = 0;
  const firstPara = (paragraphs[0] || "").replace(/<[^>]*>/g, "");
  const firstWords = firstPara.split(/\s+/).filter(Boolean);
  if (firstWords.length >= 20) introScore += 2;
  else if (firstWords.length >= 10) introScore += 1;
  const clicheStarts = ["أعلنت", "وكشفت", "أكدت", "صرحت", "أوضحت", "كشفت"];
  if (!clicheStarts.some(cs => firstPara.trim().startsWith(cs))) introScore += 2;
  if (/\d/.test(firstPara)) introScore += 2;
  if (firstPara.length >= 60) introScore += 2;

  /* ───── 5. Readability (5 pts) ───── */
  let readScore = 0;
  if (wordCount >= 600) readScore += 2;
  else if (wordCount >= 450) readScore += 1;
  const avgParaWords = paraCount > 0 ? wordCount / paraCount : 0;
  if (avgParaWords <= 50) readScore += 2;
  else if (avgParaWords <= 65) readScore += 1;
  const sentences = bodyText.split(/[.!?؟!]\s+/);
  const maxSentLen = Math.max(...sentences.map(s => s.split(/\s+/).filter(Boolean).length), 0);
  if (maxSentLen <= 55) readScore += 1;

  /* ───── 6. Technical Depth (18 pts) ───── */
  let techScore = 0;
  if (Array.isArray(article.products) && article.products.length > 0) techScore += 3;
  if (Array.isArray(article.technologies) && article.technologies.length > 0) techScore += 3;
  if (Array.isArray(article.ai_models) && article.ai_models.length > 0) techScore += 2;
  if (article.primary_company) techScore += 2;
  if (Array.isArray(article.internal_links) && article.internal_links.length >= 1) techScore += 1;
  const techExplainWords = /يعمل|تقوم|آلية|بروتوكول|واجهة|خوارزمية|بنية|ذاكرة|معالج|نظام/i;
  if (techExplainWords.test(bodyText)) techScore += 5;
  if (article.secondary_company) techScore += 1;
  if (Array.isArray(article.chipsets) && article.chipsets.length > 0) techScore += 1;

  /* ───── 7. SEO (4 pts) ───── */
  let seoScore = 0;
  if (article.seo_title && article.seo_title.length >= 30) seoScore += 1;
  if (article.meta_description && article.meta_description.length >= 80) seoScore += 1;
  if (article.focus_keyword) seoScore += 1;
  if (Array.isArray(article.secondary_keywords) && article.secondary_keywords.length >= 1) seoScore += 1;

  const total = infoScore + flowScore + headScore + introScore + readScore + techScore + seoScore;
  return { total: Math.min(total, 100), breakdown: { info: infoScore, flow: flowScore, headline: headScore, intro: introScore, readability: readScore, tech: techScore, seo: seoScore } };
}

async function aiGenerate(title, fullContent, source) {
  const contentForAI = fullContent || "";
  const userPrompt = "اكتب مقالاً إخبارياً تقنياً أصلياً باللغة العربية عن الخبر التالي. استخدم المحتوى الكامل أدناه كمصدر أساسي للمعلومات، وليس مجرد الوصف المختصر:\n\nالعنوان: " + title + "\n\nالمحتوى الكامل للمقال الأصلي:\n" + contentForAI.substring(0, 4000) + "\n\nالمصدر: " + source + "\n\nالمطلوب بصيغة JSON فقط:\n{\n  \"title_ar\": \"عنوان جذري بالعربية (أقل من 65 حرفاً، طبيعي وليس clickbait)\",\n  \"seo_title\": \"عنوان محسن لمحركات البحث (50-60 حرف)\",\n  \"meta_description\": \"وصف مختصر لمحركات البحث (150-160 حرف)\",\n  \"seo_slug\": \"slug-مناسب-للمقال\",\n  \"excerpt\": \"ملخص مشوق من 2-3 جمل (100-160 حرف)\",\n  \"body\": \"المقال الكامل (700-1200 كلمة) - كل فقرة بسطر منفصل بدون HTML.\",\n  \"telegram_summary\": \"نسخة مختصرة من 3-4 جمل للتليجرام\",\n  \"category\": \"ai | cybersecurity | companies | phones | ev | technology\",\n  \"tags\": [\"تاغ ذو صلة\", \"تاغ ثاني\", \"تاغ ثالث\"],\n  \"focus_keyword\": \"الكلمة المفتاحية الأساسية\",\n  \"secondary_keywords\": [\"كلمة مفتاحية ثانوية\"],\n  \"primary_company\": \"الشركة الأساسية أو null\",\n  \"secondary_company\": \"شركة أخرى أو null\",\n  \"products\": [\"منتج مذكور\"] أو [],\n  \"devices\": [\"جهاز مذكور\"] أو [],\n  \"technologies\": [\"تقنية مذكورة\"] أو [],\n  \"ai_models\": [\"نموذج ذكاء اصطناعي\"] أو [],\n  \"os\": [\"نظام تشغيل\"] أو [],\n  \"chipsets\": [\"معالج أو شريحة\"] أو [],\n  \"browsers\": [\"متصفح\"] أو [],\n  \"cloud_platforms\": [\"منصة سحابية\"] أو [],\n  \"languages\": [\"لغة برمجة\"] أو [],\n  \"opensource_projects\": [\"مشروع مفتوح المصدر\"] أو [],\n  \"executives\": [\"اسم مسؤول تنفيذي\"] أو [],\n  \"markets\": [\"سوق أو قطاع\"] أو [],\n  \"countries\": [\"دولة\"] أو [],\n  \"people\": [\"شخصية\"] أو [],\n  \"stocks\": [\"رمز سهم\"] أو [],\n  \"investors\": [\"مستثمر أو صندوق\"] أو [],\n  \"image_queries\": [\"كلمة بحث رئيسية للصورة\", \"كلمة بديلة\", \"كلمة تقنية عامة\"]\n}";
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let lastErr;
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) await sleep(10000);
    try {
      const res = await this.helpers.httpRequest({
        method: "POST",
        url: "https://api.groq.com/openai/v1/chat/completions",
        headers: { "Authorization": "Bearer " + GROQ_API_KEY },
        json: true,
        body: {
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: AI_SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 2048,
          response_format: { type: "json_object" }
        }
      });
      return JSON.parse(res.choices[0].message.content);
    } catch(e) {
      lastErr = e;
      if (e.response && typeof e.response === 'object') {
        lastErr.message = (e.response.data || e.response.body || "") + " (HTTP " + e.statusCode + ")";
      }
      const is429 = e.statusCode === 429 || (e.message && e.message.includes('429'));
      if (is429) continue;
      throw e;
    }
  }
  return null;
}

async function aiRewrite(original, origTitle, fullContent, source, breakdown) {
  const dimInfo = {
    info: { name: "المعلومات والتحليل", target: 36, instr: "أضف أرقاماً وإحصائيات، اشرح الأسباب والتأثيرات، قدم مقارنات، اذكر خلفية الحدث وتوقعاته المستقبلية" },
    flow: { name: "التدفق والبنية", target: 12, instr: "نوّع أطوال الفقرات، استخدم عبارات الربط المنطقي، حسّن الخاتمة باستنتاج أقوى، تجنب الكليشيهات" },
    headline: { name: "العنوان", target: 12, instr: "اجعله قوياً بين 30-65 حرفاً، احتوِ على كيان محدد (شركة/منتج/تقنية)، استخدم فعل حركي" },
    intro: { name: "المقدمة", target: 8, instr: "اجعلها مشوقة، ابدأ برقم أو حقيقة محددة، تجنب البدايات المتكررة" },
    tech: { name: "العمق التقني", target: 18, instr: "أضف شرحاً تقنياً مفصلاً: كيف تعمل التقنية، الخوارزميات، البنية التقنية، الأجهزة" },
    readability: { name: "قابلية القراءة", target: 5, instr: "قسّم الجمل الطويلة، حقّق توازناً في أطوال الفقرات" },
    seo: { name: "تحسين محركات البحث", target: 4, instr: "حسّن عنوان SEO ووصف الميتا والكلمات المفتاحية" }
  };
  const weakDims = Object.entries(breakdown).filter(([k, v]) => v < dimInfo[k].target * 0.7).map(([k]) => dimInfo[k]);
  if (weakDims.length === 0) return original;

  const dimsText = weakDims.map(d => `- ${d.name} (حصل على ${breakdown[Object.keys(dimInfo).find(k => dimInfo[k].name === d.name)]}/${d.target}): ${d.instr}`).join("\n");
  const keptDims = Object.entries(breakdown).filter(([k, v]) => v >= dimInfo[k].target * 0.7).map(([k]) => dimInfo[k].name).join("، ");

  const genImprovements = [];
  genImprovements.push("- تأكد من وجود فقرة خاتمة قوية تلخص المقال وتقدم استنتاجاً أو نظرة مستقبلية");
  genImprovements.push("- أضف سياقاً مقارناً: كيف يقارن هذا الحدث بالمنافسين أو الإصدارات السابقة؟");
  genImprovements.push("- أضف خلفية عن الشركة أو المنتج: تاريخه، إنجازاته السابقة، موقعه في السوق");
  genImprovements.push("- اشرح أهمية الخبر وتأثيره: لماذا يهم القارئ؟ ما الذي يتغير بعد هذا الإعلان؟");
  genImprovements.push("- أضف توقعات مستقبلية: ماذا نتوقع بعد هذا الإعلان/الحدث؟");
  genImprovements.push("- في المقدمة: ابدأ برقم أو حقيقة أو سؤال بلاغي قوي، لا تبدأ بقال/أعلن/كشف");
  genImprovements.push("- في العنوان: استخدم فعل حركي (تطلق، تكشف، تستحوذ)، اذكر كياناً محدداً، اجعله بين 30-65 حرفاً");
  genImprovements.push("- حسّن الروابط المنطقية بين الفقرات: استخدم عبارات انتقالية مثل 'من ناحية أخرى'، 'علاوة على ذلك'، 'بالمقابل' و'في سياق متصل'");
  genImprovements.push("- أضف شرحاً تقنياً أعمق: اشرح آلية عمل التقنية أو الخوارزميات أو البنية التقنية وراء المنتج/الخدمة");
  const genImprovementsText = genImprovements.join("\n");

  const prompt = `أنت محرر تقني متخصص. أنت لا تعيد كتابة المقال كاملاً — فقط تحسّن الأجزاء المحددة أدناه.

المصدر: ${source}
العنوان الأصلي: ${origTitle}
المحتوى الأصلي: ${(fullContent||"").substring(0,2500)}

المقال الحالي:
العنوان: ${original.title_ar||origTitle}
المقدمة: ${((original.excerpt||"")).substring(0,200)}
المقال: ${((original.body||"")).substring(0,4000)}
الوسوم: ${JSON.stringify(original.tags||[])}

أجزاء المقال الجيدة (لا تلمسها): ${keptDims}

الأجزاء التي تحتاج تحسيناً:
${dimsText}

تحسينات عامة مطلوبة في كل الأحوال:
${genImprovementsText}

أخرج JSON كاملاً بنفس الحقول مع تحسين الأجزاء المطلوبة فقط. حافظ على باقي المحتوى دون تغيير.
الحقول: title_ar, seo_title, meta_description, seo_slug, excerpt, body, telegram_summary, category, tags, focus_keyword, secondary_keywords, primary_company, secondary_company, products, devices, technologies, ai_models, os, chipsets, browsers, cloud_platforms, languages, opensource_projects, executives, markets, countries, people, stocks, investors, image_queries.`;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let lastErr;
  for (let i = 0; i < 3; i++) {
    if (i > 0) {
      const delays = [15, 30, 60];
      await sleep(delays[Math.min(i - 1, delays.length - 1)] * 1000);
    }
    try {
      const res = await this.helpers.httpRequest({
        method: "POST", url: "https://api.groq.com/openai/v1/chat/completions",
        headers: { "Authorization": "Bearer " + GROQ_API_KEY },
        json: true,
        body: { model: GROQ_MODEL, messages: [{ role: "system", content: "أنت محرر تقني متخصص في Tech Dose News. تحسّن فقط الأجزاء المطلوبة ولا تغير المحتوى الجيد." }, { role: "user", content: prompt }], temperature: 0.25, max_tokens: 3072, response_format: { type: "json_object" } }
      });
      return JSON.parse(res.choices[0].message.content);
    } catch(e) {
      lastErr = e;
      const is429 = e.statusCode === 429 || (e.message && e.message.includes('429'));
      if (is429) continue;
      throw e;
    }
  }
  return null;
}

async function getHoursSinceLastPublish() {
  try {
    const tr = await ghGet("data/published_topics.json");
    let topics = tr.content ? b64decode(tr.content) : [];
    if (!Array.isArray(topics)) topics = [];
    if (topics.length === 0) return 999;
    return (Date.now() - new Date(topics[0].timestamp).getTime()) / 3600000;
  } catch(e) { return 999; }
}

async function fetchSourceRSS() {
  for (const src of RSS_SOURCES) {
    try {
      const res = await this.helpers.httpRequest({ method: "GET", url: src.url });
      const xml = typeof res === "string" ? res : (res.data || res.body || "");
      if (xml && xml.length > 200) {
        const items = parseRSS(xml);
        const fresh = items.filter(i => isFresh(i.pubDate, 24));
        const tech = fresh.filter(i => isTech(i.title, i.desc));
        if (tech.length > 0) {
          return { source: src, items: tech };
        }
      }
    } catch(e) {}
  }
  return null;
}

async function generateInternalLinks(entities, existingIndex) {
  const links = [];
  if (!entities || !existingIndex || existingIndex.length === 0) return links;
  const entityValues = [];
  if (entities.primary_company) entityValues.push(entities.primary_company.toLowerCase());
  if (entities.secondary_company) entityValues.push(entities.secondary_company.toLowerCase());
  if (Array.isArray(entities.products)) entityValues.push(...entities.products.map(s => s.toLowerCase()));
  if (Array.isArray(entities.technologies)) entityValues.push(...entities.technologies.map(s => s.toLowerCase()));
  if (Array.isArray(entities.ai_models)) entityValues.push(...entities.ai_models.map(s => s.toLowerCase()));
  if (Array.isArray(entities.countries)) entityValues.push(...entities.countries.map(s => s.toLowerCase()));
  if (Array.isArray(entities.people)) entityValues.push(...entities.people.map(s => s.toLowerCase()));
  if (Array.isArray(entities.tags)) entityValues.push(...entities.tags.map(s => s.toLowerCase()));
  const uniqueEntities = [...new Set(entityValues.filter(Boolean))];
  if (uniqueEntities.length === 0) return links;
  const scored = [];
  for (const article of existingIndex) {
    if (article.status === "published" && article.title) {
      const text = (article.title + " " + (article.excerpt || "") + " " + (Array.isArray(article.tags) ? article.tags.join(" ") : "") + " " + (article.primary_company || "") + " " + (Array.isArray(article.products) ? article.products.join(" ") : "")).toLowerCase();
      let score = 0;
      for (const ent of uniqueEntities) {
        if (text.includes(ent)) score += 2;
      }
      if (score > 0) scored.push({ article, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  for (const match of scored.slice(0, 6)) {
    links.push({
      title: match.article.title,
      id: match.article.id,
      techdose_link: match.article.techdose_link || (FRONTEND_URL + "/article.html?id=" + match.article.id)
    });
  }
  return links;
}

/* ───── Phase 7.2 — Smart Image Intelligence ───── */

async function extractArticleImage(url) {
  try {
    const res = await this.helpers.httpRequest({
      method: "GET", url: url, timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TechDoseNews/1.0)" }
    });
    const html = typeof res === "string" ? res : (res.data || res.body || "");
    if (!html || html.length < 500) return null;

    const candidates = [];

    let m;

    m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (m) candidates.push({ url: m[1], source: "og:image", weight: 100 });

    m = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (m) candidates.push({ url: m[1], source: "og:image", weight: 100 });

    m = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (m) candidates.push({ url: m[1], source: "twitter:image", weight: 90 });

    m = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (m) candidates.push({ url: m[1], source: "twitter:image", weight: 90 });

    m = html.match(/<meta[^>]+property=["']article:image["'][^>]+content=["']([^"']+)["']/i);
    if (m) candidates.push({ url: m[1], source: "article:image", weight: 80 });

    m = html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);
    if (m) candidates.push({ url: m[1], source: "image_src", weight: 85 });

    const schemaMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (schemaMatches) {
      for (const sc of schemaMatches) {
        try {
          const jsonTxt = sc.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "").trim();
          const schema = JSON.parse(jsonTxt);
          if (schema && schema.image) {
            const sUrl = typeof schema.image === "string" ? schema.image : (schema.image.url || schema.image[0] || null);
            if (sUrl) candidates.push({ url: sUrl, source: "schema.org", weight: 75 });
          }
        } catch(e) {}
      }
    }

    const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const skipPatterns = /logo|avatar|icon|favicon|sprite|badge|button|pixel|tracking|advertisement|banner-ad|spacer|placeholder|svg\+xml/i;
    while ((m = imgRe.exec(html)) !== null) {
      const src = m[1];
      if (!src || src.startsWith("data:") || src.length < 30) continue;
      if (skipPatterns.test(src) || skipPatterns.test(m[0])) continue;
      const imgHtml = m[0];
      const widthMatch = imgHtml.match(/width=["'](\d+)["']/i);
      const w = widthMatch ? parseInt(widthMatch[1]) : 0;
      if (w >= 600) candidates.push({ url: resolveUrl(src, url), source: "content_img", weight: 60 + (w >= 1200 ? 20 : 0) });
      else if (candidates.length < 2) candidates.push({ url: resolveUrl(src, url), source: "content_img", weight: 40 });
    }

    candidates.sort((a, b) => b.weight - a.weight);
    return candidates[0] ? candidates[0].url : null;
  } catch(e) {
    return null;
  }
}

function resolveUrl(src, base) {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("//")) return "https:" + src;
  const baseUrl = base.replace(/\/[^/]*$/, "/");
  return baseUrl.replace(/\/+$/, "") + "/" + src.replace(/^\/+/, "");
}

function validateImage(url) {
  if (!url) return false;
  if (!IMAGE_EXT_OK.test(url) && !url.includes("/photos/") && !url.includes("/photo/")) return false;
  if (LOGO_PATTERNS.test(url)) return false;
  if (TRACKING_PATTERNS.test(url)) return false;
  if (url.includes("favicon") || url.includes("logo.") || url.includes("avatar")) return false;
  if (url.startsWith("data:")) return false;
  if (url.length < 40) return false;
  return true;
}

async function searchPexels(query, orientation) {
  const ori = orientation || "landscape";
  try {
    const res = await this.helpers.httpRequest({
      method: "GET",
      url: "https://api.pexels.com/v1/search?query=" + encodeURIComponent(query) + "&per_page=5&orientation=" + ori,
      headers: { "Authorization": PEXELS_API_KEY }
    });
    if (res && res.photos && res.photos.length > 0) {
      for (const p of res.photos) {
        const imgUrl = p.src.large2x || p.src.large || p.src.medium;
        if (imgUrl && p.width >= 600 && !LOGO_PATTERNS.test(p.url) && !LOGO_PATTERNS.test(p.alt || "")) {
          return { url: imgUrl, provider: "pexels", photographer: p.photographer, alt: p.alt || "" };
        }
      }
      const p = res.photos[0];
      return { url: p.src.large2x || p.src.large || p.src.medium, provider: "pexels", photographer: p.photographer, alt: p.alt || "" };
    }
  } catch(e) {}
  return null;
}

async function searchUnsplash(query, orientation) {
  const ori = orientation || "landscape";
  try {
    const res = await this.helpers.httpRequest({
      method: "GET",
      url: "https://api.unsplash.com/search/photos?query=" + encodeURIComponent(query) + "&per_page=5&orientation=" + ori,
      headers: { "Authorization": "Client-ID " + UNSPLASH_ACCESS_KEY }
    });
    if (res && res.results && res.results.length > 0) {
      for (const p of res.results) {
        const imgUrl = p.urls.regular || p.urls.full || p.urls.small;
        if (imgUrl && p.width >= 600 && !LOGO_PATTERNS.test(p.alt_description || "")) {
          return { url: imgUrl, provider: "unsplash", photographer: p.user.name, alt: p.alt_description || "" };
        }
      }
      const p = res.results[0];
      return { url: p.urls.regular || p.urls.full, provider: "unsplash", photographer: p.user.name, alt: p.alt_description || "" };
    }
  } catch(e) {}
  return null;
}

function buildImageQueries(entities, aiImageQueries, title, sourceName) {
  const queries = [];

  if (entities.primary_company && entities.products && entities.products.length > 0) {
    queries.push({ q: entities.primary_company + " " + entities.products[0], type: "product", confidence: 100 });
  }

  if (entities.primary_company && entities.products && entities.products.length > 1) {
    queries.push({ q: entities.primary_company + " " + entities.products[1], type: "product", confidence: 95 });
  }

  if (entities.primary_company) {
    queries.push({ q: entities.primary_company + " official", type: "company", confidence: 90 });
  }

  if (entities.secondary_company) {
    queries.push({ q: entities.secondary_company + " official", type: "company", confidence: 80 });
  }

  if (Array.isArray(aiImageQueries) && aiImageQueries.length > 0) {
    aiImageQueries.forEach((q, i) => {
      const confidence = i === 0 ? 85 : (i === 1 ? 75 : 65);
      queries.push({ q: q, type: i === 0 ? "primary" : "secondary", confidence: confidence });
    });
  }

  if (entities.products && entities.products.length > 0) {
    for (const p of entities.products) {
      if (!queries.some(q => q.q.includes(p))) {
        queries.push({ q: p, type: "product", confidence: 70 });
      }
    }
  }

  if (entities.ai_models && entities.ai_models.length > 0) {
    for (const m of entities.ai_models) {
      queries.push({ q: m + " AI", type: "technology", confidence: 70 });
    }
  }

  if (entities.technologies && entities.technologies.length > 0) {
    for (const t of entities.technologies) {
      if (!queries.some(q => q.q.includes(t))) {
        queries.push({ q: t, type: "technology", confidence: 60 });
      }
    }
  }

  queries.push({ q: "technology innovation", type: "generic", confidence: 30 });
  queries.push({ q: "modern technology", type: "generic", confidence: 25 });

  queries.sort((a, b) => b.confidence - a.confidence);
  return queries;
}

async function selectImage(picked, articleUrl, entities, aiImageQueries, title, sourceName) {
  const meta = { source: "", provider: "", query: "", image_type: "", confidence: 0, original_candidates: 0, pexels_tried: 0, unsplash_tried: 0 };

  if (picked.image && validateImage(picked.image)) {
    meta.source = "rss_enclosure";
    meta.provider = "rss";
    meta.query = "";
    meta.image_type = "article_main";
    meta.confidence = 85;
    meta.original_candidates = 1;
    return { url: picked.image, meta };
  }

  const originalImg = await extractArticleImage(articleUrl);
  if (originalImg && validateImage(originalImg)) {
    meta.source = "original";
    meta.provider = "article_host";
    meta.query = "";
    meta.image_type = "article_main";
    meta.confidence = 95;
    meta.original_candidates = 1;
    return { url: originalImg, meta };
  }

  const queries = buildImageQueries(entities, aiImageQueries, title, sourceName);
  let pexelsTried = 0;
  let unsplashTried = 0;

  for (const q of queries) {
    if (pexelsTried < 3) {
      const result = await searchPexels(q.q);
      pexelsTried++;
      if (result) {
        meta.source = "pexels";
        meta.provider = "pexels";
        meta.query = q.q;
        meta.image_type = q.type;
        meta.confidence = q.confidence;
        meta.pexels_tried = pexelsTried;
        return { url: result.url, meta };
      }
    }
  }

  for (const q of queries) {
    if (unsplashTried < 3) {
      const result = await searchUnsplash(q.q);
      unsplashTried++;
      if (result) {
        meta.source = "unsplash";
        meta.provider = "unsplash";
        meta.query = q.q;
        meta.image_type = q.type;
        meta.confidence = q.confidence - 5;
        meta.pexels_tried = pexelsTried;
        meta.unsplash_tried = unsplashTried;
        return { url: result.url, meta };
      }
    }
  }

  meta.source = "fallback";
  meta.provider = "unsplash_static";
  meta.query = "";
  meta.image_type = "generic";
  meta.confidence = 10;
  meta.pexels_tried = pexelsTried;
  meta.unsplash_tried = unsplashTried;
  return { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", meta };
}

async function saveExecutionHistory(data) {
  try {
    data.completed_at = new Date().toISOString();
    data.grade = data.quality_score ? gradeLabel(data.quality_score) : "";
    let history = [];
    try {
      const h = await ghGet("data/execution_history.json");
      if (h && Array.isArray(h)) history = h;
    } catch(e) {}
    history.unshift(data);
    if (history.length > 200) history.length = 200;
    await ghPut("data/execution_history.json", JSON.stringify(history, null, 2), "Execution: #" + (data.execution_id || "") + " " + (data.status || ""));
  } catch(e) { /* silent */ }
}

async function lastPublishedWasOverride() {
  try {
    const h = await ghGet("data/execution_history.json");
    const history = (h && Array.isArray(h)) ? h : [];
    for (const entry of history) {
      if (entry.status === "published" || entry.status === "published_tg_failed") {
        return !!entry.quality_override;
      }
    }
  } catch(e) {}
  return false;
}

async function checkFallbackConditions(qualityScore, rssSource, wordCount, imageUrl, dimensions) {
  const hoursSinceLastPub = await getHoursSinceLastPublish();
  const srcInfo = RSS_SOURCES.find(s => s.name === rssSource);
  const isTrusted = srcInfo && srcInfo.tier === 1;
  const hasEnoughWords = wordCount >= 700;
  const hasImage = imageUrl && imageUrl.length > 0;
  const minDims = { headline: 8, intro: 5, info: 20, flow: 10, tech: 5, readability: 2, seo: 2 };
  const dimsOk = Object.entries(minDims).every(([k, v]) => (dimensions[k] || 0) >= v);
  const conditions = [
    { label: '\u0641\u062C\u0648\u0629 \u0632\u0645\u0646\u064A\u0629 (' + hoursSinceLastPub.toFixed(1) + '\u0633)', met: hoursSinceLastPub >= 4 },
    { label: '\u0645\u0635\u062F\u0631 \u0645\u0648\u062B\u0648\u0642', met: isTrusted },
    { label: '\u0639\u062F\u062F \u0643\u0644\u0645\u0627\u062A \u0643\u0627\u0641\u064D (' + wordCount + ')', met: hasEnoughWords },
    { label: '\u0635\u0648\u0631\u0629 \u0645\u0648\u062C\u0648\u062F\u0629', met: hasImage },
    { label: '\u0623\u0628\u0639\u0627\u062F \u062F\u0646\u064A\u0627 \u0645\u062A\u0648\u0641\u0631\u0629', met: dimsOk }
  ];
  const metCount = conditions.filter(c => c.met).length;
  return { metCount, total: conditions.length, conditions, hoursSinceLastPub };
}

async function main() {
  await loadSources.call(this);
  const sourceMgmt = await runSourceManagement.call(this);
  const SOURCE_STATS = sourceMgmt.stats;
  const result = {
    status: "ok",
    execution_id: Date.now(),
    triggered_at: new Date().toISOString(),
    completed_at: null,
    mode: "trigger",
    rss_source: "",
    rss_items: 0,
    after_freshness: 0,
    after_tech_filter: 0,
    after_dedup: 0,
    article_title: "",
    ai_success: false,
    quality_score: 0,
    quality_passed: false,
    grade: "",
    quality_dimensions: { info: 0, flow: 0, headline: 0, intro: 0, readability: 0, tech: 0, seo: 0 },
    quality_capped: false,
    failure_reasons: [],
    rewrite_attempted: false,
    rewrite_success: false,
    ai_retries: 0,
    quality_override: false,
    quality_override_reason: "",
    override_level: 0,
    quality_grade: "",
    quality_mode: QUALITY_MODE,
    quality_policy_threshold: QUALITY_THRESHOLD,
    internal_links_count: 0,
    word_count: 0,
    telegram_sent: false,
    telegram_message_id: null,
    telegram_error: "",
    github_deployed: false,
    published: false,
    rejection_reason: "",
    rejection_detail: "",
    article_id: null,
    article_url: null,
    error: "",
    notes: "",
    estimated_gain_after_rewrite: 0,
    estimated_score_after_rewrite: 0,
    would_pass_after_rewrite: false
  };

  try {
  let publishedArticle = false;
  let prevArticle = null;

  /* ───── Phase 11: Source Pool v2 — Collect candidates from ALL enabled sources ───── */
  const allCandidates = [];
  const enabledSources = RSS_SOURCES.filter(s => s.enabled).sort((a, b) => (a.dynamic_priority || a.priority) - (b.dynamic_priority || b.priority));
  let existingHashes = [];
  try {
    const hr = await ghGet("data/content_hashes.json");
    if (hr.content) { const d = b64decode(hr.content); existingHashes = Array.isArray(d) ? d : []; }
  } catch(e) {}

  let totalFetched = 0, totalSources = 0;
  const sourceFetchResults = {};
  for (const src of enabledSources) {
    totalSources++;
    sourceFetchResults[src.id] = { valid: 0, duplicate: 0, failed: false };
    try {
      const res = await this.helpers.httpRequest({ method: "GET", url: src.url, timeout: 15000 });
      const xml = typeof res === "string" ? res : (res.data || res.body || "");
      if (!xml || xml.length < 200) { sourceFetchResults[src.id].failed = true; recordSourceFetch(src.id, SOURCE_STATS, "failure"); continue; }
      const items = parseRSS(xml);
      if (items.length === 0) { sourceFetchResults[src.id].failed = true; recordSourceFetch(src.id, SOURCE_STATS, "failure"); continue; }

      const fresh = items.filter(i => isFresh(i.pubDate, 24));
      if (fresh.length === 0) { sourceFetchResults[src.id].failed = true; recordSourceFetch(src.id, SOURCE_STATS, "failure"); continue; }

      for (const item of fresh) {
        const h = contentHash(item.title, item.contentEncoded || item.desc);
        if (!existingHashes.includes(h)) {
          allCandidates.push({
            item, hash: h,
            sourceId: src.id, sourceName: src.name, sourceUrl: src.url,
            trustScore: src.trust_score, tier: src.tier,
            lang: src.lang, priority: src.priority
          });
          totalFetched++;
          sourceFetchResults[src.id].valid++;
        } else {
          sourceFetchResults[src.id].duplicate++;
          recordSourceFetch(src.id, SOURCE_STATS, "duplicate");
        }
      }
      recordSourceFetch(src.id, SOURCE_STATS, "success", sourceFetchResults[src.id].valid);
    } catch(e) {
      sourceFetchResults[src.id].failed = true;
      recordSourceFetch(src.id, SOURCE_STATS, "failure");
      continue;
    }
  }

  /* ───── Rank candidates by composite score ───── */
  for (const c of allCandidates) {
    const ageHours = c.item.pubDate ? (Date.now() - new Date(c.item.pubDate).getTime()) / 3600000 : 24;
    const freshScore = Math.max(0, 1 - ageHours / 48);
    const trustScore = c.trustScore / 100;
    const langScore = c.lang === 'ar' ? 1 : 0.6;
    const techRelevance = isTech(c.item.title, c.item.desc) ? 1 : 0.5;
    c.rankScore = freshScore * 0.35 + trustScore * 0.30 + langScore * 0.20 + techRelevance * 0.15;
  }

  allCandidates.sort((a, b) => b.rankScore - a.rankScore);

  /* ───── Phase 11: Dedup similar titles within ranked candidates ───── */
  const dedupedCandidates = [];
  const seenNormTitles = new Set();
  for (const c of allCandidates) {
    const normTitle = (c.item.title||"").replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "").trim().toLowerCase().substring(0, 50);
    let isDup = false;
    for (const st of seenNormTitles) {
      const sim = similarity(normTitle, st);
      if (sim > 0.75) { isDup = true; break; }
    }
    if (!isDup) {
      seenNormTitles.add(normTitle);
      dedupedCandidates.push(c);
    }
  }

  result.rss_sources_attempted = totalSources;
  result.rss_candidates_raw = allCandidates.length;
  result.rss_candidates_after_dedup = dedupedCandidates.length;

  const maxCandidates = Math.min(dedupedCandidates.length, 8);

  for (let itemIdx = 0; itemIdx < maxCandidates && !publishedArticle; itemIdx++) {
  const { item: picked, hash, sourceId: usedSourceId, sourceName: usedSource, trustScore: srcTrust, tier: srcTier } = dedupedCandidates[itemIdx];
  result.rss_source = usedSource;
  const articleId = makeId();
  const sourceName = picked.source || usedSource;
  result.rss_source = usedSource;
  const techdoseLink = FRONTEND_URL + "/article.html?id=" + articleId;

  let existingIndex = [];
  try {
    const ir = await ghGet("data/articles/index.json");
    if (ir.content) { const d = b64decode(ir.content); existingIndex = Array.isArray(d) ? d : []; }
  } catch(e) {}

  let fullArticleContent = null;
  try {
    fullArticleContent = await fetchArticleContent(picked.link);
  } catch(e) {}
  if (!fullArticleContent) {
    fullArticleContent = picked.contentEncoded || picked.desc || "";
  }
  result.fetched_content_length = (fullArticleContent || "").length;

  const maxRetries = 3;
  let ai;
  let article = null;
  let qualityScore = 0;
  let attempt = 0;
  let aiTitle = "", aiExcerpt = "", aiBody = "", aiTg = "", aiCategory = "";
  let aiTags = [];
  let seoTitle = "", metaDesc = "", seoSlug = "", focusKw = "";
  let secondaryKws = [];
  let primaryCompany = null, secondaryCompany = null;
  let products = [], devices = [], technologies = [], aiModels = [];
  let os = [], chipsets = [], browsers = [], cloud = [], languages = [];
  let opensource = [], executives = [], markets = [], countries = [], people = [];
  let stocks = [], investors = [], imageQueries = [];
  let internalLinks = [];
  let imageUrl = "", imageMeta = {};
  const genStart = Date.now();

  while (attempt < maxRetries) {
    try {
      ai = await aiGenerate(picked.title, fullArticleContent, sourceName);
      if (!ai) throw new Error('AI generation failed after all retries (429)');
      result.ai_success = true;
    } catch(e) {
      result.status = "ai_failed";
      result.ai_error = e.message;
      return result;
    }

    ai = editorialFormat(ai);

    aiTitle = ai.title_ar || picked.title;
    aiExcerpt = (ai.excerpt || ai.body || "").substring(0, 300);
    aiBody = ai.body || "";
    aiTg = ai.telegram_summary || ai.excerpt || "";
    aiCategory = ai.category || "تكنولوجيا";
    aiTags = Array.isArray(ai.tags) ? ai.tags : ["تكنولوجيا"];

    seoTitle = ai.seo_title || aiTitle;
    metaDesc = ai.meta_description || aiExcerpt.substring(0, 160);
    seoSlug = ai.seo_slug || "";
    focusKw = ai.focus_keyword || "";
    secondaryKws = Array.isArray(ai.secondary_keywords) ? ai.secondary_keywords : [];

    primaryCompany = ai.primary_company || null;
    secondaryCompany = ai.secondary_company || null;
    products = Array.isArray(ai.products) ? ai.products : [];
    devices = Array.isArray(ai.devices) ? ai.devices : [];
    technologies = Array.isArray(ai.technologies) ? ai.technologies : [];
    aiModels = Array.isArray(ai.ai_models) ? ai.ai_models : [];
    os = Array.isArray(ai.os) ? ai.os : [];
    chipsets = Array.isArray(ai.chipsets) ? ai.chipsets : [];
    browsers = Array.isArray(ai.browsers) ? ai.browsers : [];
    cloud = Array.isArray(ai.cloud_platforms) ? ai.cloud_platforms : [];
    languages = Array.isArray(ai.languages) ? ai.languages : [];
    opensource = Array.isArray(ai.opensource_projects) ? ai.opensource_projects : [];
    executives = Array.isArray(ai.executives) ? ai.executives : [];
    markets = Array.isArray(ai.markets) ? ai.markets : [];
    countries = Array.isArray(ai.countries) ? ai.countries : [];
    people = Array.isArray(ai.people) ? ai.people : [];
    stocks = Array.isArray(ai.stocks) ? ai.stocks : [];
    investors = Array.isArray(ai.investors) ? ai.investors : [];
    imageQueries = Array.isArray(ai.image_queries) ? ai.image_queries : [];

    internalLinks = await generateInternalLinks({
      primary_company: primaryCompany,
      secondary_company: secondaryCompany,
      products: products,
      technologies: technologies,
      ai_models: aiModels,
      countries: countries,
      people: people,
      tags: aiTags
    }, existingIndex);
    result.internal_links_count = internalLinks.length;

    const entities = { primary_company: primaryCompany, secondary_company: secondaryCompany, products, technologies, ai_models: aiModels, countries, people };
    const imgResult = await selectImage(picked, picked.link, entities, imageQueries, aiTitle, sourceName);
    imageUrl = imgResult.url;
    imageMeta = imgResult.meta;
    result.image_source = imageMeta.source;
    result.image_provider = imageMeta.provider;
    result.image_query = imageMeta.query;
    result.image_type = imageMeta.image_type;
    result.image_confidence = imageMeta.confidence;
    result.original_candidates = imageMeta.original_candidates;
    result.pexels_tried = imageMeta.pexels_tried;
    result.unsplash_tried = imageMeta.unsplash_tried;

    const bodyHtml = "<p>" + aiBody.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>") + "</p>";

    article = {
      id: articleId,
      title_ar: aiTitle,
      excerpt: aiExcerpt,
      body: bodyHtml,
      category: aiCategory,
      tags: aiTags,
      image: imageUrl,
      image_source: imageMeta.source,
      image_provider: imageMeta.provider,
      image_query: imageMeta.query,
      image_type: imageMeta.image_type,
      image_confidence: imageMeta.confidence,
      source_link: picked.link,
      source_name: sourceName,
      status: "published",
      readTime: Math.ceil(aiBody.split(/\s+/).filter(Boolean).length / 200) + " min read",
      created_at: new Date().toISOString()
    };

    const qResult = calculateQuality({
      title_ar: aiTitle,
      excerpt: aiExcerpt,
      body: aiBody,
      image: imageUrl,
      tags: aiTags,
      primary_company: primaryCompany,
      products: products,
      technologies: technologies,
      ai_models: aiModels,
      countries: countries,
      internal_links: internalLinks
    });
    qualityScore = qResult.total;
    result.quality_score = qualityScore;
    result.quality_dimensions = qResult.breakdown;
    result.word_count = aiBody.split(/\s+/).filter(Boolean).length;

    if (qResult.total >= QUALITY_THRESHOLD) {
      break;
    }

    attempt++;
    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  /* ───── Phase 7.4: Targeted Rewrite (failed dimensions only) ───── */
  if (qualityScore < QUALITY_THRESHOLD) {
    result.rewrite_attempted = true;
    result.ai_retries = attempt;
    try {
      const rewritten = await aiRewrite(ai, picked.title, fullArticleContent, sourceName, result.quality_dimensions);
      if (rewritten && rewritten.body) {
        ai = rewritten;
        result.rewrite_success = true;
        ai = editorialFormat(ai);
        aiTitle = ai.title_ar || picked.title;
        aiExcerpt = (ai.excerpt || ai.body || "").substring(0, 300);
        aiBody = ai.body || "";
        aiTg = ai.telegram_summary || ai.excerpt || "";
        aiCategory = ai.category || "تكنولوجيا";
        aiTags = Array.isArray(ai.tags) ? ai.tags : ["تكنولوجيا"];
        seoTitle = ai.seo_title || aiTitle;
        metaDesc = ai.meta_description || aiExcerpt.substring(0, 160);
        seoSlug = ai.seo_slug || "";
        focusKw = ai.focus_keyword || "";
        secondaryKws = Array.isArray(ai.secondary_keywords) ? ai.secondary_keywords : [];
        primaryCompany = ai.primary_company || null;
        secondaryCompany = ai.secondary_company || null;
        products = Array.isArray(ai.products) ? ai.products : [];
        devices = Array.isArray(ai.devices) ? ai.devices : [];
        technologies = Array.isArray(ai.technologies) ? ai.technologies : [];
        aiModels = Array.isArray(ai.ai_models) ? ai.ai_models : [];
        os = Array.isArray(ai.os) ? ai.os : [];
        chipsets = Array.isArray(ai.chipsets) ? ai.chipsets : [];
        browsers = Array.isArray(ai.browsers) ? ai.browsers : [];
        cloud = Array.isArray(ai.cloud_platforms) ? ai.cloud_platforms : [];
        languages = Array.isArray(ai.languages) ? ai.languages : [];
        opensource = Array.isArray(ai.opensource_projects) ? ai.opensource_projects : [];
        executives = Array.isArray(ai.executives) ? ai.executives : [];
        markets = Array.isArray(ai.markets) ? ai.markets : [];
        countries = Array.isArray(ai.countries) ? ai.countries : [];
        people = Array.isArray(ai.people) ? ai.people : [];
        stocks = Array.isArray(ai.stocks) ? ai.stocks : [];
        investors = Array.isArray(ai.investors) ? ai.investors : [];
        imageQueries = Array.isArray(ai.image_queries) ? ai.image_queries : [];
        internalLinks = await generateInternalLinks({
          primary_company: primaryCompany, secondary_company: secondaryCompany,
          products: products, technologies: technologies, ai_models: aiModels,
          countries: countries, people: people, tags: aiTags
        }, existingIndex);
        result.internal_links_count = internalLinks.length;
        const entities = { primary_company: primaryCompany, secondary_company: secondaryCompany, products, technologies, ai_models: aiModels, countries, people };
        const imgResult = await selectImage(picked, picked.link, entities, imageQueries, aiTitle, sourceName);
        imageUrl = imgResult.url;
        imageMeta = imgResult.meta;
        result.image_source = imageMeta.source;
        result.image_provider = imageMeta.provider;
        result.image_query = imageMeta.query;
        result.image_type = imageMeta.image_type;
        result.image_confidence = imageMeta.confidence;
        result.original_candidates = imageMeta.original_candidates;
        result.pexels_tried = imageMeta.pexels_tried;
        result.unsplash_tried = imageMeta.unsplash_tried;
    const bodyHtml = "<p>" + aiBody.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>") + "</p>";
    result.word_count = aiBody.split(/\s+/).filter(Boolean).length;
        article = {
          id: articleId, title_ar: aiTitle, excerpt: aiExcerpt, body: bodyHtml,
          category: aiCategory, tags: aiTags, image: imageUrl,
          image_source: imageMeta.source, image_provider: imageMeta.provider,
          image_query: imageMeta.query, image_type: imageMeta.image_type,
          image_confidence: imageMeta.confidence, source_link: picked.link,
          source_name: sourceName, status: "published",
          readTime: Math.ceil(aiBody.split(/\s+/).filter(Boolean).length / 200) + " min read",
          created_at: new Date().toISOString()
        };
        const qResult2 = calculateQuality({
          title_ar: aiTitle, excerpt: aiExcerpt, body: aiBody, image: imageUrl,
          tags: aiTags, primary_company: primaryCompany, products: products,
          technologies: technologies, ai_models: aiModels, countries: countries,
          internal_links: internalLinks
        });
        qualityScore = qResult2.total;
        result.quality_score = qualityScore;
        result.quality_dimensions = qResult2.breakdown;
      }
    } catch(e) {
      result.rewrite_error = e.message;
    }
  }

  /* ───── Phase 10.2 Part E: Trusted Source Boost (max +3, only if quality >= 75) ───── */
  const isTrustedSource = srcTier === 1;
  if (qualityScore < QUALITY_THRESHOLD && qualityScore >= 75 && isTrustedSource) {
    const boost = Math.min(3, QUALITY_THRESHOLD - qualityScore);
    qualityScore += boost;
    result.quality_score = qualityScore;
    result.notes = (result.notes || '') + 'Trusted source boost +' + boost + '. ';
  }

  /* ───── Phase 10.3 Level 1: Emergency Publication (2h idle, Q 70-79, strict conditions) ───── */
  if (qualityScore < QUALITY_THRESHOLD && qualityScore >= 70) {
    const hoursSinceL1 = await getHoursSinceLastPublish();
    const lastOverrideL1 = await lastPublishedWasOverride();
    if (hoursSinceL1 >= 2 && !lastOverrideL1) {
      const trustedL1 = srcTier === 1 || srcTier === 2;
      const bdL1 = result.quality_dimensions || {};
      const infoOkL1 = (bdL1.info || 0) >= Math.round(38 * 0.6);
      const flowOkL1 = (bdL1.flow || 0) >= Math.round(15 * 0.6);
      const techOkL1 = (bdL1.tech || 0) >= 8;
      const hasImageL1 = imageUrl && imageUrl.length > 0 && validateImage(imageUrl);
      if (trustedL1 && result.rewrite_success && result.word_count >= 700 && hasImageL1 && infoOkL1 && flowOkL1 && techOkL1) {
        result.quality_override = true;
        result.override_level = 1;
        result.quality_grade = "B";
        result.quality_override_reason = "No publication for 2 hours";
        qualityScore = QUALITY_THRESHOLD;
      }
    }
  }

  if (qualityScore < QUALITY_THRESHOLD) {
    if (itemIdx < newItems.length - 1) {
      result.notes = (result.notes || '') + 'Item ' + itemIdx + ' quality=' + qualityScore + ', trying next. ';
      continue;
    }
    result.quality_passed = false;
    const dimTargets = { info: 38, flow: 15, headline: 12, intro: 10, readability: 5, tech: 15, seo: 5 };
    const dimLabels = { info: 'Information', flow: 'Flow', headline: 'Headline', intro: 'Intro', readability: 'Readability', tech: 'Technical', seo: 'SEO' };
    const dimAr = { info: 'المعلومات', flow: 'التدفق', headline: 'العنوان', intro: 'المقدمة', readability: 'القراءة', tech: 'التقني', seo: 'SEO' };
    const bd = result.quality_dimensions || {};
    const reasons = [];
    for (const [k, target] of Object.entries(dimTargets)) {
      const score = bd[k] || 0;
      if (score < target * 0.7) {
        reasons.push(dimAr[k] + ' ضعيف (' + score + '/' + target + ')');
      }
    }
    if (reasons.length === 0) reasons.push('المجموع الكلي أقل من الحد (' + qualityScore + '/' + QUALITY_THRESHOLD + ')');
    result.failure_reasons = reasons;
    result.rejection_reason = 'Quality Failed';
    result.rejection_detail = reasons.join('؛ ');
    if (!prevArticle) prevArticle = { article, ai, articleId, techdoseLink, sourceId: usedSourceId, qResult: { total: qualityScore, breakdown: result.quality_dimensions } };
    result.notes = (result.notes || '') + 'Source ' + usedSource + ' exhausted, trying next. ';
    break;
  }
  result.quality_passed = true;
  publishedArticle = true;
  result.status = "published";
  if (usedSourceId && SOURCE_STATS) {
    recordSourceFetch(usedSourceId, SOURCE_STATS, "published", qualityScore, Date.now() - genStart, 0);
  }
  } /* end for(itemIdx) */


  if (!publishedArticle && prevArticle) {
    /* ───── Level 2: Force publish best candidate after exhausting all sources ───── */
    const hoursSinceL2 = await getHoursSinceLastPublish();
    const lastOverrideL2 = await lastPublishedWasOverride();
    if (hoursSinceL2 >= 2 && !lastOverrideL2) {
      qualityScore = QUALITY_THRESHOLD;
      result.quality_score = qualityScore;
      result.quality_override = true;
      result.override_level = 2;
      result.quality_grade = gradeLabel(prevArticle.qResult.total);
      result.quality_override_reason = "Level 2 — forced publication after exhausting all sources";
      result.quality_passed = true;
      publishedArticle = true;
      if (prevArticle.sourceId && SOURCE_STATS) {
        recordSourceFetch(prevArticle.sourceId, SOURCE_STATS, "published", qualityScore, Date.now() - genStart, 0);
      }
      article = prevArticle.article;
      articleId = prevArticle.articleId;
      techdoseLink = prevArticle.techdoseLink;
      const lai = prevArticle.ai;
      aiTitle = lai.title_ar || article.title_ar;
      aiExcerpt = (lai.excerpt || lai.body || "").substring(0, 300);
      aiBody = lai.body || "";
      aiTg = lai.telegram_summary || lai.excerpt || "";
      aiCategory = lai.category || article.category || "تكنولوجيا";
      aiTags = Array.isArray(lai.tags) ? lai.tags : (Array.isArray(article.tags) ? article.tags : ["تكنولوجيا"]);
      seoTitle = lai.seo_title || aiTitle;
      metaDesc = lai.meta_description || aiExcerpt.substring(0, 160);
      seoSlug = lai.seo_slug || "";
      focusKw = lai.focus_keyword || "";
      secondaryKws = Array.isArray(lai.secondary_keywords) ? lai.secondary_keywords : [];
      primaryCompany = lai.primary_company || null;
      secondaryCompany = lai.secondary_company || null;
      products = Array.isArray(lai.products) ? lai.products : [];
      devices = Array.isArray(lai.devices) ? lai.devices : [];
      technologies = Array.isArray(lai.technologies) ? lai.technologies : [];
      aiModels = Array.isArray(lai.ai_models) ? lai.ai_models : [];
      os = Array.isArray(lai.os) ? lai.os : [];
      chipsets = Array.isArray(lai.chipsets) ? lai.chipsets : [];
      browsers = Array.isArray(lai.browsers) ? lai.browsers : [];
      cloud = Array.isArray(lai.cloud_platforms) ? lai.cloud_platforms : [];
      languages = Array.isArray(lai.languages) ? lai.languages : [];
      opensource = Array.isArray(lai.opensource_projects) ? lai.opensource_projects : [];
      executives = Array.isArray(lai.executives) ? lai.executives : [];
      markets = Array.isArray(lai.markets) ? lai.markets : [];
      countries = Array.isArray(lai.countries) ? lai.countries : [];
      people = Array.isArray(lai.people) ? lai.people : [];
      stocks = Array.isArray(lai.stocks) ? lai.stocks : [];
      investors = Array.isArray(lai.investors) ? lai.investors : [];
      imageQueries = Array.isArray(lai.image_queries) ? lai.image_queries : [];
      imageUrl = article.image || "";
      hash = contentHash(article.title_ar, article.excerpt || "");
    } else {
      const dimTargets = { info: 38, flow: 15, headline: 12, intro: 10, readability: 5, tech: 15, seo: 5 };
      const bd = prevArticle.qResult.breakdown || {};
      let estimatedGain = 0;
      for (const [k, target] of Object.entries(dimTargets)) {
        const score = bd[k] || 0;
        if (score < target * 0.7) {
          const potential = Math.round(target * 0.7);
          estimatedGain += potential - score;
        }
      }
      const estimatedAfter = Math.min(100, prevArticle.qResult.total + estimatedGain);
      result.status = "quality_rejected";
      result.quality_passed = false;
      result.article_title = prevArticle.article.title_ar;
      result.quality_score = prevArticle.qResult.total;
      result.quality_dimensions = prevArticle.qResult.breakdown;
      result.estimated_gain_after_rewrite = estimatedGain;
      result.estimated_score_after_rewrite = estimatedAfter;
      result.would_pass_after_rewrite = estimatedAfter >= QUALITY_THRESHOLD;
      return result;
    }
  }
  if (!publishedArticle) {
    result.status = "quality_rejected";
    return result;
  }

  let index = [];
  try {
    const ir = await ghGet("data/articles/index.json");
    if (ir.content) { const d = b64decode(ir.content); index = Array.isArray(d) ? d : []; }
  } catch(e) {}

  index.unshift({
    id: article.id,
    title: article.title_ar,
    excerpt: article.excerpt,
    body: article.body,
    category: article.category,
    tags: article.tags,
    image: article.image,
    image_source: article.image_source,
    image_provider: article.image_provider,
    image_query: article.image_query,
    image_type: article.image_type,
    image_confidence: article.image_confidence,
    date: article.created_at,
    readTime: article.readTime,
    views: "0",
    hasEgyptImpact: false,
    source: article.source_name,
    link: article.source_link,
    techdose_link: techdoseLink,
    status: "published",
    seo_title: seoTitle,
    meta_description: metaDesc,
    seo_slug: seoSlug,
    focus_keyword: focusKw,
    secondary_keywords: secondaryKws,
    primary_company: primaryCompany,
    secondary_company: secondaryCompany,
    products: products,
    devices: devices,
    technologies: technologies,
    ai_models: aiModels,
    os: os,
    chipsets: chipsets,
    browsers: browsers,
    cloud_platforms: cloud,
    languages: languages,
    opensource_projects: opensource,
    executives: executives,
    markets: markets,
    countries: countries,
    people: people,
    stocks: stocks,
    investors: investors,
    image_queries: imageQueries,
    internal_links: internalLinks,
    quality_score: qualityScore
  });
  if (index.length > 500) index.length = 500;
  await ghPut("data/articles/index.json", JSON.stringify(index, null, 2), "Index: " + aiTitle.substring(0,80));

  existingHashes.unshift(hash);
  if (existingHashes.length > 10000) existingHashes.length = 10000;
  await ghPut("data/content_hashes.json", JSON.stringify(existingHashes, null, 2), "Hash: " + aiTitle.substring(0,80));

  try {
    const lr = await ghGet("data/published_links.json");
    let links = lr.content ? b64decode(lr.content) : [];
    if (!Array.isArray(links)) links = [];
    links.unshift(picked.link);
    if (links.length > 5000) links.length = 5000;
    await ghPut("data/published_links.json", JSON.stringify(links, null, 2), "Link: " + aiTitle.substring(0,80));
  } catch(e) {}

  try {
    const tr = await ghGet("data/published_topics.json");
    let topics = tr.content ? b64decode(tr.content) : [];
    if (!Array.isArray(topics)) topics = [];
    topics.unshift({ title: aiTitle, source: sourceName, timestamp: article.created_at, topic_fp: "" });
    if (topics.length > 500) topics.length = 500;
    await ghPut("data/published_topics.json", JSON.stringify(topics, null, 2), "Topic: " + aiTitle.substring(0,80));
  } catch(e) {}

  result.article_id = articleId;
  result.article_url = techdoseLink;

  try {
    const htmlMsg = "\uD83D\uDCF0 <b>" + aiTitle + "</b>\n\n"
      + aiTg + "\n\n"
      + "\uD83D\uDD17 <a href=\"" + techdoseLink + "\">اقرأ الخبر كاملاً</a>\n"
      + "\uD83D\uDCC4 المصدر: " + sourceName;

    const tgRes = await this.helpers.httpRequest({
      method: "POST",
      url: "https://api.telegram.org/bot" + TG_TOKEN + "/sendMessage",
      headers: { "Content-Type": "application/json" },
      body: {
        chat_id: TG_CHAT_ID,
        text: htmlMsg,
        parse_mode: "HTML",
        disable_web_page_preview: false
      }
    });

    result.telegram_sent = true;
    result.telegram_message_id = tgRes.result ? tgRes.result.message_id : null;
    result.status = "published";
  } catch(e) {
    result.telegram_error = e.message;
    result.status = "published_tg_failed";
  }

  return result;
  } catch(e) {
    result.status = "unhandled_error";
    result.error = e.message;
    return result;
  } finally {
    if (SOURCE_STATS) { await saveSourceStats.call(this, { stats: SOURCE_STATS, last_ranking_update: sourceMgmt.last_ranking_update }); }
    await saveExecutionHistory(result);
  }
}

const _r = await main();
return [{ json: _r }];

/* ───── Phase 11C: Source Statistics & Management ───── */

async function loadSourceStats() {
  try {
    const res = await this.helpers.httpRequest({
      method: "GET", url: GH_API + "/data/source_statistics.json", headers: GH_H
    });
    if (res && res.content) {
      const d = JSON.parse(Buffer.from(res.content, "base64").toString("utf-8"));
      if (d && d.stats) return d;
    }
  } catch(e) {}
  return { stats: {}, last_ranking_update: null };
}

async function saveSourceStats(data) {
  try {
    const encoded = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
    const existing = await this.helpers.httpRequest({
      method: "GET", url: GH_API + "/data/source_statistics.json", headers: GH_H
    });
    await this.helpers.httpRequest({
      method: "PUT", url: GH_API + "/data/source_statistics.json",
      headers: { "Authorization": "token " + GH_TOKEN, "Content-Type": "application/json" },
      body: { message: "Source stats update", content: encoded, sha: (existing && existing.sha) ? existing.sha : undefined, branch: "main" }
    });
  } catch(e) {}
}

function pad(n) { return n < 10 ? "0" + n : "" + n; }

function dStr(d) { return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()); }

function calcPublishRate(stat) {
  const total = stat.fetch_count || 1;
  return Math.round(((stat.published_articles || 0) / total) * 100) / 100;
}

function calcDupRate(stat) {
  const total = stat.valid_articles || 1;
  return Math.round(((stat.duplicate_articles || 0) / total) * 100) / 100;
}

function calcFailRate(stat) {
  const total = stat.fetch_count || 1;
  return Math.round(((stat.failed_fetches || 0) / total) * 100) / 100;
}

function recalcDerivedStats(stat) {
  stat.publish_rate = calcPublishRate(stat);
  stat.duplicate_rate = calcDupRate(stat);
  stat.failure_rate = calcFailRate(stat);
  if (stat.quality_sum && stat.published_articles > 0) {
    stat.average_quality = Math.round((stat.quality_sum / stat.published_articles) * 10) / 10;
  }
  return stat;
}

function classifyHealth(src, stat) {
  if (!src.enabled) return "DISABLED";
  const fr = stat.failure_rate || 0;
  const dr = stat.duplicate_rate || 0;
  const pr = stat.publish_rate || 0;
  const daysSinceSuccess = stat.last_success ? (Date.now() - new Date(stat.last_success).getTime()) / 86400000 : 99;
  const consecFails = stat.consecutive_failures || 0;
  const healthDays = stat.health_history || [];
  const recentHealth = healthDays.slice(-7).filter(h => h === "RED").length;
  if (consecFails >= 3 || fr > 0.8 || daysSinceSuccess > 3 || recentHealth >= 4) return "RED";
  if (consecFails >= 1 || fr > 0.4 || dr > 0.5 || pr < 0.05 || daysSinceSuccess > 1) return "YELLOW";
  return "GREEN";
}

function calculateSourceScore(src, stat) {
  const trust = (src.trust_score || 70) / 10;
  const pr = (stat.publish_rate || 0) * 50;
  const aq = stat.average_quality || 0;
  const dr = (stat.duplicate_rate || 0) * 30;
  const fr = (stat.failure_rate || 0) * 40;
  return Math.max(1, Math.round(trust + pr + aq - dr - fr));
}

async function runSourceManagement() {
  const srcData = await loadSourceStats.call(this);
  const stats = srcData.stats;
  const now = Date.now();
  let changed = false;

  /* Initialize stats for any new sources */
  for (const src of RSS_SOURCES) {
    if (!stats[src.id]) {
      stats[src.id] = {
        fetch_count: 0, valid_articles: 0, published_articles: 0,
        duplicate_articles: 0, rejected_articles: 0, failed_fetches: 0,
        quality_sum: 0, generation_time_sum: 0, publish_time_sum: 0,
        consecutive_failures: 0, average_quality: 0, publish_rate: 0,
        duplicate_rate: 0, failure_rate: 0,
        last_success: null, last_fetch: null, last_failure: null,
        health: "GREEN", health_history: [], daily_stats: {}
      };
      changed = true;
    }
  }

  /* Auto Recovery: retest disabled sources every 24h */
  for (const src of RSS_SOURCES) {
    if (!src.enabled) {
      const stat = stats[src.id];
      const lastTest = stat.last_fetch;
      if (!lastTest || (now - new Date(lastTest).getTime()) > 86400000) {
        try {
          const res = await this.helpers.httpRequest({ method: "GET", url: src.url, timeout: 10000 });
          const xml = typeof res === "string" ? res : (res.data || res.body || "");
          if (xml && xml.length >= 200) {
            const items = parseRSS(xml);
            if (items.length > 0) {
              src.enabled = true;
              stat.consecutive_failures = 0;
              stat.last_success = new Date().toISOString();
              stat.health = "GREEN";
              changed = true;
            }
          }
        } catch(e) {}
        stat.last_fetch = new Date().toISOString();
        changed = true;
      }
    }
  }

  /* Auto disable: 5 consecutive failures or 7 days without valid article */
  for (const src of RSS_SOURCES) {
    if (!src.enabled) continue;
    const stat = stats[src.id];
    if (stat.consecutive_failures >= 5) {
      src.enabled = false;
      stat.health = "RED";
      changed = true;
      continue;
    }
    if (stat.last_success && (now - new Date(stat.last_success).getTime()) > 604800000) {
      src.enabled = false;
      stat.health = "RED";
      changed = true;
    }
  }

  /* Update health classification for all sources */
  for (const src of RSS_SOURCES) {
    const stat = stats[src.id];
    const health = classifyHealth(src, stat);
    if (health !== stat.health) {
      stat.health = health;
      changed = true;
    }
    stat.health_history = stat.health_history || [];
    const today = dStr(new Date());
    if (stat.health_history.length === 0 || stat.health_history[stat.health_history.length - 1].split(":")[0] !== today) {
      stat.health_history.push(today + ":" + health);
      if (stat.health_history.length > 90) stat.health_history.splice(0, stat.health_history.length - 90);
      changed = true;
    }
  }

  /* Dynamic priority recalculation (once per day) */
  const lastRank = srcData.last_ranking_update;
  const shouldRank = !lastRank || (now - new Date(lastRank).getTime()) > 86400000;
  if (shouldRank) {
    const scores = {};
    for (const src of RSS_SOURCES) {
      const stat = stats[src.id];
      recalcDerivedStats(stat);
      const score = calculateSourceScore(src, stat);
      scores[src.id] = score;
    }
    const sorted = RSS_SOURCES.filter(s => s.enabled).sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
    sorted.forEach((s, i) => { s.dynamic_priority = i + 1; });
    RSS_SOURCES.filter(s => !s.enabled).forEach(s => { s.dynamic_priority = 999; });
    srcData.last_ranking_update = new Date().toISOString();
    changed = true;
  }

  /* Save updated sources and stats */
  if (changed) {
    await saveSourceStats.call(this, srcData);
    try {
      const encoded = Buffer.from(JSON.stringify(RSS_SOURCES, null, 2)).toString("base64");
      const existing = await this.helpers.httpRequest({
        method: "GET", url: GH_API + "/data/rss_sources.json", headers: GH_H
      });
      await this.helpers.httpRequest({
        method: "PUT", url: GH_API + "/data/rss_sources.json",
        headers: { "Authorization": "token " + GH_TOKEN, "Content-Type": "application/json" },
        body: { message: "Auto source management update", content: encoded, sha: (existing && existing.sha) ? existing.sha : undefined, branch: "main" }
      });
    } catch(e) {}
  }

  return srcData;
}

function recordSourceFetch(srcId, stats, outcome, val1, val2, val3) {
  if (!stats[srcId]) return;
  const s = stats[srcId];
  s.fetch_count = (s.fetch_count || 0) + 1;
  s.last_fetch = new Date().toISOString();
  if (outcome === "success") {
    s.valid_articles = (s.valid_articles || 0) + (val1 || 1);
    s.consecutive_failures = 0;
    s.last_success = new Date().toISOString();
  } else if (outcome === "failure") {
    s.failed_fetches = (s.failed_fetches || 0) + 1;
    s.consecutive_failures = (s.consecutive_failures || 0) + 1;
    s.last_failure = new Date().toISOString();
  } else if (outcome === "duplicate") {
    s.duplicate_articles = (s.duplicate_articles || 0) + 1;
  } else if (outcome === "rejected") {
    s.rejected_articles = (s.rejected_articles || 0) + 1;
  } else if (outcome === "published") {
    s.published_articles = (s.published_articles || 0) + 1;
    s.quality_sum = (s.quality_sum || 0) + (val1 || 0);
    s.generation_time_sum = (s.generation_time_sum || 0) + (val2 || 0);
    s.publish_time_sum = (s.publish_time_sum || 0) + (val3 || 0);
    s.average_quality = Math.round(((s.quality_sum) / s.published_articles) * 10) / 10;
    const today = dStr(new Date());
    s.daily_stats = s.daily_stats || {};
    s.daily_stats[today] = s.daily_stats[today] || { published: 0, quality_sum: 0, failures: 0, duplicates: 0 };
    s.daily_stats[today].published++;
    s.daily_stats[today].quality_sum += (val1 || 0);
    const keys = Object.keys(s.daily_stats).sort();
    while (keys.length > 30) { delete s.daily_stats[keys.shift()]; }
  }
}

