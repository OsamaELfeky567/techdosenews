import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ARTICLES_DIR = resolve(import.meta.dirname, '../data/articles');
const INDEX_PATH = resolve(ARTICLES_DIR, 'index.json');

const CAT_TO_TAG = {
  AI: 'ai', Companies: 'companies', Cybersecurity: 'cybersecurity',
  Mobile: 'mobile', 'Electric Vehicles': 'ev',
  'ذكاء اصطناعي': 'ai', 'شركات تقنية': 'companies',
  'الأمن السيبراني': 'cybersecurity', 'تطوير': 'software',
  'سيارات كهربائية': 'ev', 'تقنية': 'technology'
};

function normalize(article) {
  let category = (article.category || 'تكنولوجيا').trim();
  if (category === '?????' || category === '???') category = 'تكنولوجيا';
  let tags = Array.isArray(article.tags) ? article.tags : [];
  if (tags.length === 0 && CAT_TO_TAG[category]) tags = [CAT_TO_TAG[category]];
  if (tags.length === 0) tags = ['technology'];
  return {
    id: article.id || '',
    title: article.title || article.title_ar || '',
    excerpt: (article.excerpt || '').trim(),
    body: article.body || '',
    category,
    tags,
    image: article.image || '',
    date: article.date || article.created_at || article.publishedAt || new Date().toISOString(),
    readTime: article.readTime || '',
    views: article.views || '0',
    hasEgyptImpact: article.hasEgyptImpact || false,
    egypt: article.egypt || '',
    source: article.source || article.source_name || 'Tech Dose News',
    link: (article.link && article.link !== article.techdose_link) ? article.link : (article.source_link || ''),
    techdose_link: article.techdose_link || '',
    videoUrl: article.videoUrl || '',
    status: article.status || 'published',
    featured: false
  };
}

const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
const seenIds = new Set();
const articles = [];

for (const file of files) {
  try {
    let raw = readFileSync(resolve(ARTICLES_DIR, file), 'utf-8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const data = JSON.parse(raw);
    const id = data.id || data.title || file;
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    articles.push(normalize(data));
  } catch (e) {
    console.error(`Skipping ${file}: ${e.message}`);
  }
}

articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

writeFileSync(INDEX_PATH, JSON.stringify(articles, null, 2), 'utf-8');
console.log(`Built index.json: ${articles.length} articles from ${files.length} files (${files.length - articles.length} duplicates skipped)`);
