const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'articles_db.json');
const CAT_PATH = path.join(__dirname, '..', 'data', 'categories.json');

const CATEGORIES = JSON.parse(fs.readFileSync(CAT_PATH, 'utf8'));
const CAT_BY_NAME = {};
CATEGORIES.forEach(c => { CAT_BY_NAME[c.name] = c; });

const LEGACY = {
  'تكنولوجيا': 'companies', 'تقنية': 'companies',
  'شركات': 'companies', 'شركات التقنية': 'companies', 'تطوير': 'companies',
  'business-tech': 'companies', 'startups': 'companies',
  'programming': 'companies', 'software': 'companies',
  'cloud': 'companies', 'Big-Tech': 'companies', 'big-tech': 'companies',
  'BigTech': 'companies', 'Business': 'companies', 'Cloud': 'companies',
  'Startups': 'companies', 'business': 'companies',
  'شركات ناشئة': 'companies', 'هاردوير': 'companies',
  'hardware': 'companies', 'Hardware': 'companies', 'برمجة': 'companies',
  'مصر والتقنية': 'companies', 'إلكترونيات': 'companies',
  'AI': 'ai', 'AI_ar': 'ai', 'Science': 'ai', 'science': 'ai',
  'space': 'ai', 'فضاء': 'ai', 'علوم': 'ai',
  'ذكاء اصطناعي': 'ai', 'الذكاء الاصطناعي': 'ai',
  'ai': 'ai',
  'هواتف ذكية': 'phones', 'موبايل': 'phones', 'mobile': 'phones',
  'Mobile': 'phones', 'gaming': 'phones', 'Gaming': 'phones',
  'ألعاب': 'phones', 'reviews': 'phones', 'مراجعات': 'phones',
  'consumer': 'phones',
  'سيارات كهربائية': 'ev', 'Electric Vehicles': 'ev',
  'EV': 'ev', 'ev': 'ev',
  'security': 'cybersecurity', 'Security': 'cybersecurity',
  'الأمن السيبراني': 'cybersecurity'
};

function normalize(cat) {
  if (!cat) return { id: 'companies', name: 'شركات' };
  if (CATEGORIES.some(c => c.id === cat)) {
    const c = CATEGORIES.find(x => x.id === cat);
    return { id: c.id, name: c.name };
  }
  if (CAT_BY_NAME[cat]) return { id: CAT_BY_NAME[cat].id, name: cat };
  const mapped = LEGACY[cat];
  if (mapped) {
    const c = CATEGORIES.find(x => x.id === mapped);
    return { id: c.id, name: c.name };
  }
  const c = CATEGORIES.find(x => x.id === 'companies');
  return { id: 'companies', name: c.name };
}

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
let changed = 0;

db.forEach(a => {
  const n = normalize(a.category);
  const oldKey = a.categoryKey;
  const oldAr = a.categoryAr;
  if (a.canonicalCategory !== n.id) { a.canonicalCategory = n.id; changed++; }
  if (a.categoryAr !== n.name) { a.categoryAr = n.name; changed++; }
});

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
console.log(`Normalized ${changed} field(s) across ${db.length} articles`);
console.log('Canonical counts:');
const counts = {};
db.forEach(a => { const k = a.canonicalCategory || 'none'; counts[k] = (counts[k]||0)+1; });
Object.entries(counts).sort().forEach(([k, v]) => {
  const c = CATEGORIES.find(x => x.id === k);
  console.log(`  ${k} (${c ? c.name : '?'}): ${v}`);
});
