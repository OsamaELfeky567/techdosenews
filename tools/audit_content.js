const fs = require('fs');

function analyze(text) {
  if (!text) return { ar: 0, en: 0, total: 0 };
  let ar = 0, en = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if ((code >= 0x0600 && code <= 0x06FF) || (code >= 0x0750 && code <= 0x077F) || (code >= 0x08A0 && code <= 0x08FF) || (code >= 0xFB50 && code <= 0xFDFF) || (code >= 0xFE70 && code <= 0xFEFF)) ar++;
    else if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A)) en++;
  }
  const total = ar + en;
  return { ar, en, total, arRatio: total > 0 ? ar / total : 0, enRatio: total > 0 ? en / total : 0 };
}

function hasNonArabicNonLatin(text) {
  if (!text) return false;
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

function refinedClassify(a) {
  const text = ((a.title_ar || a.title || '') + ' ' + (a.excerpt || '') + ' ' + (a.body || '').replace(/<[^>]+>/g, '')).substring(0, 2000);
  const bodyText = (a.body || '').replace(/<[^>]+>/g, '');
  const bodyR = analyze(bodyText);
  const titleText = a.title_ar || a.title || '';
  const titleR = analyze(titleText);
  const excerptText = a.excerpt || '';
  const excerptR = analyze(excerptText);

  // Check for corruptions (Cyrillic, Chinese, etc.)
  const corruptCount = hasNonArabicNonLatin(text);
  const titleCorrupt = hasNonArabicNonLatin(titleText);
  const isCorrupt = corruptCount > 3 || titleCorrupt > 1;

  let classification;
  if (bodyR.arRatio >= 0.7 && excerptR.arRatio >= 0.5) classification = 'VALID';
  else if (bodyR.arRatio >= 0.3) classification = 'MIXED';
  else classification = 'ENGLISH';

  if (isCorrupt) classification = 'CORRUPT';
  if (!bodyText.trim()) classification = 'EMPTY_BODY';

  return {
    classification,
    bodyArRatio: bodyR.arRatio,
    titleArRatio: titleR.arRatio,
    excerptArRatio: excerptR.arRatio,
    otherChars: corruptCount
  };
}

// ========== MAIN ==========
const db = require('../articles_db.json');
const index = require('../data/articles/index.json');

console.log('=== articles_db.json ===');
console.log('Total:', db.length);

const stats = { VALID: 0, MIXED: 0, ENGLISH: 0, CORRUPT: 0, EMPTY_BODY: 0 };
const english = [], mixed = [], corrupt = [], empty = [];

for (const a of db) {
  const r = refinedClassify(a);
  if (r.classification === 'ENGLISH') { stats.ENGLISH++; english.push(a); }
  else if (r.classification === 'MIXED') { stats.MIXED++; if (mixed.length < 20) mixed.push(a); }
  else if (r.classification === 'CORRUPT') { stats.CORRUPT++; corrupt.push(a); }
  else if (r.classification === 'EMPTY_BODY') { stats.EMPTY_BODY++; empty.push(a); }
  else stats.VALID++;
}
console.log('VALID:', stats.VALID, 'MIXED:', stats.MIXED, 'ENGLISH:', stats.ENGLISH, 'CORRUPT:', stats.CORRUPT, 'EMPTY_BODY:', stats.EMPTY_BODY);

console.log('\nENGLISH articles (' + english.length + '):');
english.slice(0, 15).forEach(a => {
  const t = (a.title_ar || a.title || '').substring(0, 60);
  const b = (a.body || '').replace(/<[^>]+>/g, '').substring(0, 80);
  console.log('  ' + a.id + ' | ' + t);
  console.log('    body: ' + b);
});

console.log('\nCORRUPT articles (' + corrupt.length + '):');
corrupt.forEach(a => {
  const t = (a.title_ar || a.title || '').substring(0, 60);
  console.log('  ' + a.id + ' | ' + t);
});

console.log('\nEMPTY_BODY articles (' + empty.length + '):');
empty.forEach(a => {
  const t = (a.title_ar || a.title || '').substring(0, 60);
  console.log('  ' + a.id + ' | ' + t);
});

console.log('\n=== data/articles/index.json ===');
console.log('Total:', index.length);

const ixStats = { VALID: 0, MIXED: 0, ENGLISH: 0, CORRUPT: 0, EMPTY_BODY: 0 };
for (const a of index) {
  const r = refinedClassify(a);
  const t = (a.title_ar || a.title || '').substring(0, 60);
  console.log('  [' + r.classification + '] arRatio=' + r.bodyArRatio.toFixed(2) + ' ' + t);
  if (r.classification === 'ENGLISH') ixStats.ENGLISH++;
  else if (r.classification === 'MIXED') ixStats.MIXED++;
  else if (r.classification === 'CORRUPT') ixStats.CORRUPT++;
  else if (r.classification === 'EMPTY_BODY') ixStats.EMPTY_BODY++;
  else ixStats.VALID++;
}
console.log('VALID:', ixStats.VALID, 'MIXED:', ixStats.MIXED, 'ENGLISH:', ixStats.ENGLISH, 'CORRUPT:', ixStats.CORRUPT, 'EMPTY_BODY:', ixStats.EMPTY_BODY);
