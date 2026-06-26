import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'img', 'og-image.png');

const html = `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0F172A;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Cairo',sans-serif;overflow:hidden}
.logo{font-size:80px;font-weight:900;color:#fff;margin-bottom:16px;letter-spacing:-2px}
.logo span{color:#3B82F6}
.tagline{font-size:32px;color:#94A3B8;font-weight:500}
.bar{width:80px;height:4px;background:#3B82F6;border-radius:2px;margin:24px 0}
.sub{font-size:20px;color:#64748B;font-weight:400}
</style></head>
<body>
<div class="logo">TD <span>بالعربي</span></div>
<div class="bar"></div>
<div class="tagline">أخبار التقنية والذكاء الاصطناعي</div>
<div class="sub">td-arabi.com</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: outPath, fullPage: false });
await browser.close();
console.log(`OG image saved: ${outPath}`);
