import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const DUP_IDS = ['1779831983701', '1779829218818', '1779826586228'];

function dedup(filePath, label) {
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  const seen = new Set();
  const deduped = [];
  let removed = 0;
  for (const item of data) {
    const idStr = String(item.id);
    if (seen.has(idStr) && DUP_IDS.includes(idStr)) {
      removed++;
      continue;
    }
    seen.add(idStr);
    deduped.push(item);
  }
  writeFileSync(filePath, JSON.stringify(deduped, null, 2), 'utf8');
  console.log(`${label}: ${data.length} → ${deduped.length} (removed ${removed} duplicates)`);
}

dedup(join(root, 'data', 'articles', 'index.json'), 'index.json');
console.log('Done.');
