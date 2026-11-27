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

if (live) {
  // Telegram channel post goes through the worker (bot token lives only there; it posts to our channel only, once per URL)
  try {
    const res = await fetch('https://td-bot.td-arabi.workers.dev/tgpost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: p.url }) });
    console.log('telegram:', res.status, (await res.text()).slice(0, 200));
  } catch (e) { console.log('telegram error', e.message); }
}

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

// 2. Facebook page post (one per new article). The page token lives only in the Cloudflare worker; we send just the article URL.
if (live) {
  try {
    const res = await fetch('https://td-bot.td-arabi.workers.dev/fbpost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: p.url }) });
    console.log('facebook:', res.status, (await res.text()).slice(0, 200));
  } catch (e) { console.log('facebook error', e.message); }
}

// 3. Instagram post (td_arabi, same pacing rules, token only in the worker)
if (live) {
  try {
    const res = await fetch('https://td-bot.td-arabi.workers.dev/igpost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: p.url }) });
    console.log('instagram:', res.status, (await res.text()).slice(0, 200));
  } catch (e) { console.log('instagram error', e.message); }
}
