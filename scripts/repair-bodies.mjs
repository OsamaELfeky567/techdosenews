// One-off/maintenance: clean Markdown/scrape leaks from stored article bodies (data/articles/index.json).
import fs from 'fs';
import { cleanBody, hasMarkdownLeak } from './lib/clean-body.mjs';
const f = 'data/articles/index.json';
const a = JSON.parse(fs.readFileSync(f, 'utf8'));
let changed = 0, left = 0;
for (const x of a) { const c = cleanBody(cleanBody(x.body)); if (c !== x.body) { x.body = c; x.modified = x.modified; changed++; } if (hasMarkdownLeak(c)) left++; }
fs.writeFileSync(f, JSON.stringify(a, null, 2) + '\n');
console.log({ changed, left, total: a.length });
