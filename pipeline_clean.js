
const RSS_SOURCES = [
  { name: "BBC Arabic", url: "https://feeds.bbci.co.uk/arabic/rss.xml", lang: "ar", tier: 1 },
  { name: "عرب هاردوير", url: "https://arabhardware.net/feed/", lang: "ar", tier: 1 },
  { name: "التقنية بلا حدود", url: "https://www.tech-wd.com/wd/feed/", lang: "ar", tier: 1 },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", lang: "en", tier: 1 },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", lang: "en", tier: 1 },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", lang: "en", tier: 1 },
  { name: "GSMArena", url: "https://www.gsmarena.com/rss-news-reviews.php3", lang: "en", tier: 2 },
  { name: "Android Authority", url: "https://www.androidauthority.com/feed/", lang: "en", tier: 2 },
  { name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/all", lang: "en", tier: 2 },
  { name: "تك عربي", url: "https://techarabi.com/feed/", lang: "ar", tier: 2 },
  { name: "تيك العرب", url: "https://techalarab.com/feed/", lang: "ar", tier: 2 },
  { name: "TECHx Arabic", url: "https://techxmediaarabic.com/feed/", lang: "ar", tier: 2 },
];

const GNEWS_URL = "https://news.google.com/rss/search?q=(OpenAI+OR+Google+AI+OR+Gemini+OR+ChatGPT+OR+Microsoft+AI+OR+NVIDIA+OR+Tesla+OR+Apple+OR+Cybersecurity+OR+Startup+OR+AI+tools+OR+robotics+OR+developers+OR+programming)&hl=en-US&gl=US&ceid=US:en";

const GH_TOKEN = process.env.GH_TOKEN || "";
const GH_API = "https://api.github.com/repos/osamaelfeky567/techdosenews/contents";
const GH_H = { "Authorization": "token " + GH_TOKEN, "Accept": "application/vnd.github.v3+json" };

const TG_TOKEN = process.env.TG_TOKEN || "";
const TG_CHAT_ID = process.env.TG_CHAT_ID || "-1003896125398";
const FRONTEND_URL = "https://osamaelfeky567.github.io/techdosenews";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.1-8b-instant";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";

const TECH_KW = ["ai","artificial intelligence","machine learning","deep learning","llm","gpt","openai","anthropic","claude","gemini","chatbot","software","startup","cybersecurity","security","cloud","saas","mobile","smartphone","developer","programming","coding","api","github","database","blockchain","quantum","robotics","drone","autonomous","self-driving","ev","electric vehicle","chip","processor","gpu","cpu","nvidia","intel","amd","apple","google","microsoft","meta","amazon","aws","iphone","ipad","mac","windows","linux","android","5g","6g","iot","vr","ar","metaverse","tech","technology","innovation","ipo","acquisition","funding","venture capital","silicon valley","robot","automation","digital","privacy","data breach","vulnerability","patch","cyber attack","ransomware"];

const REJ_KW = ["politics","election","president","congress","senate","lifestyle","fashion","beauty","shopping","sports","nfl","nba","soccer","football","basketball","recipe","cooking","restaurant","travel","tourism","celebrity","gossip","entertainment","movie review","top 10","top 5","best ai tools","make money","earn money","passive income","click here","subscribe now"];

const QUALITY_THRESHOLD = 80;

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
  return JSON.parse(Buffer.from(encoded, "base64").toString());
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

function calculateQuality(article) {
  let score = 0;
  const wordCount = (article.body || "").split(/\s+/).filter(Boolean).length;
  if (wordCount >= 700) score += 20;
  else if (wordCount >= 500) score += 14;
  else if (wordCount >= 300) score += 8;
  else score += 2;
  const titleLen = (article.title_ar || "").length;
  if (titleLen >= 40 && titleLen <= 65) score += 12;
  else if (titleLen >= 30 && titleLen <= 75) score += 8;
  else score += 2;
  const excerptLen = (article.excerpt || "").length;
  if (excerptLen >= 100 && excerptLen <= 200) score += 10;
  else if (excerptLen >= 50 && excerptLen <= 300) score += 6;
  else score += 2;
  if (article.image && !article.image.includes("photo-1518770660439")) score += 8;
  if (Array.isArray(article.tags) && article.tags.length >= 3) score += 6;
  if (article.primary_company) score += 4;
  if (Array.isArray(article.products) && article.products.length > 0) score += 4;
  if (Array.isArray(article.technologies) && article.technologies.length > 0) score += 3;
  if (Array.isArray(article.ai_models) && article.ai_models.length > 0) score += 2;
  if (Array.isArray(article.countries) && article.countries.length > 0) score += 2;
  if (Array.isArray(article.internal_links) && article.internal_links.length >= 3) score += 10;
  else if (Array.isArray(article.internal_links) && article.internal_links.length > 0) score += 5;
  let entityTypes = 0;
  if (article.primary_company) entityTypes++;
  if (Array.isArray(article.products) && article.products.length > 0) entityTypes++;
  if (Array.isArray(article.technologies) && article.technologies.length > 0) entityTypes++;
  if (Array.isArray(article.ai_models) && article.ai_models.length > 0) entityTypes++;
  if (Array.isArray(article.countries) && article.countries.length > 0) entityTypes++;
  if (Array.isArray(article.os) && article.os.length > 0) entityTypes++;
  if (Array.isArray(article.chipsets) && article.chipsets.length > 0) entityTypes++;
  if (entityTypes >= 3) score += 8;
  else if (entityTypes >= 2) score += 5;
  else if (entityTypes >= 1) score += 2;
  if (article.seo_title && article.seo_title.length >= 40) score += 5;
  if (article.meta_description && article.meta_description.length >= 100) score += 5;
  if (article.focus_keyword) score += 3;
  score += 3;
  return Math.min(score, 100);
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
        headers: { "Authorization": "Bearer " + GROQ_API_KEY, "Content-Type": "application/json" },
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
      continue;
    }
  }
  throw lastErr;
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

async function main() {
  const result = {
    status: "ok",
    rss_items: 0,
    after_freshness: 0,
    after_tech_filter: 0,
    after_dedup: 0,
    ai_success: false,
    quality_score: 0,
    quality_passed: false,
    internal_links_count: 0,
    article_id: null,
    article_url: null,
    telegram_sent: false
  };

  const srcResult = await fetchSourceRSS();
  let rssItems = [];
  let usedSource = "";
  if (srcResult) {
    usedSource = srcResult.source.name;
    rssItems = srcResult.items;
  } else {
    try {
      const res = await this.helpers.httpRequest({ method: "GET", url: GNEWS_URL });
      xml = typeof res === "string" ? res : (res.data || res.body || "");
      if (!xml || xml.length < 100) {
        result.status = "empty_rss";
        return result;
      }
      usedSource = "Google News";
      rssItems = parseRSS(xml);
    } catch(e) {
      result.status = "rss_fetch_failed";
      result.error = e.message;
      return result;
    }
  }
  result.rss_items = rssItems.length;
  if (rssItems.length === 0) { result.status = "no_items"; return result; }

  const fresh = rssItems.filter(i => isFresh(i.pubDate, 24));
  result.after_freshness = fresh.length;
  if (fresh.length === 0) { result.status = "all_stale"; return result; }

  const tech = usedSource === "Google News" ? fresh.filter(i => isTech(i.title, i.desc)) : fresh;
  result.after_tech_filter = tech.length;
  if (tech.length === 0) { result.status = "no_tech"; return result; }

  let existingHashes = [];
  try {
    const hr = await ghGet("data/content_hashes.json");
    if (hr.content) existingHashes = b64decode(hr.content);
  } catch(e) {}

  const newItems = [];
  for (const item of tech) {
    const h = contentHash(item.title, item.contentEncoded || item.desc);
    if (!existingHashes.includes(h)) {
      newItems.push({ item, hash: h });
    }
  }
  result.after_dedup = newItems.length;
  if (newItems.length === 0) { result.status = "all_duplicates"; return result; }

  const { item: picked, hash } = newItems[0];
  const articleId = makeId();
  const sourceName = picked.source || usedSource;
  const techdoseLink = FRONTEND_URL + "/article.html?id=" + articleId;

  let existingIndex = [];
  try {
    const ir = await ghGet("data/articles/index.json");
    if (ir.content) existingIndex = b64decode(ir.content);
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
  let qualityScore = 0;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      ai = await aiGenerate(picked.title, fullArticleContent, sourceName);
      result.ai_success = true;
    } catch(e) {
      result.status = "ai_failed";
      result.ai_error = e.message;
      return result;
    }

    ai = editorialFormat(ai);

    const aiTitle = ai.title_ar || picked.title;
    const aiExcerpt = (ai.excerpt || ai.body || "").substring(0, 300);
    const aiBody = ai.body || "";
    const aiTg = ai.telegram_summary || ai.excerpt || "";
    const aiCategory = ai.category || "تكنولوجيا";
    const aiTags = Array.isArray(ai.tags) ? ai.tags : ["تكنولوجيا"];

    const seoTitle = ai.seo_title || aiTitle;
    const metaDesc = ai.meta_description || aiExcerpt.substring(0, 160);
    const seoSlug = ai.seo_slug || "";
    const focusKw = ai.focus_keyword || "";
    const secondaryKws = Array.isArray(ai.secondary_keywords) ? ai.secondary_keywords : [];

    const primaryCompany = ai.primary_company || null;
    const secondaryCompany = ai.secondary_company || null;
    const products = Array.isArray(ai.products) ? ai.products : [];
    const devices = Array.isArray(ai.devices) ? ai.devices : [];
    const technologies = Array.isArray(ai.technologies) ? ai.technologies : [];
    const aiModels = Array.isArray(ai.ai_models) ? ai.ai_models : [];
    const os = Array.isArray(ai.os) ? ai.os : [];
    const chipsets = Array.isArray(ai.chipsets) ? ai.chipsets : [];
    const browsers = Array.isArray(ai.browsers) ? ai.browsers : [];
    const cloud = Array.isArray(ai.cloud_platforms) ? ai.cloud_platforms : [];
    const languages = Array.isArray(ai.languages) ? ai.languages : [];
    const opensource = Array.isArray(ai.opensource_projects) ? ai.opensource_projects : [];
    const executives = Array.isArray(ai.executives) ? ai.executives : [];
    const markets = Array.isArray(ai.markets) ? ai.markets : [];
    const countries = Array.isArray(ai.countries) ? ai.countries : [];
    const people = Array.isArray(ai.people) ? ai.people : [];
    const stocks = Array.isArray(ai.stocks) ? ai.stocks : [];
    const investors = Array.isArray(ai.investors) ? ai.investors : [];
    const imageQueries = Array.isArray(ai.image_queries) ? ai.image_queries : [];

    const internalLinks = await generateInternalLinks({
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
    const imageUrl = imgResult.url;
    const imageMeta = imgResult.meta;
    result.image_source = imageMeta.source;
    result.image_provider = imageMeta.provider;
    result.image_query = imageMeta.query;
    result.image_type = imageMeta.image_type;
    result.image_confidence = imageMeta.confidence;
    result.original_candidates = imageMeta.original_candidates;
    result.pexels_tried = imageMeta.pexels_tried;
    result.unsplash_tried = imageMeta.unsplash_tried;

    const bodyHtml = "<p>" + aiBody.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>") + "</p>";

    const article = {
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

    qualityScore = calculateQuality({
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
    result.quality_score = qualityScore;

    if (qualityScore >= QUALITY_THRESHOLD) {
      break;
    }

    attempt++;
    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (qualityScore < QUALITY_THRESHOLD) {
    result.status = "quality_rejected";
    result.quality_passed = false;
    result.ai_retries = attempt;
    return result;
  }
  result.quality_passed = true;

  let index = [];
  try {
    const ir = await ghGet("data/articles/index.json");
    if (ir.content) index = b64decode(ir.content);
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
    links.unshift(picked.link);
    if (links.length > 5000) links.length = 5000;
    await ghPut("data/published_links.json", JSON.stringify(links, null, 2), "Link: " + aiTitle.substring(0,80));
  } catch(e) {}

  try {
    const tr = await ghGet("data/published_topics.json");
    let topics = tr.content ? b64decode(tr.content) : [];
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
}

const _r = await main();
return [{ json: _r }];
