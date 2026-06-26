import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const TAG_RULES = [
  { keywords: ['جوجل', 'Google', 'غوغل'], tag: 'Google' },
  { keywords: ['آبل', 'Apple', 'أبل', 'ايفون', 'iPhone', 'iPad'], tag: 'Apple' },
  { keywords: ['مايكروسوفت', 'Microsoft', 'ونداوز', 'Windows'], tag: 'Microsoft' },
  { keywords: ['ميتا', 'فيسبوك', 'Facebook', 'Meta', 'انستغرام', 'Instagram', 'واتساب', 'WhatsApp'], tag: 'Meta' },
  { keywords: ['أوبن', 'ChatGPT', 'OpenAI', 'o1', 'o3'], tag: 'OpenAI' },
  { keywords: ['إنفيديا', 'NVIDIA', 'nvidia'], tag: 'Nvidia' },
  { keywords: ['أمازون', 'Amazon', 'AWS'], tag: 'Amazon' },
  { keywords: ['تسلا', 'Tesla'], tag: 'Tesla' },
  { keywords: ['جيميني', 'Gemini', 'جيميناي'], tag: 'Gemini' },
  { keywords: ['كلود', 'Claude', 'أنثروبيك', 'Anthropic'], tag: 'Claude' },
  { keywords: ['بالنتير', 'Palantir', 'palantir'], tag: 'Palantir' },
  { keywords: ['تويتر', 'إكس', 'تيك توك', 'TikTok', 'لينكدإن', 'LinkedIn', 'X'], tag: 'وسائل تواصل' },
  { keywords: ['شوبيفاي', 'Shopify'], tag: 'Shopify' },
  { keywords: ['سامسونج', 'Samsung', 'Galaxy'], tag: 'Samsung' },
  { keywords: ['هواوي', 'Huawei'], tag: 'Huawei' },
  { keywords: ['أوبو', 'OnePlus', 'شاومي', 'Xiaomi', 'OPPO'], tag: 'هواتف' },
  { keywords: ['ذكاء اصطناعي', 'AI', 'الذكاء الاصطناعي', 'LLM', 'نموذج لغوي', 'تعلم آلة', 'machine learning', 'deep learning'], tag: 'ذكاء اصطناعي' },
  { keywords: ['أمن', 'اختراق', 'سيبراني', 'هاكر', 'hack', 'cyber', 'vulnerability', 'ثغرة', 'فيروس', 'malware', 'ransomware', 'هجوم'], tag: 'أمن سيبراني' },
  { keywords: ['هاتف', 'موبايل', 'جوال', 'أندرويد', 'android', 'ios'], tag: 'هواتف' },
  { keywords: ['سيارة', 'سيارات', 'كهربائية', 'EV', 'سايبرتراك', 'rivian', 'nio'], tag: 'سيارات كهربائية' },
  { keywords: ['ألعاب', 'gaming', 'بلايستيشن', 'PlayStation', 'نينتندو', 'Xbox', 'Nintendo', 'Steam'], tag: 'ألعاب' },
  { keywords: ['برمجيات', 'software', 'تطبيق', 'تطوير'], tag: 'برمجيات' },
  { keywords: ['شبكة', 'شبكات', '5G', 'إنترنت', 'واي فاي', 'WiFi', 'اتصال'], tag: 'شبكات' },
  { keywords: ['روبوت', 'droïde', 'أتمتة', 'automation', 'droid'], tag: 'روبوتات' },
  { keywords: ['طائرة', 'فضاء', 'ناسا', 'NASA', 'SpaceX', 'فالكون', 'صاروخ', 'قمر'], tag: 'فضاء' },
  { keywords: ['فيديو', 'يوتيوب', 'YouTube'], tag: 'فيديو' },
  { keywords: ['عملة', 'بتكوين', 'crypto', 'بلوكتشين', 'blockchain', 'NFT'], tag: 'بلوكتشين' },
  { keywords: ['طاقة', 'شمسي', 'طاقة متجددة', 'مناخ', 'بيئة'], tag: 'طاقة' },
  { keywords: ['صحة', 'طب', 'طبي', 'جيني', 'genes', 'DNA'], tag: 'صحة' },
  { keywords: ['معالج', 'GPU', 'رقاقة', 'chip', 'شريحة', 'semiconductor', 'معالجات'], tag: 'معالجات' },
];

function autoGenerateTags(title_ar) {
  const text = (title_ar || '').toLowerCase();
  const tags = new Set();
  for (const rule of TAG_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        tags.add(rule.tag);
        break;
      }
    }
  }
  if (tags.size === 0) tags.add('تقنية');
  return Array.from(tags);
}

function migrateArticle(a) {
  delete a.category;
  delete a.canonicalCategory;
  delete a.categoryAr;
  delete a.categoryKey;
  delete a.catKey;
  const title = a.title_ar || a.title || '';
  if (!a.tags || !Array.isArray(a.tags) || a.tags.length === 0) {
    a.tags = autoGenerateTags(title);
  }
  return a;
}

// Migrate index.json
const idxPath = join(root, 'data', 'articles', 'index.json');
const dbPath = join(root, 'articles_db.json');

const index = JSON.parse(readFileSync(idxPath, 'utf8'));
const migrated = index.map(migrateArticle);
writeFileSync(idxPath, JSON.stringify(migrated, null, 2), 'utf8');
console.log(`index.json: ${index.length} articles migrated`);

const db = JSON.parse(readFileSync(dbPath, 'utf8'));
const migratedDb = db.map(migrateArticle);
writeFileSync(dbPath, JSON.stringify(migratedDb, null, 2), 'utf8');
console.log(`articles_db.json: ${db.length} articles migrated`);

// Summary - count auto-generated tags
let autoTagged = 0;
let hadTags = 0;
for (const a of migrated) {
  const orig = index.find(o => o.id === a.id);
  if (orig && (!orig.tags || !Array.isArray(orig.tags) || orig.tags.length === 0)) autoTagged++;
  else hadTags++;
}
console.log(`\nArticles that already had tags: ${hadTags}`);
console.log(`Articles auto-tagged from title: ${autoTagged}`);
