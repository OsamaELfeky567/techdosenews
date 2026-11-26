// Branded 1200x630 Open Graph card per article (our own design, no third-party images).
// Rendered with headless Chrome; if Chrome is missing or fails, callers fall back to the article image.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const CHROME = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'];

function findChrome() {
  for (const c of CHROME) { const r = spawnSync(c, ['--version'], { encoding: 'utf8' }); if (r.status === 0) return c; }
  return null;
}
let chrome;

export function cardHtml(title, category0, bgData) {
  const category = String(category0 || "").split("|")[0].trim().slice(0, 28);
  const t = String(title).trim();
  const size = t.length > 90 ? 52 : t.length > 60 ? 60 : 68;
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
html{width:1200px;height:630px;overflow:hidden}body{position:absolute;left:0;top:0;width:1200px;height:630px;background:#0f1724;font-family:'Cairo','Noto Sans Arabic','Noto Naskh Arabic',sans-serif;color:#fff;position:relative;overflow:hidden}
.bg{position:absolute;inset:0;background:#0f1724 ${bgData ? `url(${bgData}) center/cover no-repeat` : 'linear-gradient(135deg,#0f1724 0%,#1a2332 100%)'}}
.tint{position:absolute;inset:0;background:${bgData ? 'rgba(15,23,36,.16)' : 'transparent'}}
.scrim{position:absolute;left:0;right:0;bottom:0;height:46%;background:${bgData ? 'linear-gradient(to top,rgba(10,15,25,.62),rgba(10,15,25,0))' : 'transparent'}}
.in{text-shadow:0 2px 10px rgba(0,0,0,.85),0 0 3px rgba(0,0,0,.7)}
.bar{position:absolute;right:0;top:0;bottom:0;width:16px;background:#dc2626}
.glow{position:absolute;left:-180px;bottom:-220px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(220,38,38,.35),transparent 70%)}
.in{position:absolute;inset:0;padding:56px 80px 48px 72px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center}
.logo{font-size:44px;font-weight:900;letter-spacing:1px}.logo b{color:#60a5fa}
.cat{background:#dc2626;color:#fff;font-weight:700;font-size:28px;padding:6px 22px;border-radius:999px}
.title{flex:1;display:flex;align-items:center;font-weight:900;font-size:${size}px;line-height:1.45}
.foot{display:flex;justify-content:space-between;color:#94a3b8;font-size:28px;font-weight:700}
</style></head><body><div class="bg"></div><div class="tint"></div><div class="scrim"></div><div class="bar"></div><div class="glow"></div><div class="in">
<div class="top"><div class="logo">TD <b>بالعربي</b></div>${category ? `<div class="cat">${esc(category)}</div>` : '<div></div>'}</div>
<div class="title"><div>${esc(t)}</div></div>
<div class="foot"><span>أخبار التقنية والذكاء الاصطناعي</span><span dir="ltr">td-arabi.com</span></div>
</div></body></html>`;
}

// returns true when out exists (already or newly rendered)
function fetchBg(url) {
  if (!url || !/^https?:\/\//.test(url)) return null;
  const r = spawnSync('curl', ['-sL', '-m', '20', '-A', 'Mozilla/5.0', '-e', 'https://td-arabi.com/', '-w', '%{http_code} %{content_type}', '-o', '-', url], { maxBuffer: 30 * 1024 * 1024 });
  if (r.status !== 0 || !r.stdout) return null;
  const buf = r.stdout; const tail = buf.slice(-80).toString('latin1');
  const m = tail.match(/(\d{3}) (image\/[a-z+.-]+)\s*$/i);
  if (!m || m[1] !== '200') return null;
  const body = buf.slice(0, buf.length - m[0].length);
  if (body.length < 5000 || /svg|gif/i.test(m[2])) return null;
  return 'data:' + m[2] + ';base64,' + body.toString('base64');
}

// imgUrl: the article's real image (source or licensed stock); it becomes the card background under a light brand tint.
export function ensureCard(out, title, category, imgUrl) {
  if (fs.existsSync(out) && fs.statSync(out).size > 5000) return true;
  const bgData = fetchBg(imgUrl);
  if (chrome === undefined) chrome = findChrome();
  if (!chrome) return false;
  const tmpPng = path.join(os.tmpdir(), 'ogcard-' + process.pid + '-' + Date.now() + '.png');
  const tmp = path.join(os.tmpdir(), 'ogcard-' + process.pid + '-' + Date.now() + '.html');
  fs.writeFileSync(tmp, cardHtml(title, category, bgData));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const r = spawnSync(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--window-size=1200,630', '--virtual-time-budget=6000', '--screenshot=' + tmpPng, 'file://' + tmp], { encoding: 'utf8', timeout: 60000 });
  fs.rmSync(tmp, { force: true });
  let ok = r.status === 0 && fs.existsSync(tmpPng) && fs.statSync(tmpPng).size > 5000;
  if (ok) { const c = spawnSync('convert', [tmpPng, '-quality', '85', '-sampling-factor', '4:2:0', out], { timeout: 30000 }); ok = c.status === 0 && fs.existsSync(out) && fs.statSync(out).size > 5000; }
  fs.rmSync(tmpPng, { force: true });
  if (!ok) fs.rmSync(out, { force: true });
  return ok;
}
