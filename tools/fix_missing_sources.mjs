import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const files = [
  { path: join(root, 'data', 'articles', 'index.json'), label: 'index.json' },
  { path: join(root, 'articles_db.json'), label: 'articles_db.json' },
];

for (const { path, label } of files) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  let fixed = 0;
  for (const article of data) {
    const hasUrl = article.url || article.link || article.source_link;
    if (!hasUrl) {
      article.source_url = '';
      fixed++;
    }
  }
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`${label}: fixed ${fixed} articles missing source URLs`);
}
