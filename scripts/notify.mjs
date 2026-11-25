// After the commit is pushed: wait until the new page is LIVE, then Telegram (photo + caption), IndexNow.
// Hook for Facebook: see the postFacebook() stub at the bottom (enabled only when secrets exist).
import fs from 'fs';
const E = process.env;
const r = JSON.parse(fs.readFileSync('.run/result.json', 'utf8'));
if (r.status !== 'published' || !r.published) { console.log('nothing to notify:', r.status); process.exit(0); }
const p = r.published;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 1. wait for GitHub Pages (poll every 20 s, up to ~6 min). Page must be 200 and contain its own canonical.
async function waitLive() {
  const tries = +(E.LIVE_TRIES || 18);
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(p.url + '?cb=' + Date.now(), { headers: { 'User-Agent': 'td-arabi-notify' } });
      if (res.ok && (await res.text()).includes(`rel="canonical" href="${p.url}"`)) { console.log('live after', i * 20, 's'); return true; }
    } catch {}
    await sleep(20000);
  }
  return false;
}
const live = await waitLive();
if (!live) console.log('WARNING: page not live after wait; skipping Telegram/IndexNow so no dead link is shared');

if (live && E.TELEGRAM_BOT_TOKEN && E.TELEGRAM_CHAT_ID && E.TELEGRAM_CHAT_ID.startsWith('@tdarabi')) {
  let caption = `<b>${esc(p.title)}</b>\n\n${esc(p.telegram_summary)}\n\n🔗 ${p.url}`;
  if (caption.length > 1000) caption = `<b>${esc(p.title)}</b>\n\n🔗 ${p.url}`;
  const api = m => `https://api.telegram.org/bot${E.TELEGRAM_BOT_TOKEN}/${m}`;
  const post = async (m, body) => { const res = await fetch(api(m), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: E.TELEGRAM_CHAT_ID, parse_mode: 'HTML', ...body }) }); return [res.ok, await res.json().catch(() => ({}))]; };
  try {
    let ok = false;
    if (p.image && !/og-image\.png$/.test(p.image)) {
      let j; [ok, j] = await post('sendPhoto', { photo: p.image, caption });
      console.log('telegram photo:', ok ? 'sent' : 'failed ' + JSON.stringify(j).slice(0, 200));
    }
    if (!ok) { const [ok2, j2] = await post('sendMessage', { text: `<b>${esc(p.title)}</b>\n\n${esc(p.telegram_summary)}\n\n🔗 ${p.url}`, disable_web_page_preview: false }); console.log('telegram text:', ok2 ? 'sent' : 'failed ' + JSON.stringify(j2).slice(0, 200)); }
  } catch (e) { console.log('telegram error', e.message); }
} else if (live) console.log('telegram skipped (secrets not set)');

if (live) {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: 'td-arabi.com', key: '30b3490761e54946bcce8a978d5d218c', keyLocation: 'https://td-arabi.com/30b3490761e54946bcce8a978d5d218c.txt', urlList: [p.url] }) });
    console.log('indexnow:', res.status);
  } catch (e) { console.log('indexnow error', e.message); }
}


// Web push (OneSignal): one notification per new article to all subscribers. Needs ONESIGNAL_APP_ID (public id) + ONESIGNAL_API_KEY (secret).
if (live && E.ONESIGNAL_APP_ID && E.ONESIGNAL_API_KEY) {
  try {
    const body = { app_id: E.ONESIGNAL_APP_ID, target_channel: 'push', included_segments: ['Subscribed Users'],
      headings: { en: p.title, ar: p.title }, contents: { en: p.telegram_summary.slice(0, 180), ar: p.telegram_summary.slice(0, 180) },
      url: p.url, chrome_web_icon: 'https://td-arabi.com/favicon.png', ttl: 43200 };
    if (p.image && !/og-image\.png$/.test(p.image)) body.chrome_web_image = p.image;
    const res = await fetch('https://api.onesignal.com/notifications?c=push', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: 'Key ' + E.ONESIGNAL_API_KEY }, body: JSON.stringify(body) });
    console.log('onesignal:', res.status, (await res.text()).slice(0, 160));
  } catch (e) { console.log('onesignal error', e.message); }
} else if (live) console.log('web push skipped (ONESIGNAL secrets not set)');

// 2. Facebook hook (held until the owner approves; needs FACEBOOK_PAGE_ID + FACEBOOK_PAGE_TOKEN)
async function postFacebook() {
  if (!live || !E.FACEBOOK_PAGE_ID || !E.FACEBOOK_PAGE_TOKEN || E.FACEBOOK_ENABLED !== '1') return;
  // POST https://graph.facebook.com/v21.0/{PAGE_ID}/feed  { message, link: p.url, access_token }
}
await postFacebook();
