const CATEGORY_MAP = {
  ai:'الذكاء الاصطناعي',cybersecurity:'أمن سيبراني',
  companies:'شركات',phones:'هواتف ذكية',ev:'سيارات كهربائية',
  security:'أمن سيبراني',business:'شركات',startups:'شركات',
  bigtech:'شركات',software:'شركات',cloud:'شركات',
  hardware:'شركات',consumer:'هواتف ذكية',gaming:'هواتف ذكية',
  mobile:'هواتف ذكية',AI:'الذكاء الاصطناعي',AI_ar:'الذكاء الاصطناعي',
  'Big-Tech':'شركات','big-tech':'شركات',BigTech:'شركات',
  Security:'أمن سيبراني',Startups:'شركات',
  Mobile:'هواتف ذكية',Hardware:'شركات',Gaming:'هواتف ذكية',
  Science:'الذكاء الاصطناعي',Business:'شركات',Cloud:'شركات',
  programming:'شركات','business-tech':'شركات',
  'تكنولوجيا':'شركات','تقنية':'شركات',
  'Electric Vehicles':'سيارات كهربائية',
  'شركات تقنية':'شركات','الأمن السيبراني':'أمن سيبراني',
  'تطوير':'شركات','برمجة':'شركات',
  EV:'سيارات كهربائية',ev:'سيارات كهربائية',
  space:'الذكاء الاصطناعي',science:'الذكاء الاصطناعي',
  reviews:'هواتف ذكية','هاردوير':'شركات',
  'فضاء':'الذكاء الاصطناعي','علوم':'الذكاء الاصطناعي',
  'شركات ناشئة':'شركات','مراجعات':'هواتف ذكية',ألعاب:'هواتف ذكية',
  'هواتف ذكية':'هواتف ذكية','موبايل':'هواتف ذكية',
  'ذكاء اصطناعي':'الذكاء الاصطناعي','سيارات كهربائية':'سيارات كهربائية'
};

const TAG_MAP = {
  'تكنولوجيا':'companies','تقنية':'companies','ذكاء اصطناعي':'ai',
  'أمن سيبراني':'cybersecurity','أمان':'cybersecurity',
  'هواتف':'phones','mobile':'phones','موبايل':'phones',
  'أعمال':'companies','business':'companies','شركات':'companies',
  'startups':'companies','برمجيات':'companies','software':'companies',
  'برمجة':'companies','سحابة':'companies','cloud':'companies',
  'عتاد':'companies','hardware':'companies','هاردوير':'companies',
  'سيارات':'ev','EV':'ev','سيارات كهربائية':'ev',
  'ai':'ai','AI':'ai','security':'cybersecurity',
  'cybersecurity':'cybersecurity','gaming':'phones','ألعاب':'phones',
  'science':'ai','علوم':'ai','روبوتات':'ai','robotics':'ai',
  'فضاء':'ai','space':'ai','bigtech':'companies',
  'big-tech':'companies','BigTech':'companies','Big-Tech':'companies',
  'أبحاث':'ai','research':'ai','business-tech':'companies',
  'programming':'companies','reviews':'phones','مراجعات':'phones'
};

const CANONICAL = ['ai', 'cybersecurity', 'companies', 'phones', 'ev'];
const LABELS = { ai:'الذكاء الاصطناعي', cybersecurity:'أمن سيبراني', companies:'شركات', phones:'هواتف ذكية', ev:'سيارات كهربائية' };
const TARGETS = { ai:{min:30,good:50}, cybersecurity:{min:15,good:25}, companies:{min:15,good:25}, phones:{min:15,good:25}, ev:{min:15,good:25} };

const FEEDS = {
  ai: [
    { name:'Google News Arabic AI', url:'https://news.google.com/rss/search?q=%D8%A7%D9%84%D8%B0%D9%83%D8%A7%D8%A1+%D8%A7%D9%84%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A&hl=ar&gl=SA&ceid=SA:ar', lang:'عربي' },
    { name:'VentureBeat AI', url:'https://venturebeat.com/category/ai/feed', lang:'إنجليزي' },
    { name:'The Decoder', url:'https://the-decoder.com/feed/', lang:'إنجليزي' }
  ],
  cybersecurity: [
    { name:'The Hacker News', url:'https://feeds.feedburner.com/TheHackersNews', lang:'إنجليزي' },
    { name:'BleepingComputer', url:'https://www.bleepingcomputer.com/feed/', lang:'إنجليزي' },
    { name:'SecurityWeek', url:'https://www.securityweek.com/feed/', lang:'إنجليزي' },
    { name:'Google News Arabic Cybersecurity', url:'https://news.google.com/rss/search?q=%D8%A3%D9%85%D9%86+%D8%B3%D9%8A%D8%A8%D8%B1%D8%A7%D9%86%D9%8A&hl=ar&gl=SA&ceid=SA:ar', lang:'عربي' }
  ],
  companies: [
    { name:'TechCrunch', url:'https://techcrunch.com/feed/', lang:'إنجليزي' },
    { name:'Wired Business', url:'https://www.wired.com/feed/business/rss', lang:'إنجليزي' }
  ],
  phones: [
    { name:'GSMArena', url:'https://www.gsmarena.com/rss-news-reviews.php3', lang:'إنجليزي' },
    { name:'Android Authority', url:'https://www.androidauthority.com/feed/', lang:'إنجليزي' },
    { name:'9to5Google', url:'https://9to5google.com/feed/', lang:'إنجليزي' }
  ],
  ev: [
    { name:'Electrek', url:'https://electrek.co/feed/', lang:'إنجليزي' },
    { name:'InsideEVs', url:'https://insideevs.com/feed/', lang:'إنجليزي' },
    { name:'CleanTechnica', url:'https://cleantechnica.com/feed/', lang:'إنجليزي' }
  ]
};

const EXISTING_SOURCES = {
  ai: ['Google News RSS'],
  cybersecurity: [],
  companies: ['TechCrunch', 'The Verge'],
  phones: ['Android Authority', '9to5Google'],
  ev: []
};

function mapArticle(article) {
  const cat = (article.category || '').trim();
  const text = ((article.title_ar||article.title||'') + ' ' + (article.excerpt||'')).toLowerCase();

  // Stage 1: Content-based detection (most accurate for n8n articles)
  if (/chatgpt|openai|gemini|ai[^a-z]|llm|claude|grok|deep learn|machine learn|intelligence|neural|gpt|o1|o3|sora|transformer|large language/.test(text)) return 'ai';
  if (/hack|breach|malware|ransomware|vulnerability|cyber|zero.day|phish|exploit|patch|firewall|encrypt/.test(text)) return 'cybersecurity';
  if (/iphone|galaxy|pixel|smartphone|android|mobile|ios|ipad|tablet|foldable|snapdragon/.test(text)) return 'phones';
  if (/tesla|electric vehicle|ev[^a-z]|charging|battery ev|autonomous|self.driving|lithium|evgo|rivian|lucid|nio/.test(text)) return 'ev';
  if (/startup|funding|ipo|acquisition|ceo|revenue|profit|stock|market|investor|saas|cloud|enterprise/.test(text)) return 'companies';

  // Stage 2: Canonical category (direct match)
  if (CANONICAL.includes(cat)) return cat;

  // Stage 3: Tags
  if (article.tags && Array.isArray(article.tags)) {
    for (const tag of article.tags) {
      const mapped = TAG_MAP[tag];
      if (mapped && CANONICAL.includes(mapped)) return mapped;
    }
  }

  // Stage 4: Legacy CATEGORY_MAP
  if (CATEGORY_MAP[cat]) {
    const entry = Object.entries(CATEGORY_MAP).find(([k]) => k === cat);
    const canon = CANONICAL.find(c => LABELS[c] === entry[1]);
    if (canon) return canon;
  }

  // Stage 5: Fallback to companies
  return 'companies';
}

const idx = require('../data/articles/index.json');
const now = Date.now();
const day7 = now - 7 * 86400000;
const day30 = now - 30 * 86400000;

const counts7 = {}; const counts30 = {}; const countsAll = {};
CANONICAL.forEach(c => { counts7[c]=0; counts30[c]=0; countsAll[c]=0; });

const dayMap = {}; const sourceMap = {};
CANONICAL.forEach(c => { dayMap[c]={}; sourceMap[c]={}; });

idx.forEach(a => {
  const c = mapArticle(a);
  const ts = a.publishedAt ? new Date(a.publishedAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
  countsAll[c] = (countsAll[c]||0) + 1;
  if (ts >= day30) counts30[c] = (counts30[c]||0) + 1;
  if (ts >= day7) {
    counts7[c] = (counts7[c]||0) + 1;
    const d = new Date(ts).toISOString().substring(0,10);
    dayMap[c][d] = (dayMap[c][d]||0) + 1;
    const src = a.source || a.source_name || 'unknown';
    sourceMap[c][src] = (sourceMap[c][src]||0) + 1;
  }
});

console.log('');
console.log('  ╔══════════════════════════════════════════════════════╗');
console.log('  ║   RSS COVERAGE INTELLIGENCE — Tech Dose News        ║');
console.log('  ╚══════════════════════════════════════════════════════╝');
console.log(`  ${new Date().toISOString().substring(0,10)}  |  إجمالي المقالات: ${idx.length}`);
console.log('');

const W = 15;
console.log('  '.padEnd(2) + 'الفئة'.padEnd(W) + 'آخر 7 أيام'.padEnd(14) + 'آخر 30 يوم'.padEnd(14) + 'الإجمالي'.padEnd(12) + 'الحالة'.padEnd(16) + 'التقييم');
console.log('  ' + '─'.repeat(78));

CANONICAL.forEach(c => {
  const c7 = counts7[c] || 0;
  const c30 = counts30[c] || 0;
  const ca = countsAll[c] || 0;
  const target = TARGETS[c];
  let status, assessment;
  if (c7 >= target.good) { status = '✅'; assessment = 'ممتاز'; }
  else if (c7 >= target.min) { status = '⚠️'; assessment = 'مقبول'; }
  else if (c7 > 0) { status = '🔴'; assessment = 'ضعيف'; }
  else { status = '🚫'; assessment = 'معدوم'; }
  console.log(`  ${LABELS[c].padEnd(W)} ${String(c7).padEnd(12)} ${String(c30).padEnd(12)} ${String(ca).padEnd(10)} ${status.padEnd(14)} ${assessment}`);
});

console.log('');
console.log('  ─── Daily Trend (Last 7 Days) ───');
const days = [...new Set(Object.values(dayMap).flatMap(Object.keys))].sort();
if (days.length) {
  const header = '  '.padEnd(12) + days.map(d => d.substring(5)).join('  ');
  console.log(header);
  CANONICAL.forEach(c => {
    const vals = days.map(d => String(dayMap[c][d] || '-').padStart(3)).join('  ');
    console.log(`  ${LABELS[c].padEnd(12)}${vals}`);
  });
}

console.log('');
console.log('  ─── Coverage Analysis ───');
CANONICAL.forEach(c => {
  const c7 = counts7[c] || 0;
  const target = TARGETS[c];
  if (c7 < target.min) {
    const gap = target.min - c7;
    console.log(`  🔴 ${LABELS[c]}: تحتاج ${gap}+ مقالة/أسبوع`);
    console.log(`     المصادر المقترحة:`);
    (FEEDS[c]||[]).forEach(f => {
      const exists = (EXISTING_SOURCES[c]||[]).some(s => f.name.includes(s));
      console.log(`     ${exists ? '📡' : '➕'} ${f.name} (${f.lang})`);
    });
  } else if (c7 < target.good) {
    console.log(`  ⚠️ ${LABELS[c]}: مقبولة لكن يمكن تحسينها`);
  } else {
    const top = Object.entries(sourceMap[c]).sort((a,b) => b[1]-a[1]).slice(0,3);
    console.log(`  ✅ ${LABELS[c]}: تغطية ممتازة`);
    if (top.length) console.log(`     أهم المصادر: ${top.map(([s,n]) => `${s} (${n})`).join(', ')}`);
  }
});

console.log('');
console.log('  ─── Weakest Sections ───');
const ranked = CANONICAL.map(c => ({ cat: c, count: counts7[c] || 0, target: TARGETS[c].min }))
  .sort((a,b) => a.count - b.count);
ranked.forEach((r, i) => {
  const icon = r.count === 0 ? '🚫' : r.count < r.target ? '🔴' : '⚠️';
  console.log(`  ${i+1}. ${icon} ${LABELS[r.cat]}: ${r.count}/أسبوع (المطلوب: ${r.target})`);
});

console.log('');
console.log('  ─── Summary Recommendation ───');
const weak = ranked.filter(r => r.count < r.target);
if (weak.length === 0) {
  console.log('  ✅ جميع الأقسام تحقق المستهدف. ركز على التنوع وجودة المحتوى.');
} else {
  console.log(`  📋 يجب إضافة ${weak.length} مصدر RSS للأقسام الضعيفة:`);
  weak.forEach(r => {
    console.log(`     ${LABELS[r.cat]}: ${FEEDS[r.cat].map(f => f.name).join('، ')}`);
  });
}
console.log('');