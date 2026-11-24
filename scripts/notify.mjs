// After the commit is pushed: post to Telegram and ping IndexNow for the NEW url only.
import fs from 'fs';
const E = process.env;
const r = JSON.parse(fs.readFileSync('.run/result.json', 'utf8'));
if (r.status !== 'published' || !r.published) { console.log('nothing to notify:', r.status); process.exit(0); }
const p = r.published;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

if (E.TELEGRAM_BOT_TOKEN && E.TELEGRAM_CHAT_ID) {
  const text = `<b>${esc(p.title)}</b>\n\n${esc(p.telegram_summary)}\n\n🔗 ${p.url}`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${E.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: E.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: false }) });
    const j = await res.json();
    console.log('telegram:', res.ok ? 'sent' : 'failed ' + JSON.stringify(j).slice(0, 200));
  } catch (e) { console.log('telegram error', e.message); }
} else console.log('telegram skipped (secrets not set)');

try {
  const res = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: 'td-arabi.com', key: '30b3490761e54946bcce8a978d5d218c', keyLocation: 'https://td-arabi.com/30b3490761e54946bcce8a978d5d218c.txt', urlList: [p.url] }) });
  console.log('indexnow:', res.status);
} catch (e) { console.log('indexnow error', e.message); }
