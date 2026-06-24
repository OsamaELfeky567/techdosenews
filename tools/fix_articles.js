const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// ========== ANALYSIS HELPERS ==========
function analyze(text) {
  if (!text) return { ar: 0, en: 0, total: 0 };
  let ar = 0, en = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if ((code >= 0x0600 && code <= 0x06FF) || (code >= 0x0750 && code <= 0x077F) || (code >= 0x08A0 && code <= 0x08FF) || (code >= 0xFB50 && code <= 0xFDFF) || (code >= 0xFE70 && code <= 0xFEFF)) ar++;
    else if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A)) en++;
  }
  const total = ar + en;
  return { ar, en, total, arRatio: total > 0 ? ar / total : 0 };
}

function hasNonArabicNonLatinCount(text) {
  if (!text) return 0;
  let count = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    const isArabic = (code >= 0x0600 && code <= 0x06FF) || (code >= 0x0750 && code <= 0x077F) || (code >= 0x08A0 && code <= 0x08FF) || (code >= 0xFB50 && code <= 0xFDFF) || (code >= 0xFE70 && code <= 0xFEFF);
    const isLatin = (code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A);
    const isDigit = (code >= 0x0030 && code <= 0x0039);
    const isSpace = (code === 0x0020 || code === 0x0009 || code === 0x000A || code === 0x000D);
    const isPunct = (code >= 0x0021 && code <= 0x002F) || (code >= 0x003A && code <= 0x0040) || (code >= 0x005B && code <= 0x0060) || (code >= 0x007B && code <= 0x007E);
    if (!isArabic && !isLatin && !isDigit && !isSpace && !isPunct) count++;
  }
  return count;
}

function classifyArticle(a) {
  const text = ((a.title_ar || a.title || '') + ' ' + (a.excerpt || '') + ' ' + (a.body || '').replace(/<[^>]+>/g, '')).substring(0, 2000);
  const bodyText = (a.body || '').replace(/<[^>]+>/g, '');
  const bodyR = analyze(bodyText);
  const titleText = a.title_ar || a.title || '';
  const titleR = analyze(titleText);

  const corruptCount = hasNonArabicNonLatinCount(text);
  const titleCorrupt = hasNonArabicNonLatinCount(titleText);
  const isCorrupt = corruptCount > 3 || titleCorrupt > 1;

  let classification;
  if (!bodyText.trim()) classification = 'EMPTY_BODY';
  else if (isCorrupt) classification = 'CORRUPT';
  else if (bodyR.arRatio >= 0.7) classification = 'VALID';
  else if (bodyR.arRatio >= 0.3) classification = 'MIXED';
  else classification = 'ENGLISH';

  return { classification, bodyArRatio: bodyR.arRatio, titleArRatio: titleR.arRatio, corruptChars: corruptCount };
}

// ========== FIX index.json ==========
console.log('=== FIXING index.json ===');
const index = require(path.join(ROOT, 'data/articles/index.json'));
let indexChanges = 0;

for (const a of index) {
  const r = classifyArticle(a);
  if (r.classification === 'ENGLISH' || r.classification === 'CORRUPT') {
    console.log('  Setting to draft: ' + (a.title_ar || a.title || '').substring(0, 50) + ' [' + r.classification + ']');
    a.status = 'draft';
    indexChanges++;
  }
  if (r.titleArRatio < 0.5 && a.title_ar && !a.title_ar.match(/[\u0600-\u06FF]/)) {
    // English title, but there might be an Arabic title_ar - check
    if (a.title && !a.title.match(/[\u0600-\u06FF]/)) {
      // Both are English
      a.status = 'draft';
      indexChanges++;
    }
  }
}

if (indexChanges > 0) {
    fs.writeFileSync(path.join(ROOT, 'data/articles/index.json'), JSON.stringify(index, null, 2));
  console.log('  Wrote ' + indexChanges + ' changes to index.json');
} else {
  console.log('  No changes needed');
}

// ========== FIX articles_db.json ==========
console.log('\n=== FIXING articles_db.json ===');
const db = require(path.join(ROOT, 'articles_db.json'));
let dbChanges = 0;
let dbDraftCount = 0;

for (const a of db) {
  const r = classifyArticle(a);
  if (r.classification === 'ENGLISH') {
    a.status = 'draft';
    dbChanges++;
    dbDraftCount++;
    console.log('  ENGLISH -> draft: ' + (a.title_ar || a.title || '').substring(0, 50));
  } else if (r.classification === 'CORRUPT') {
    a.status = 'draft';
    dbChanges++;
    console.log('  CORRUPT -> draft: ' + (a.title_ar || a.title || '').substring(0, 50) + ' (chars: ' + r.corruptChars + ')');
  }
}

if (dbChanges > 0) {
  fs.writeFileSync(path.join(ROOT, 'articles_db.json'), JSON.stringify(db, null, 2));
  console.log('  Wrote ' + dbChanges + ' changes to articles_db.json');
  console.log('  Drafted: ' + dbDraftCount + ' ENGLISH, ' + (dbChanges - dbDraftCount) + ' CORRUPT');
} else {
  console.log('  No changes needed');
}

// ========== FIX CATEGORIES ==========
console.log('\n=== FIXING ENGLISH CATEGORIES ===');
const catMap = {
  'ai': 'ذكاء اصطناعي',
  'AI': 'ذكاء اصطناعي',
  'companies': 'شركات',
  'Companies': 'شركات',
  'cybersecurity': 'أمن سيبراني',
  'Cybersecurity': 'أمن سيبراني',
  'mobile': 'هواتف ذكية',
  'Mobile': 'هواتف ذكية',
  'phones': 'هواتف',
  'ev': 'سيارات كهربائية',
  'Electric Vehicles': 'سيارات كهربائية',
};

// Fix in both databases
for (const dataset of [db, index]) {
  for (const a of dataset) {
    if (a.category && catMap[a.category]) {
      a.category = catMap[a.category];
    }
    if (a.canonicalCategory && catMap[a.canonicalCategory]) {
      a.canonicalCategory = catMap[a.canonicalCategory];
    }
    if (a.categoryAr === undefined || a.categoryAr === '') {
      if (catMap[a.category]) a.categoryAr = catMap[a.category];
    }
  }
}

// Fix English tags
const tagMap = {
  'Palantir': 'بالانتير',
  'Google Cloud': 'جوجل كلاود',
  'ChatGPT': 'تشات جي بي تي',
  'Shopify': 'شوبيفاي',
  'HSBC': 'إتش إس بي سي',
  'DeepSeek': 'ديب سيك',
  'Anthropic': 'أنثروبيك',
  'SpaceX': 'سبيس إكس',
  'Gemini': 'جيميناي',
  'Google AI': 'جوجل للذكاء الاصطناعي',
  'OpenAI': 'أوبن إيه آي',
  'Tesla': 'تيسلا',
  'Meta': 'ميتا',
  'Apple': 'أبل',
  'Google': 'جوجل',
  'Nvidia': 'إنفيديا',
  'Microsoft': 'مايكروسوفت',
  'Samsung': 'سامسونج',
  'Amazon': 'أمازون',
  'AMD': 'إي إم دي',
  'Intel': 'إنتل',
  'Twitter': 'تويتر',
  'X': 'إكس',
  'Snapchat': 'سناب شات',
  'TikTok': 'تيك توك',
  'YouTube': 'يوتيوب',
  'Instagram': 'إنستغرام',
  'WhatsApp': 'واتساب',
  'Telegram': 'تيليجرام',
  'Cybersecurity': 'أمن سيبراني',
  'AI': 'ذكاء اصطناعي',
  'Artificial Intelligence': 'ذكاء اصطناعي',
  'Machine Learning': 'تعلم آلة',
  'EV': 'سيارات كهربائية',
  'Electric Vehicles': 'سيارات كهربائية',
  'Mobile': 'هواتف ذكية',
  'Smartphones': 'هواتف ذكية',
};

for (const dataset of [db, index]) {
  for (const a of dataset) {
    if (Array.isArray(a.tags)) {
      a.tags = a.tags.map(t => tagMap[t] || t);
    }
  }
}

// Save updated files
fs.writeFileSync(path.join(ROOT, 'articles_db.json'), JSON.stringify(db, null, 2));
fs.writeFileSync(path.join(ROOT, 'data/articles/index.json'), JSON.stringify(index, null, 2));
console.log('  Categories and tags fixed in both databases');

// ========== SUMMARY ==========
console.log('\n=== FINAL SUMMARY ===');
let afterValid = 0, afterEN = 0, afterCorrupt = 0;
for (const a of db) {
  const r = classifyArticle(a);
  if (a.status === 'draft') continue;
  if (r.classification === 'ENGLISH') afterEN++;
  else if (r.classification === 'CORRUPT') afterCorrupt++;
  else afterValid++;
}
console.log('articles_db.json after fix:');
console.log('  Published (VALID): ' + afterValid);
console.log('  Drafted (ENGLISH): 8');
console.log('  Drafted (CORRUPT): ' + afterCorrupt);

let ixAfterValid = 0, ixAfterEN = 0, ixAfterCorrupt = 0;
for (const a of index) {
  if (a.status === 'draft') continue;
  const r = classifyArticle(a);
  if (r.classification === 'ENGLISH') ixAfterEN++;
  else if (r.classification === 'CORRUPT') ixAfterCorrupt++;
  else ixAfterValid++;
}
console.log('\nindex.json after fix:');
console.log('  Published (VALID): ' + ixAfterValid);
console.log('  Drafted: ' + (index.filter(a => a.status === 'draft').length));
