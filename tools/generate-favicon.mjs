import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const html = `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:32px;height:32px;background:#0F172A;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;overflow:hidden}
span{font-size:18px;font-weight:900;color:#3B82F6}
</style></head><body><span>TD</span></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 32, height: 32 } });
await page.setContent(html, { waitUntil: 'networkidle' });

const buf = await page.screenshot({ type: 'png' });
writeFileSync(join(root, 'favicon.png'), buf);

// For ICO, we need a different format. Write the PNG as favicon.ico too
// (modern browsers accept PNG as favicon.ico content)
writeFileSync(join(root, 'favicon.ico'), buf);

await browser.close();
console.log('Favicons created: favicon.png (32x32), favicon.ico (32x32)');
