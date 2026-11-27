// TD بالعربي Telegram bot - Cloudflare Worker
// Week 1 tool: AI background removal (deAPI Ben2). Weekly tools plug into TOOLS below.
// Env secrets: BOT_TOKEN, DEAPI_KEY, BROADCAST_SECRET
// Env vars: CHANNEL (@td_arabi), SITE (https://td-arabi.com), DAILY_QUOTA (3), WEBHOOK_PATH
// KV binding: SUBS (subscriber ids + per-user daily counters)

const TG = "https://api.telegram.org";
const DEAPI = "https://api.deapi.ai";

const FOOTER = "\n\n📢 قناة TD بالعربي: https://t.me/td_arabi\n🌐 أخبار التقنية: https://td-arabi.com";

const MSG = {
  welcome:
    "أهلاً بيك! 👋\nأنا بوت TD بالعربي: أدوات ذكاء اصطناعي مجانية.\nالأداة الحالية: إزالة خلفية أي صورة 🖼\n\nعشان تستخدم البوت، لازم تكون مشترك في قناة TD بالعربي الأول 👇",
  joinBtn: "📢 انضم للقناة",
  checkBtn: "✅ اشتركت، تحقق",
  notJoined: "لسه مش مشترك في القناة. اشترك وبعدين دوس ✅ اشتركت، تحقق.",
  joined: "تمام! ✅ اشتراكك اتأكد.\nابعتلي أي صورة وأنا أشيل الخلفية وأرجعهالك PNG شفاف 🖼" ,
  quota:
    "وصلت للحد المجاني النهاردة (3 صور). ارجع بكرة، أو تابع القناة لأننا بنزود الأدوات كل أسبوع 😉",
  working: "شغال على الصورة… ⏳",
  done: "خلصت! ✅ دي صورتك من غير خلفية (PNG شفاف). ابعت صورة تانية أي وقت.",
  fail: "حصلت مشكلة في معالجة الصورة. جرّب صورة تانية أو حجم أصغر (أقل من 10MB).",
  askPhoto: "ابعتلي صورة (Photo أو Document) وأنا أشيل خلفيتها 🖼",
  stop: "اتشلت من قائمة المشتركين. ممكن ترجع أي وقت بـ /start.",
};

// ---- Telegram helpers ----
async function tg(env, method, payload, isForm) {
  const res = await fetch(`${TG}/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: isForm ? undefined : { "content-type": "application/json" },
    body: isForm ? payload : JSON.stringify(payload),
  });
  return res.json();
}
const sendMsg = (env, chat, text, extra = {}) =>
  tg(env, "sendMessage", { chat_id: chat, text, disable_web_page_preview: true, ...extra });

async function isMember(env, userId) {
  try {
    const r = await tg(env, "getChatMember", { chat_id: env.CHANNEL, user_id: userId });
    const s = r?.result?.status;
    return s === "member" || s === "administrator" || s === "creator";
  } catch {
    return false;
  }
}

// ---- KV: subscribers + daily quota ----
async function addSub(env, id) {
  const key = `sub:${id}`;
  if (!(await env.SUBS.get(key))) await env.SUBS.put(key, String(Date.now()));
}
async function removeSub(env, id) { await env.SUBS.delete(`sub:${id}`); }

async function takeQuota(env, id) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `q:${day}:${id}`;
  const used = parseInt((await env.SUBS.get(key)) || "0", 10);
  if (used >= parseInt(env.DAILY_QUOTA || "3", 10)) return false;
  await env.SUBS.put(key, String(used + 1), { expirationTtl: 60 * 60 * 48 });
  return true;
}

async function listSubs(env) {
  const out = [];
  let cursor;
  do {
    const r = await env.SUBS.list({ prefix: "sub:", cursor });
    out.push(...r.keys.map((k) => k.name.slice(4)));
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);
  return out;
}

// ---- Gate ----
async function sendGate(env, chat) {
  await sendMsg(env, chat, MSG.welcome, {
    reply_markup: {
      inline_keyboard: [
        [{ text: MSG.joinBtn, url: `https://t.me/${env.CHANNEL.replace("@", "")}` }],
        [{ text: MSG.checkBtn, callback_data: "check_sub" }],
      ],
    },
  });
}

// ---- Background removal (Modal primary, deAPI fallback) ----
const MODAL_URL = "https://omarassistant10--td-bg-removal-remove.us-east.modal.run";

async function removeViaModal(imageBytes, filename) {
  const form = new FormData();
  form.append("file", new Blob([imageBytes]), filename || "photo.jpg");
  const r = await fetch(MODAL_URL, { method: "POST", body: form });
  if (!r.ok) throw new Error(`modal ${r.status}`);
  const buf = await r.arrayBuffer();
  if (buf.byteLength < 1000) throw new Error("modal empty result");
  return new Uint8Array(buf);
}

async function removeViaDeapi(env, imageBytes, filename) {
  const form = new FormData();
  form.append("image", new Blob([imageBytes]), filename || "photo.jpg");
  form.append("model", "Ben2");
  const submit = await fetch(`${DEAPI}/api/v2/images/background-removals`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.DEAPI_KEY}`, Accept: "application/json" },
    body: form,
  });
  if (!submit.ok) throw new Error(`deapi submit ${submit.status}`);
  const sj = await submit.json();
  const reqId = sj?.data?.request_id || sj?.data?.job_request || sj?.request_id;
  if (!reqId) throw new Error("deapi no request_id");
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2500));
    const st = await fetch(`${DEAPI}/api/v2/jobs/${reqId}`, {
      headers: { Authorization: `Bearer ${env.DEAPI_KEY}`, Accept: "application/json" },
    }).then((r) => r.json());
    const s = st?.data?.status;
    if (s === "done") {
      const url = st.data.result_url;
      if (!url) throw new Error("deapi done no url");
      const img = await fetch(url);
      if (!img.ok) throw new Error(`result fetch ${img.status}`);
      return new Uint8Array(await img.arrayBuffer());
    }
    if (s === "error") throw new Error("deapi job error");
  }
  throw new Error("deapi timeout");
}

async function removeBackground(env, imageBytes, filename) {
  try {
    return await removeViaModal(imageBytes, filename);
  } catch (e) {
    console.log("modal failed, trying deapi:", e.message);
    return await removeViaDeapi(env, imageBytes, filename);
  }
}

async function handlePhoto(env, msg, fileId, filename) {
  const chat = msg.chat.id;
  const uid = msg.from.id;
  await addSub(env, uid);
  if (!(await isMember(env, uid))) return sendGate(env, chat);
  if (!(await takeQuota(env, uid))) return sendMsg(env, chat, MSG.quota + FOOTER);
  await sendMsg(env, chat, MSG.working);
  try {
    const f = await tg(env, "getFile", { file_id: fileId });
    const path = f?.result?.file_path;
    if (!path) throw new Error("no file_path");
    const bytes = new Uint8Array(
      await (await fetch(`${TG}/file/bot${env.BOT_TOKEN}/${path}`)).arrayBuffer()
    );
    if (bytes.length > 10 * 1024 * 1024) throw new Error("too big");
    const png = await removeBackground(env, bytes, filename);
    const form = new FormData();
    form.append("chat_id", String(chat));
    form.append("document", new Blob([png], { type: "image/png" }), "no-bg.png");
    form.append("caption", MSG.done + FOOTER);
    await tg(env, "sendDocument", form, true);
  } catch (e) {
    await sendMsg(env, chat, MSG.fail + FOOTER);
  }
}

// ---- Update handling ----
async function handleUpdate(env, update) {
  const cb = update.callback_query;
  if (cb) {
    const chat = cb.message.chat.id;
    const uid = cb.from.id;
    await tg(env, "answerCallbackQuery", { callback_query_id: cb.id });
    if (cb.data === "check_sub") {
      if (await isMember(env, uid)) {
        await addSub(env, uid);
        await sendMsg(env, chat, MSG.joined + FOOTER);
      } else {
        await sendMsg(env, chat, MSG.notJoined);
      }
    }
    return;
  }
  const msg = update.message;
  if (!msg) return;
  const chat = msg.chat.id;
  const uid = msg.from?.id;
  const text = (msg.text || "").trim();
  if (text.startsWith("/start")) {
    await addSub(env, uid);
    if (await isMember(env, uid)) await sendMsg(env, chat, MSG.joined + FOOTER);
    else await sendGate(env, chat);
    return;
  }
  if (text.startsWith("/stop")) { await removeSub(env, uid); return sendMsg(env, chat, MSG.stop); }
  if (msg.photo?.length) return handlePhoto(env, msg, msg.photo[msg.photo.length - 1].file_id, "photo.jpg");
  if (msg.document && /^image\//.test(msg.document.mime_type || ""))
    return handlePhoto(env, msg, msg.document.file_id, msg.document.file_name);
  if (text) return sendMsg(env, chat, MSG.askPhoto + FOOTER);
}

// ---- Broadcast (pipeline -> channel + subscribers) ----
async function handleBroadcast(env, req) {
  const body = await req.json().catch(() => ({}));
  const text = (body.text || "") + FOOTER;
  const targets = new Set([env.CHANNEL, ...(await listSubs(env))]);
  let sent = 0, failed = 0;
  for (const t of targets) {
    const r = await sendMsg(env, t, text);
    r?.ok ? sent++ : failed++;
    await new Promise((r2) => setTimeout(r2, 60));
  }
  return json({ ok: true, sent, failed, total: targets.size });
}

// ---- Facebook page auto-post (called by the site pipeline with just an article URL) ----
// Safety: only URLs under SITE/news/ that return 200 are posted; each URL is posted once (KV dedupe).
const metaOf = (html, prop) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)["']`, "i")) ||
            html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${prop}["']`, "i"));
  return m ? m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'") : "";
};
async function handleFbPost(env, req) {
  if (!env.FB_PAGE_TOKEN || !env.FB_PAGE_ID) return json({ ok: false, error: "fb not configured" }, 503);
  const body = await req.json().catch(() => ({}));
  const link = String(body.url || "");
  if (!link.startsWith(env.SITE + "/news/") || link.length > 300) return json({ ok: false, error: "bad url" }, 400);
  const key = "fbpost:" + link;
  if (await env.SUBS.get(key)) return json({ ok: true, skipped: "already posted" });
  // pacing: a new page with few followers looks spammy if it posts every hour. Max 4 posts per day (Cairo), at least 4h apart.
  const dayKey = "fbday:" + new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10);
  const dayCount = +(await env.SUBS.get(dayKey) || 0), lastAt = +(await env.SUBS.get("fblast") || 0);
  if (dayCount >= 6 || Date.now() - lastAt < 2.5 * 3600e3) return json({ ok: true, skipped: "paced", day_count: dayCount });
  const page = await fetch(link, { headers: { "user-agent": "td-arabi-fb-poster" } });
  if (!page.ok) return json({ ok: false, error: "page not live", status: page.status }, 404);
  const html = await page.text();
  const title = metaOf(html, "og:title"), desc = metaOf(html, "og:description");
  // keep the message short and link-free (Facebook limits reach of posts with extra external links); Telegram/site links live in the page About + website fields
  const message = [title, desc && desc.slice(0, 220)].filter(Boolean).join("\n\n");
  const r = await fetch(`https://graph.facebook.com/v21.0/${env.FB_PAGE_ID}/feed`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, link, access_token: env.FB_PAGE_TOKEN }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id) return json({ ok: false, error: "graph error", detail: j.error?.message || r.status }, 502);
  await env.SUBS.put(key, j.id, { expirationTtl: 60 * 60 * 24 * 90 });
  await env.SUBS.put(dayKey, String(dayCount + 1), { expirationTtl: 172800 });
  await env.SUBS.put("fblast", String(Date.now()), { expirationTtl: 172800 });
  return json({ ok: true, post_id: j.id });
}

// ---- Instagram daily carousel (built by .github/workflows/carousel.yml, posted here). One per Cairo day, fixed evening slot. ----
const cairoNow = () => {
  const f = (o) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", ...o }).format(new Date());
  const hm = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
  return { date: f({}), min: +hm.slice(0, 2) * 60 + +hm.slice(3, 5) };
};
const IG_SLOT_MIN = 20 * 60 + 30; // 20:30 Cairo
const igG = "https://graph.facebook.com/v21.0/";
async function igStatus(env, id) {
  let st = "";
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const s = await (await fetch(igG + id + "?fields=status_code&access_token=" + env.IG_PAGE_TOKEN)).json().catch(() => ({}));
    st = s.status_code; if (st === "FINISHED" || st === "ERROR" || st === "EXPIRED") break;
  }
  return st;
}
async function postJson(url, body) { return (await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json().catch(() => ({})); }
async function handleIgCarousel(env, req) {
  if (!env.IG_PAGE_TOKEN || !env.IG_USER_ID) return json({ ok: false, error: "ig not configured" }, 503);
  const body = await req.json().catch(() => ({}));
  const date = String(body.date || "");
  if (date !== cairoNow().date) return json({ ok: false, error: "date is not today (Cairo)" }, 400);
  const key = "igcar:" + date;
  if (await env.SUBS.get(key)) return json({ ok: true, skipped: "already posted" });
  const base = `${env.SITE}/carousel/${date}/`;
  const mr = await fetch(base + "meta.json?c=" + Date.now());
  if (!mr.ok) return json({ ok: false, error: "meta not live", status: mr.status }, 404);
  const meta = await mr.json();
  const slides = (meta.slides || []).slice(0, 10);
  if (slides.length < 5) return json({ ok: false, error: "too few slides" }, 422);
  const fail = async (error, detail) => { await env.SUBS.put("igcar-last", JSON.stringify({ date, ok: false, error, detail: String(detail || "").slice(0, 200), at: new Date().toISOString() }), { expirationTtl: 60 * 60 * 24 * 14 }); return json({ ok: false, error, detail }, 502); };
  const kids = await Promise.all(slides.map((s) => postJson(igG + env.IG_USER_ID + "/media", { image_url: base + s, is_carousel_item: true, access_token: env.IG_PAGE_TOKEN })));
  if (kids.some((k) => !k.id)) return fail("child container error", kids.find((k) => !k.id)?.error?.message);
  for (const k of kids) { const st = await igStatus(env, k.id); if (st !== "FINISHED") return fail("child not ready", st); }
  const c = await postJson(igG + env.IG_USER_ID + "/media", { media_type: "CAROUSEL", children: kids.map((k) => k.id).join(","), caption: String(meta.caption || "").slice(0, 2000), access_token: env.IG_PAGE_TOKEN });
  if (!c.id) return fail("carousel container error", c.error?.message);
  const st = await igStatus(env, c.id);
  if (st !== "FINISHED") return fail("carousel not ready", st);
  const p = await postJson(igG + env.IG_USER_ID + "/media_publish", { creation_id: c.id, access_token: env.IG_PAGE_TOKEN });
  if (!p.id) return fail("publish error", p.error?.message);
  await env.SUBS.put(key, p.id, { expirationTtl: 60 * 60 * 24 * 30 });
  let permalink = "";
  try { permalink = (await (await fetch(igG + p.id + "?fields=permalink&access_token=" + env.IG_PAGE_TOKEN)).json()).permalink || ""; } catch {}
  await env.SUBS.put("igcar-last", JSON.stringify({ date, ok: true, media_id: p.id, permalink, slides: slides.length, at: new Date().toISOString() }), { expirationTtl: 60 * 60 * 24 * 14 });
  // one native Facebook photo post a day, no link: the cover slide with the headlines
  let fbNative = false;
  if (env.FB_PAGE_TOKEN && !(await env.SUBS.get("fbnative:" + date))) {
    const heads = (meta.stories || []).slice(0, 5).map((s, i) => `${i + 1}. ${s.title}`).join("\n");
    const f = await postJson(`https://graph.facebook.com/v21.0/${env.FB_PAGE_ID}/photos`, { url: base + slides[0], message: "أهم أخبار التقنية اليوم:\n\n" + heads, access_token: env.FB_PAGE_TOKEN });
    if (f.id) { fbNative = true; await env.SUBS.put("fbnative:" + date, f.id, { expirationTtl: 172800 }); }
  }
  return json({ ok: true, media_id: p.id, permalink, fb_native: fbNative });
}
// Telegram evening digest: top 5 of the day's carousel stories (notification ON; article posts are silent)
async function handleTgDigest(env, req) {
  const body = await req.json().catch(() => ({}));
  const date = String(body.date || "");
  if (date !== cairoNow().date) return json({ ok: false, error: "date is not today (Cairo)" }, 400);
  const key = "tgdigest:" + date;
  if (await env.SUBS.get(key)) return json({ ok: true, skipped: "already posted" });
  const mr = await fetch(`${env.SITE}/carousel/${date}/meta.json?c=${Date.now()}`);
  if (!mr.ok) return json({ ok: false, error: "meta not live" }, 404);
  const meta = await mr.json();
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const items = (meta.stories || []).slice(0, 5);
  if (items.length < 3) return json({ ok: false, error: "too few stories" }, 422);
  const text = `<b>🗞 أهم ${items.length} أخبار التقنية اليوم</b>\n\n` + items.map((s, i) => `${i + 1}. <a href="${s.url}">${esc(s.title)}</a>`).join("\n\n") + `\n\n🌐 ${env.SITE}`;
  const r = await tg(env, "sendMessage", { chat_id: env.CHANNEL, text, parse_mode: "HTML", disable_web_page_preview: true });
  if (!r?.ok) return json({ ok: false, error: "telegram error", detail: r?.description }, 502);
  await env.SUBS.put(key, String(r.result?.message_id || 1), { expirationTtl: 172800 });
  return json({ ok: true, message_id: r.result?.message_id });
}
// cron: start the carousel workflow from 20:30 Cairo if today's carousel is not posted (retries every ~30 min, max 3 runs, until 22:30)
async function igCarouselCron(env) {
  if (!env.GH_DISPATCH_TOKEN) return { skipped: "no token" };
  const { date, min } = cairoNow();
  if (min < IG_SLOT_MIN || min > 22 * 60 + 30) return { skipped: "outside slot" };
  if (await env.SUBS.get("igcar:" + date)) return { skipped: "posted" };
  const dk = "igcar-disp:" + date, d = JSON.parse((await env.SUBS.get(dk)) || '{"n":0,"t":0}');
  if (d.n >= 3 || Date.now() - d.t < 28 * 60000) return { skipped: "wait", n: d.n };
  const repo = "OsamaELfeky567/techdosenews";
  const r = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/carousel.yml/dispatches`, { method: "POST", headers: { authorization: "Bearer " + env.GH_DISPATCH_TOKEN, "user-agent": "td-bot", accept: "application/vnd.github+json" }, body: JSON.stringify({ ref: "main" }) });
  await env.SUBS.put(dk, JSON.stringify({ n: d.n + 1, t: Date.now() }), { expirationTtl: 172800 });
  if (r.status !== 204) await env.SUBS.put("igcar-last", JSON.stringify({ date, ok: false, error: "dispatch " + r.status, at: new Date().toISOString() }), { expirationTtl: 60 * 60 * 24 * 14 });
  return { dispatched: r.status, n: d.n + 1 };
}

// ---- Telegram channel auto-post (same safety rules as /fbpost) ----
async function handleTgPost(env, req) {
  const body = await req.json().catch(() => ({}));
  const link = String(body.url || "");
  if (!link.startsWith(env.SITE + "/news/") || link.length > 300) return json({ ok: false, error: "bad url" }, 400);
  const key = "tgpost:" + link;
  if (await env.SUBS.get(key)) return json({ ok: true, skipped: "already posted" });
  const page = await fetch(link, { headers: { "user-agent": "td-arabi-tg-poster" } });
  if (!page.ok) return json({ ok: false, error: "page not live", status: page.status }, 404);
  const html = await page.text();
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const title = metaOf(html, "og:title"), desc = metaOf(html, "og:description"), img = metaOf(html, "og:image");
  const text = `<b>${esc(title)}</b>\n\n${esc(desc.slice(0, 220))}\n\n🔗 ${link}\n\n📘 فيسبوك: https://www.facebook.com/tdarabi\n🌐 الموقع: ${env.SITE}`;
  let r = img && !/og-image\.png$/.test(img) ? await tg(env, "sendPhoto", { chat_id: env.CHANNEL, photo: img, caption: text, parse_mode: "HTML", disable_notification: true }) : null;
  if (!r?.ok) r = await tg(env, "sendMessage", { chat_id: env.CHANNEL, text, parse_mode: "HTML", disable_notification: true });
  if (!r?.ok) return json({ ok: false, error: "telegram error", detail: r?.description }, 502);
  await env.SUBS.put(key, String(r.result?.message_id || 1), { expirationTtl: 60 * 60 * 24 * 90 });
  return json({ ok: true, message_id: r.result?.message_id });
}



// ---------- daily free / open-source tools post (Facebook page + Telegram channel) ----------
async function dailyTools(env, force) {
  const cairo = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const g = (t) => cairo.find((p) => p.type === t).value;
  const day = `${g("year")}-${g("month")}-${g("day")}`, hour = +g("hour");
  const dkey = "daily:" + day;
  if (!force && (hour < 19 || (await env.SUBS.get(dkey)))) return { skipped: true };
  if (await env.SUBS.get(dkey)) return { skipped: "already posted" };
  const poolRes = await fetch(env.SITE + "/data/daily-tools.json?c=" + Date.now());
  if (!poolRes.ok) return { error: "pool unavailable" };
  const pool = await poolRes.json();
  const n0 = Math.floor(Date.now() / 86400000), picks = [];
  for (let i = 0; i < pool.length && picks.length < 3; i++) {
    const t = pool[(n0 * 3 + i) % pool.length];
    try {
      const gh = await fetch("https://api.github.com/repos/" + t.repo, { headers: { "user-agent": "td-arabi-daily" } });
      if (gh.ok) { const j = await gh.json(); if (j.archived) continue; }
      const u = await fetch(t.url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0" } });
      if (u.status === 404 || u.status >= 500) continue;
      picks.push(t);
    } catch { /* skip tools that cannot be verified */ }
  }
  if (picks.length < 3) return { error: "not enough verified tools" };
  const text = "🛠 أدوات مجانية ومفتوحة المصدر النهارده:\n" + picks.map((t) => `• ${t.name}: ${t.desc}. ${t.url}`).join("\n") + "\nأدوات ببلاش على تيليجرام كمان: " + env.SITE + "/free-tools/";
  const res = { day, tools: picks.map((t) => t.name) };
  // Telegram channel
  const r = await tg(env, "sendMessage", { chat_id: env.CHANNEL, text, disable_web_page_preview: true });
  res.telegram = !!r?.ok;
  // Facebook page: counts in the 4 posts/day cap
  const dayKey = "fbday:" + day, dayCount = +(await env.SUBS.get(dayKey) || 0);
  if (env.FB_PAGE_TOKEN && dayCount < 4) {
    const f = await fetch(`https://graph.facebook.com/v21.0/${env.FB_PAGE_ID}/feed`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: text, link: env.SITE + "/free-tools/", access_token: env.FB_PAGE_TOKEN }) });
    const fj = await f.json().catch(() => ({}));
    res.facebook = !!fj.id;
    if (fj.id) { await env.SUBS.put(dayKey, String(dayCount + 1), { expirationTtl: 172800 }); await env.SUBS.put("fblast", String(Date.now()), { expirationTtl: 172800 }); }
  }
  if (res.telegram || res.facebook) await env.SUBS.put(dkey, JSON.stringify(res), { expirationTtl: 172800 });
  return res;
}


// ---------- self-dispatch: starts the article workflow when GitHub's own cron has not (needs GH_DISPATCH_TOKEN secret) ----------
async function autoDispatch(env) {
  if (!env.GH_DISPATCH_TOKEN) return { skipped: "no token" };
  const repo = "OsamaELfeky567/techdosenews", H = { authorization: "Bearer " + env.GH_DISPATCH_TOKEN, "user-agent": "td-bot", accept: "application/vnd.github+json" };
  const r = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/generate.yml/runs?per_page=1`, { headers: H });
  if (!r.ok) return { error: "runs " + r.status };
  const run = (await r.json()).workflow_runs?.[0];
  if (run && (Date.now() - new Date(run.created_at).getTime() < 55 * 60000 || run.status !== "completed")) return { skipped: "recent run" };
  const d = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/generate.yml/dispatches`, { method: "POST", headers: H, body: JSON.stringify({ ref: "main" }) });
  return { dispatched: d.status };
}

// ---------- dashboard stats (aggregates only, refreshed by the cron; served at GET /stats) ----------
const RAWREPO = "https://raw.githubusercontent.com/OsamaELfeky567/techdosenews/main/";
const TGCHAT = "-1003896125398";
async function gj(url, init) { try { const r = await fetch(url, init); return r.ok ? await r.json() : null; } catch { return null; } }
async function gt(url) { try { const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } }); return r.ok ? await r.text() : null; } catch { return null; } }
function parseCsv(t) {
  const rows = (t || "").trim().split(/\r?\n/).map((l) => l.split(",").map((x) => x.replace(/^"|"$/g, "")));
  return rows.slice(1).filter((r) => r.length >= 5).map((r) => ({ date: r[1], pv: +r[2], sessions: +r[3], visitors: +r[4] }));
}
async function collectStats(env) {
  const now = Date.now(), out = { updated: new Date(now).toISOString().slice(0, 19) + "Z", notes: [] };
  const [idx, runs, gsc, base] = await Promise.all([
    gj(RAWREPO + "data/articles/index.json?t=" + now), gj("https://api.github.com/repos/OsamaELfeky567/techdosenews/actions/workflows/generate.yml/runs?per_page=40", { headers: { "user-agent": "td-bot" } }),
    gj(RAWREPO + "data/gsc-status.json?t=" + now), gj(RAWREPO + "data/baseline/2026-11-26.json?t=" + now)]);
  const arts = Array.isArray(idx) ? idx : [];
  const ageH = (a) => (now - new Date(a.date).getTime()) / 36e5;
  const perDay = {}; for (const a of arts) perDay[a.date.slice(0, 10)] = (perDay[a.date.slice(0, 10)] || 0) + 1;
  out.site = { articles_total: arts.length, last_24h: arts.filter((a) => ageH(a) < 24).length, last_7d: arts.filter((a) => ageH(a) < 168).length,
    gaming_total: arts.filter((a) => a.category === "gaming").length, per_day: Object.fromEntries(Object.entries(perDay).sort().slice(-14)) };
  if (runs?.workflow_runs) {
    const r = runs.workflow_runs.filter((x) => now - new Date(x.created_at).getTime() < 864e5);
    Object.assign(out.site, { runs_24h: r.length, runs_ok_24h: r.filter((x) => x.conclusion === "success").length, runs_failed_24h: r.filter((x) => x.conclusion === "failure").length, last_run: r[0]?.created_at || null });
  }
  const cairo = new Date(now + 2 * 36e5), fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");
  const daily = parseCsv(await gt(`https://statcounter.com/p13370055/csv/stats/?download&granularity=daily&guest=1&graph-sig=${fmt(new Date(cairo - 29 * 864e5))}_${fmt(cairo)}`));
  const tdy = cairo.toISOString().slice(0, 10), yst = new Date(cairo - 864e5).toISOString().slice(0, 10);
  const sm = (rows) => ({ pv: rows.reduce((a, x) => a + x.pv, 0), sessions: rows.reduce((a, x) => a + x.sessions, 0), visitors_sum: rows.reduce((a, x) => a + x.visitors, 0) });
  out.traffic = { source: "StatCounter (guest)", daily, today: sm(daily.filter((x) => x.date === tdy)), yesterday: sm(daily.filter((x) => x.date === yst)), last_7d: sm(daily.slice(-7)), last_30d: sm(daily) };
  // facebook
  const G = "https://graph.facebook.com/v19.0/", P = env.FB_PAGE_ID, T = env.FB_PAGE_TOKEN, fb = { available: !!T };
  if (T) {
    const p = (await gj(`${G}${P}?fields=followers_count,fan_count&access_token=${T}`)) || {};
    fb.followers = p.followers_count ?? null; fb.fans = p.fan_count ?? null;
    let posts = [], url = `${G}${P}/posts?fields=id,created_time,shares,reactions.summary(true).limit(0),comments.summary(true).limit(100){created_time}&limit=50&access_token=${T}`;
    for (let i = 0; i < 3 && url; i++) { const j = await gj(url); if (!j?.data) break; posts = posts.concat(j.data); url = j.paging?.next; }
    const win = (h) => posts.filter((x) => now - new Date(x.created_time.replace("+0000", "Z")).getTime() < h * 36e5);
    const cm = (h) => posts.reduce((n, x) => n + (x.comments?.data || []).filter((c) => now - new Date(c.created_time.replace("+0000", "Z")).getTime() < h * 36e5).length, 0);
    const rxn = (h) => win(h).reduce((n, x) => n + (x.reactions?.summary?.total_count || 0), 0);
    fb.posts = { total: posts.length, last_24h: win(24).length, last_7d: win(168).length };
    fb.comments = { last_24h: cm(24), last_7d: cm(168), last_30d: cm(720) };
    fb.reactions_on_posts = { last_24h: rxn(24), last_7d: rxn(168) };
    fb.shares_on_posts = posts.reduce((n, x) => n + (x.shares?.count || 0), 0);
    const ins = {};
    for (const m of ["page_follows", "page_media_view", "page_views_total", "page_post_engagements", "page_total_media_view_unique", "page_daily_follows_unique"]) {
      const j = await gj(`${G}${P}/insights?metric=${m}&period=day&since=${Math.floor(now / 1000) - 31 * 86400}&access_token=${T}`);
      const vals = j?.data?.[0]?.values;
      if (vals?.length) ins[m] = vals.filter((v) => typeof v.value === "number").map((v) => ({ end: v.end_time.slice(0, 10), value: v.value }));
    }
    fb.insights = ins;
    if (!Object.keys(ins).length) out.notes.push("ملاحظة: Meta لا توفر بعد إحصائيات الوصول والمشاهدات لصفحة فيسبوك الجديدة. المتابعون والبوستات والتعليقات والتفاعلات حية.");
  }
  out.facebook = fb;
  if (env.IG_PAGE_TOKEN && env.IG_USER_ID) {
    const ig = await gj(`https://graph.facebook.com/v21.0/${env.IG_USER_ID}?fields=username,followers_count,media_count&access_token=${env.IG_PAGE_TOKEN}`);
    out.instagram = { ...(ig && !ig.error ? { username: ig.username, followers: ig.followers_count, media_count: ig.media_count } : { error: "ig read failed" }), last_carousel: JSON.parse((await env.SUBS.get("igcar-last")) || "null") };
  }
  const tgm = env.BOT_TOKEN ? await gj(`https://api.telegram.org/bot${env.BOT_TOKEN}/getChatMemberCount?chat_id=${TGCHAT}`) : null;
  out.telegram = tgm?.ok ? { members: tgm.result } : {};
  out.gsc = gsc || {}; if (base) out.baseline = base;
  let hist = JSON.parse((await env.SUBS.get("stats:history")) || "[]");
  const pt = { t: out.updated.slice(0, 16) + "Z", fb_followers: fb.followers ?? null, tg_members: out.telegram.members ?? null, articles: arts.length, pv_today: out.traffic.today.pv };
  if (!hist.length || hist[hist.length - 1].t.slice(0, 13) !== pt.t.slice(0, 13)) { hist.push(pt); hist = hist.slice(-24 * 60); await env.SUBS.put("stats:history", JSON.stringify(hist)); }
  out.history = hist.slice(-72);
  await env.SUBS.put("stats:latest", JSON.stringify(out));
  return out;
}
async function handleStats(env, ctx) {
  let t = await env.SUBS.get("stats:latest"), stale = true;
  if (t) { stale = Date.now() - new Date(JSON.parse(t).updated).getTime() > 20 * 60 * 1000; }
  if (!t) t = JSON.stringify(await collectStats(env)); else if (stale) ctx.waitUntil(collectStats(env));
  return new Response(t, { headers: { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "public, max-age=60" } });
}

const json = (o, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (req.method === "POST" && url.pathname === `/tg/${env.WEBHOOK_PATH}`) {
      const update = await req.json().catch(() => null);
      if (update) ctx.waitUntil(handleUpdate(env, update));
      return json({ ok: true });
    }
    if (req.method === "POST" && url.pathname === `/broadcast/${env.BROADCAST_SECRET}`)
      return handleBroadcast(env, req);
    if (req.method === "POST" && url.pathname === "/fbpost") return handleFbPost(env, req);
    if (req.method === "POST" && url.pathname === "/igcarousel") return handleIgCarousel(env, req);
    if (req.method === "POST" && url.pathname === "/tgdigest") return handleTgDigest(env, req);
    if (req.method === "POST" && url.pathname === "/tgpost") return handleTgPost(env, req);
    if (req.method === "GET" && url.pathname === "/stats") return handleStats(env, ctx);
    if (url.pathname === "/health") return json({ ok: true });
    return new Response("not found", { status: 404 });
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(dailyTools(env, false).then((r) => console.log('daily tools:', JSON.stringify(r))).catch((e) => console.log('daily tools failed:', e.message)));
    ctx.waitUntil(igCarouselCron(env).then((r) => console.log('ig carousel cron:', JSON.stringify(r))).catch((e) => console.log('ig carousel cron failed:', e.message)));
    ctx.waitUntil(autoDispatch(env).then((r) => console.log('auto dispatch:', JSON.stringify(r))).catch((e) => console.log('auto dispatch failed:', e.message)));
    ctx.waitUntil(collectStats(env).catch((e) => console.log("stats failed:", e.message)));
    // keep the Modal container warm so users never wait on a cold start
    const png = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="), (c) => c.charCodeAt(0));
    ctx.waitUntil(
      removeViaModal(png, "ping.png").catch((e) => console.log("warm ping failed:", e.message))
    );
  },
};
