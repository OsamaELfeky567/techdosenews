const http = require('http');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YzYwN2ZlMC0xMDE4LTQwYzAtOGZiNy1mMThmMmMyZWEyZTYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZDYyNGE1MGMtNWRiYS00YTE3LWEyYzAtYjFmZDMzN2RkMWFmIiwiaWF0IjoxNzc5MTM2NzAyfQ.x3FzQQXVM7ZYKwTkxCjEe2YZBv9knDhLA4KjgYmPAJs';
const API = 'http://localhost:5678/api/v1';
function get(url) { return new Promise((r,j) => { http.get(url, { headers: { 'X-N8N-API-KEY': key } }, (res) => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{if(res.statusCode<300) r(JSON.parse(d)); else j(d.slice(0,500));}); }); }); }
function put(url, data) { return new Promise((resolve, reject) => { const s = JSON.stringify(data); const req = http.request(url, { method: 'PUT', headers: { 'X-N8N-API-KEY': key, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(s) } }, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => { if (res.statusCode < 300) resolve(JSON.parse(d)); else reject(new Error(res.statusCode + ': ' + d.slice(0,500))); }); }); req.on('error', reject); req.write(s); req.end(); }); }

const PEXELS_SEMANTIC = `
const PEXELS_API_KEY = "MqAg1Kmwu0Z4tNmBninhIhUAcame5IkO3l4yYWOHGC77SlcqrudW1D1p";

// ── ENTITY PRIORITY: Company > Product > Phone > Car > AI > Topic ──
const ENTITY_RULES = [
  { kw: ["جوجل","Google","غوغل","ألفابت","Alphabet","بيكسل","Pixel"], q: "Google office headquarters", cat: "company" },
  { kw: ["أبل","Apple","آبل","تيم كوك","Tim Cook","iPad","MacBook","iMac","macOS","vision pro","أبل واتش","watch"], q: "Apple product device", cat: "company" },
  { kw: ["مايكروسوفت","Microsoft","ونداوز","Azure","Copilot","ساتيا","Satya","ناديلا","Office"], q: "Microsoft office building", cat: "company" },
  { kw: ["ميتا","فيسبوك","Facebook","Meta","انستغرام","زوكربيرغ","Zuckerberg","ثريدز","Threads","واتساب","WhatsApp"], q: "Meta social media app", cat: "company" },
  { kw: ["أمازون","Amazon","AWS","باعوص","Bezos","Alexa","Kindle","Prime"], q: "Amazon logistics technology", cat: "company" },
  { kw: ["إنفيديا","NVIDIA","جنسن","Jensen","هوانغ","Huang","RTX","GPU","GeForce","CUDA","Tensor"], q: "NVIDIA graphics processor chip", cat: "company" },
  { kw: ["أوبن إيه آي","OpenAI","سام ألتمان","Sam Altman","اوبن اي"], q: "OpenAI artificial intelligence lab", cat: "company" },
  { kw: ["أنثروبك","Anthropic","كلود","Claude","داريو","Dario","أمودي"], q: "AI artificial intelligence safety", cat: "company" },
  { kw: ["ديب مايند","DeepMind","جيميني","Gemini","ديميس","Demis","حسابس"], q: "artificial intelligence research", cat: "company" },
  { kw: ["تسلا","Tesla","إيلون","Elon","ماسك","Musk","سايبرتراك","Cybertruck","فول","FSD"], q: "Tesla electric vehicle car", cat: "company" },
  { kw: ["تيك توك","TikTok","تيكتوك","بايت دانس"], q: "TikTok social media app", cat: "company" },
  { kw: ["تويتر","Twitter","إكس","X.com","لينكدإن","LinkedIn"], q: "social media app smartphone", cat: "company" },
  { kw: ["سامسونج","Samsung","غالاكسي","Galaxy"], q: "Samsung smartphone technology", cat: "company" },
  { kw: ["هواوي","Huawei"], q: "Huawei technology company", cat: "company" },
  { kw: ["شاومي","Xiaomi","مي","Redmi","ريدمي"], q: "Xiaomi smartphone device", cat: "company" },
  { kw: ["إنتل","Intel","معالج","Processor","رقاقة","Chip","شريحة","semiconductor"], q: "Intel computer processor chip", cat: "company" },
  { kw: ["أي إم دي","AMD"], q: "AMD processor chip technology", cat: "company" },
  { kw: ["آي بي إم","IBM"], q: "IBM cloud technology", cat: "company" },
  { kw: ["أوراكل","Oracle"], q: "Oracle database cloud", cat: "company" },
  { kw: ["أوبر","Uber","كريم","Careem"], q: "Uber ride sharing app", cat: "company" },
  { kw: ["نتفليكس","Netflix"], q: "Netflix streaming entertainment", cat: "company" },
  { kw: ["سبوتيفاي","Spotify"], q: "Spotify music streaming", cat: "company" },
  { kw: ["تيلغرام","Telegram","تلغرام"], q: "Telegram messaging app", cat: "company" },
  { kw: ["باي بال","PayPal"], q: "PayPal online payment", cat: "company" },
  { kw: ["شوبيفاي","Shopify"], q: "ecommerce online store", cat: "company" },
  { kw: ["سناب","Snapchat"], q: "Snapchat social media", cat: "company" },
  { kw: ["ديدي","DiDi"], q: "ride sharing app", cat: "company" },
  { kw: ["سوفت بنك","SoftBank","ماسايوشي","Son"], q: "SoftBank investment technology", cat: "company" },
  { kw: ["تويوتا","Toyota","هوندا","Honda","نيسان","Nissan","هيونداي","Hyundai"], q: "Toyota car manufacturing", cat: "company" },
  { kw: ["فولكس","Volkswagen","فولكسفاجن","BMW","بي إم","مرسيدس","Mercedes"], q: "German car manufacturing", cat: "company" },
  { kw: ["سبيس إكس","SpaceX","سبايس إكس","فالكون","Falcon","ستارلينك","Starlink"], q: "SpaceX rocket launch space", cat: "company" },

  // ── PRODUCTS ──
  { kw: ["آيفون","iPhone","ايفون","آي فون"], q: "iPhone smartphone product", cat: "product" },
  { kw: ["أندرويد","Android"], q: "Android phone technology", cat: "product" },
  { kw: ["تشات جي بي تي","ChatGPT","GPT-4","GPT-5","GPT-4o","شات جي بي تي"], q: "ChatGPT AI chatbot conversation", cat: "product" },
  { kw: ["بلايستيشن","PlayStation","PS5","PS4"], q: "PlayStation gaming console", cat: "product" },
  { kw: ["إكس بوكس","Xbox"], q: "Xbox gaming console", cat: "product" },
  { kw: ["نينتندو","Nintendo","سويتش","Switch"], q: "Nintendo Switch gaming", cat: "product" },
  { kw: ["ويندوز","Windows"], q: "Windows laptop software", cat: "product" },
  { kw: ["يوتيوب","YouTube"], q: "YouTube video streaming platform", cat: "product" },
  { kw: ["دوبليو","Waze","ويز"], q: "navigation map GPS", cat: "product" },
  { kw: ["طائرة بدون طيار","Drone","درون","مسيرة","طائرة مسيرة"], q: "drone flying camera", cat: "product" },
  { kw: ["روبوت","Robot","روبوتات","droïde","أتمتة"], q: "robot automation machinery", cat: "product" },
  { kw: ["واقع افتراضي","VR","virtual reality","واقع معزز","AR","augmented reality","ميتافيرس","metaverse"], q: "virtual reality headset", cat: "product" },
  { kw: ["أبل فيجن","Vision Pro","فيجن برو"], q: "Apple Vision Pro headset", cat: "product" },
  { kw: ["ساعة ذكية","smartwatch","wearable","سامسونج واتش","Apple Watch"], q: "smartwatch wearable technology", cat: "product" },

  // ── PHONES ──
  { kw: ["هاتف","موبايل","جوال","محمول","هواتف","هاتف ذكي","جوالات"], q: "smartphone mobile device", cat: "phone" },
  { kw: ["أندرويد","Android","أندرويد"], q: "Android smartphone", cat: "phone" },
  { kw: ["آيفون","iPhone","ايفون"], q: "iPhone smartphone", cat: "phone" },
  { kw: ["غالاكسي","Galaxy","سامسونج","Samsung","نوت","Note","إس"], q: "Samsung Galaxy smartphone", cat: "phone" },

  // ── CARS ──
  { kw: ["سيارة","سيارات","كهربائية","EV","مركبة","مركبات"], q: "electric car vehicle technology", cat: "car" },
  { kw: ["تسلا","Tesla","سايبرتراك","موديل"], q: "Tesla electric vehicle", cat: "car" },
  { kw: ["قيادة ذاتية","self-driving","autonomous","ذاتية القيادة"], q: "autonomous self-driving car", cat: "car" },
  { kw: ["بطارية","battery","بطاريات","شحن","شواحن","مدى","range"], q: "electric car battery charging", cat: "car" },

  // ── AI ──
  { kw: ["ذكاء اصطناعي","الذكاء الاصطناعي","AI","artificial intelligence","machine learning","تعلم آلة","تعلم عميق","deep learning","شبكة عصبية","neural network","نموذج لغوي","LLM","language model"], q: "artificial intelligence technology", cat: "ai" },
  { kw: ["تشات جي بي تي","ChatGPT","جي بي تي","GPT"], q: "artificial intelligence brain", cat: "ai" },
  { kw: ["أوبن إيه آي","OpenAI","كلود","Claude","جيميني","Gemini"], q: "AI technology innovation", cat: "ai" },
  { kw: ["توليد","generate","ميدجورني","Midjourney","دال إي","DALL-E","stable diffusion","ستابل"], q: "AI generated art creative", cat: "ai" },

  // ── TOPICS ──
  { kw: ["أمن","اختراق","سيبراني","هاكر","hack","cyber","ثغرة","vulnerability","فيروس","malware","ransomware","هجوم سيبراني","فدية","قرصنة","قراصنة","تهكير"], q: "cybersecurity hacking protection", cat: "topic" },
  { kw: ["بلوكتشين","blockchain","عملة رقمية","crypto","بتكوين","Bitcoin","إيثيريوم","Ethereum","NFT","تعدين","cryptocurrency"], q: "blockchain cryptocurrency technology", cat: "topic" },
  { kw: ["سحابة","cloud computing","AWS","Azure","حوسبة سحابية"], q: "cloud computing data center", cat: "topic" },
  { kw: ["ألعاب","gaming","game","ألعاب فيديو","console"], q: "gaming computer technology", cat: "topic" },
  { kw: ["صحة","طب","طبي","جيني","genes","DNA","صحي","دواء","علاج","لقاح","مستشفى"], q: "health medical technology", cat: "topic" },
  { kw: ["طاقة","شمسي","طاقة متجددة","مناخ","بيئة","استدامة","طاقة نظيفة"], q: "renewable energy solar", cat: "topic" },
  { kw: ["بيانات","data","privacy","خصوصية","معلومات"], q: "big data analytics technology", cat: "topic" },
  { kw: ["إنترنت","internet","web","ويب","اتصالات","broadband"], q: "internet network connection", cat: "topic" },
  { kw: ["فضاء","فضائي","صاروخ","rocket","قمر","satellite","فوياجر","ناسا","NASA"], q: "space rocket exploration", cat: "topic" },
  { kw: ["5g","6g","شبكة الجيل"], q: "5G network technology", cat: "topic" },
  { kw: ["تجارة","تسوق","shopping","بيع","متجر","تجارة إلكترونية"], q: "ecommerce online shopping", cat: "topic" },
  { kw: ["تمويل","استثمار","funding","invest","اكتتاب","IPO","سهم","stock"], q: "finance investment stock market", cat: "topic" },
  { kw: ["تطبيق","app","تطبيقات","تطبيق جوال"], q: "mobile application smartphone", cat: "topic" },
  { kw: ["برمج","software","code","كود","تطوير","developer","مبرمج","مطور","برمجة","git","github"], q: "computer programming code", cat: "topic" },
  { kw: ["كاميرا","camera","تصوير","photo","صورة","فوتوغرافي"], q: "camera lens photography", cat: "topic" },
  { kw: ["جامعة","university","بحث","research","دراسة","academic","باحث","scientist","علم"], q: "science laboratory research", cat: "topic" },
  { kw: ["تكنولوجيا مالية","fintech","الخدمات المالية"], q: "financial technology fintech", cat: "topic" },
  { kw: ["تعليم","education","edtech","e-learning","تعلم إلكتروني"], q: "online education learning", cat: "topic" },
  { kw: ["مركز بيانات","data center","سيرفر","server","خادم"], q: "data center server room", cat: "topic" },
  { kw: ["تسويق","digital marketing","إعلان","advertising","إعلانات"], q: "digital marketing advertising", cat: "topic" },
  { kw: ["إنترنت الأشياء","IoT","smart home","منزل ذكي"], q: "smart home IoT device", cat: "topic" },
  { kw: ["شاشة","display","screen","عرض","monitor","OLED","LCD"], q: "computer display monitor", cat: "topic" },
];

// ── CATEGORY-SPECIFIC FALLBACK POOLS ──
const CAT_FALLBACKS = {
  company: [
    "https://images.pexels.com/photos/1181275/pexels-photo-1181275.jpeg?w=800",
    "https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?w=800",
    "https://images.pexels.com/photos/1089440/pexels-photo-1089440.jpeg?w=800",
    "https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?w=800",
    "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?w=800",
    "https://images.pexels.com/photos/210990/pexels-photo-210990.jpeg?w=800",
    "https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg?w=800",
    "https://images.pexels.com/photos/860379/pexels-photo-860379.jpeg?w=800",
    "https://images.pexels.com/photos/106344/pexels-photo-106344.jpeg?w=800",
    "https://images.pexels.com/photos/355948/pexels-photo-355948.jpeg?w=800",
  ],
  product: [
    "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?w=800",
    "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?w=800",
    "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?w=800",
    "https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=800",
    "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?w=800",
    "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?w=800",
    "https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?w=800",
    "https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?w=800",
  ],
  phone: [
    "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?w=800",
    "https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=800",
    "https://images.pexels.com/photos/40739/pexels-photo-40739.jpeg?w=800",
    "https://images.pexels.com/photos/50987/pexels-photo-50987.jpeg?w=800",
    "https://images.pexels.com/photos/163100/pexels-photo-163100.jpeg?w=800",
    "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=800",
    "https://images.pexels.com/photos/341523/pexels-photo-341523.jpeg?w=800",
    "https://images.pexels.com/photos/2235075/pexels-photo-2235075.jpeg?w=800",
  ],
  car: [
    "https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?w=800",
    "https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?w=800",
    "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?w=800",
    "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?w=800",
    "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?w=800",
    "https://images.pexels.com/photos/1104762/pexels-photo-1104762.jpeg?w=800",
    "https://images.pexels.com/photos/714432/pexels-photo-714432.jpeg?w=800",
    "https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg?w=800",
  ],
  ai: [
    "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?w=800",
    "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=800",
    "https://images.pexels.com/photos/373076/pexels-photo-373076.jpeg?w=800",
    "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?w=800",
    "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?w=800",
    "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?w=800",
    "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?w=800",
    "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?w=800",
  ],
};

const DEFAULT_FALLBACKS = [
  "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?w=800",
  "https://images.pexels.com/photos/1181275/pexels-photo-1181275.jpeg?w=800",
  "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?w=800",
  "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?w=800",
  "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?w=800",
  "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?w=800",
  "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?w=800",
  "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?w=800",
  "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?w=800",
  "https://images.pexels.com/photos/373076/pexels-photo-373076.jpeg?w=800",
  "https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?w=800",
  "https://images.pexels.com/photos/1089440/pexels-photo-1089440.jpeg?w=800",
  "https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?w=800",
  "https://images.pexels.com/photos/210990/pexels-photo-210990.jpeg?w=800",
  "https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg?w=800",
  "https://images.pexels.com/photos/860379/pexels-photo-860379.jpeg?w=800",
  "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?w=800",
  "https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=800",
  "https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?w=800",
  "https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?w=800",
  "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?w=800",
  "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?w=800",
  "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?w=800",
  "https://images.pexels.com/photos/1104762/pexels-photo-1104762.jpeg?w=800",
  "https://images.pexels.com/photos/714432/pexels-photo-714432.jpeg?w=800",
  "https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg?w=800",
  "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=800",
  "https://images.pexels.com/photos/40739/pexels-photo-40739.jpeg?w=800",
  "https://images.pexels.com/photos/50987/pexels-photo-50987.jpeg?w=800",
  "https://images.pexels.com/photos/163100/pexels-photo-163100.jpeg?w=800",
  "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=800",
  "https://images.pexels.com/photos/341523/pexels-photo-341523.jpeg?w=800",
  "https://images.pexels.com/photos/2235075/pexels-photo-2235075.jpeg?w=800",
  "https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?w=800",
  "https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?w=800",
  "https://images.pexels.com/photos/106344/pexels-photo-106344.jpeg?w=800",
  "https://images.pexels.com/photos/355948/pexels-photo-355948.jpeg?w=800",
  "https://images.pexels.com/photos/1005141/pexels-photo-1005141.jpeg?w=800",
  "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?w=800",
  "https://images.pexels.com/photos/325111/pexels-photo-325111.jpeg?w=800",
  "https://images.pexels.com/photos/6478234/pexels-photo-6478234.jpeg?w=800",
  "https://images.pexels.com/photos/8471882/pexels-photo-8471882.jpeg?w=800",
  "https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg?w=800",
  "https://images.pexels.com/photos/9826370/pexels-photo-9826370.jpeg?w=800",
  "https://images.pexels.com/photos/35105427/pexels-photo-35105427.jpeg?auto=compress",
  "https://images.pexels.com/photos/35105431/pexels-photo-35105431.jpeg?auto=compress",
  "https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?w=800",
  "https://images.pexels.com/photos/207580/pexels-photo-207580.jpeg?w=800",
  "https://images.pexels.com/photos/204611/pexels-photo-204611.jpeg?w=800",
  "https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?w=800",
];

function findEntity(titleAr, tags, title) {
  const text = ((titleAr || "") + " " + (tags || []).join(" ") + " " + (title || "")).toLowerCase();
  for (const rule of ENTITY_RULES) {
    for (const kw of rule.kw) {
      if (text.includes(kw.toLowerCase())) return rule;
    }
  }
  return null;
}

// Generate multiple candidate queries: entity, tag/topic, general
function generateQueries(titleAr, tags, title, entity) {
  const queries = [];
  if (entity) queries.push(entity.q);
  if (tags && tags.length > 0) {
    const tagQuery = tags[0];
    const knownTags = { "الذكاء الاصطناعي": "artificial intelligence", "تكنولوجيا": "technology", "أمن": "cybersecurity", "AI": "artificial intelligence", "جوجل": "Google", "أمازون": "Amazon", "ألعاب": "gaming", "تسلا": "Tesla", "iPhone": "iPhone", "أندرويد": "Android", "بلوكتشين": "blockchain", "عملات رقمية": "cryptocurrency", "فضاء": "space", "صحة": "medical" };
    const mapped = knownTags[tagQuery] || tagQuery + " technology";
    if (mapped !== queries[queries.length-1]) queries.push(mapped);
  }
  queries.push("technology innovation future");
  return queries;
}

// Time-based photo position for dedup (changes every 4h)
function pickPhotoIndex(photosLength) {
  return Math.floor((Date.now() / 14400000)) % Math.min(photosLength, 5);
}

function pickFromPool(pool) {
  return pool[Math.floor((Date.now() / 60000)) % pool.length];
}

const input = $input.first().json;

if (input.status === "no_article") {
  return [{ json: input }];
}

const titleAr = input.title_ar || "";
const tags = input.tags || [];
const title = input.title || "";

let imageUrl = "";
let pexelsAlt = "";
const entity = findEntity(titleAr, tags, title);
const queries = generateQueries(titleAr, tags, title, entity);

// Try queries one by one — each as a separate Pexels API call
for (const q of queries) {
  if (imageUrl) break;
  try {
    const res = await this.helpers.httpRequest({
      method: "GET",
      url: "https://api.pexels.com/v1/search?query=" + encodeURIComponent(q) + "&per_page=5&orientation=landscape",
      headers: { "Authorization": PEXELS_API_KEY }
    });
    if (res.photos && res.photos.length > 0) {
      const idx = pickPhotoIndex(res.photos.length);
      const photo = res.photos[idx];
      imageUrl = photo.src.large || photo.src.medium || photo.src.original;
      pexelsAlt = photo.alt || q;
    }
  } catch(e) {
    // try next query
  }
}

// Fallback to category pool or default
if (!imageUrl) {
  if (entity && CAT_FALLBACKS[entity.cat] && CAT_FALLBACKS[entity.cat].length > 0) {
    imageUrl = pickFromPool(CAT_FALLBACKS[entity.cat]);
  } else {
    imageUrl = pickFromPool(DEFAULT_FALLBACKS);
  }
}

// Calculate SEO score
let score = 0;
if (titleAr.length >= 50 && titleAr.length <= 60) score += 25;
else if (titleAr.length >= 40 && titleAr.length <= 70) score += 15;
else score += 5;

const excerpt = input.excerpt || "";
if (excerpt.length >= 140 && excerpt.length <= 160) score += 20;
else if (excerpt.length >= 100 && excerpt.length <= 200) score += 12;
else score += 5;

const body = input.body || "";
const wordCount = body.split(/\\s+/).length;
if (wordCount >= 400) score += 20;
else if (wordCount >= 250) score += 12;
else score += 5;

if (imageUrl) score += 15;
if (tags.length >= 3) score += 10;
if (tags.length === 5) score += 2;
if (input.link) score += 5;
score += 5;

const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";

return [{
  json: {
    ...input,
    image_url: imageUrl,
    pexels_alt: pexelsAlt,
    entity_category: entity ? entity.cat : "default",
    seo_score: score,
    seo_grade: grade,
  }
}];
`;

async function main() {
  console.log('Fetching workflow...');
  const wf = await get(API + '/workflows/9YULEXSG9gEtoqr2');
  console.log('Workflow: ' + wf.name + ' v' + wf.versionId);

  const pexNode = wf.nodes.find(n => n.name === 'Pexels + SEO');
  if (!pexNode) { console.log('ERROR: Pexels node not found'); process.exit(1); }

  pexNode.parameters.jsCode = PEXELS_SEMANTIC;

  const update = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
    staticData: wf.staticData || null
  };
  const result = await put(API + '/workflows/9YULEXSG9gEtoqr2', update);
  console.log('Pushed! Version: ' + result.versionId);

  // Verify
  const verify = await get(API + '/workflows/9YULEXSG9gEtoqr2');
  const vPex = verify.nodes.find(n => n.name === 'Pexels + SEO').parameters.jsCode;
  console.log('Multi-query: ' + vPex.includes('generateQueries'));
  console.log('Entity rules: ' + (vPex.match(/kw:/g) || []).length + ' entities');
  console.log('Time-based dedup: ' + vPex.includes('pickPhotoIndex'));
  console.log('Category fallbacks: 5 pools');
  console.log('Default fallbacks: ' + (vPex.match(/pexels-photo/g) || []).length + ' refs');
}
main().catch(e => console.log('FATAL: ' + e.message));
