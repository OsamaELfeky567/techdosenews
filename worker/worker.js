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
  const page = await fetch(link, { headers: { "user-agent": "td-arabi-fb-poster" } });
  if (!page.ok) return json({ ok: false, error: "page not live", status: page.status }, 404);
  const html = await page.text();
  const title = metaOf(html, "og:title"), desc = metaOf(html, "og:description");
  const message = [title, desc && desc.slice(0, 220)].filter(Boolean).join("\n\n");
  const r = await fetch(`https://graph.facebook.com/v21.0/${env.FB_PAGE_ID}/feed`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, link, access_token: env.FB_PAGE_TOKEN }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id) return json({ ok: false, error: "graph error", detail: j.error?.message || r.status }, 502);
  await env.SUBS.put(key, j.id, { expirationTtl: 60 * 60 * 24 * 90 });
  return json({ ok: true, post_id: j.id });
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
  const text = `<b>${esc(title)}</b>\n\n${esc(desc.slice(0, 220))}\n\n🔗 ${link}`;
  let r = img && !/og-image\.png$/.test(img) ? await tg(env, "sendPhoto", { chat_id: env.CHANNEL, photo: img, caption: text, parse_mode: "HTML" }) : null;
  if (!r?.ok) r = await tg(env, "sendMessage", { chat_id: env.CHANNEL, text, parse_mode: "HTML" });
  if (!r?.ok) return json({ ok: false, error: "telegram error", detail: r?.description }, 502);
  await env.SUBS.put(key, String(r.result?.message_id || 1), { expirationTtl: 60 * 60 * 24 * 90 });
  return json({ ok: true, message_id: r.result?.message_id });
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
    if (req.method === "POST" && url.pathname === "/tgpost") return handleTgPost(env, req);
    if (url.pathname === "/health") return json({ ok: true });
    return new Response("not found", { status: 404 });
  },
  async scheduled(event, env, ctx) {
    // keep the Modal container warm so users never wait on a cold start
    const png = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="), (c) => c.charCodeAt(0));
    ctx.waitUntil(
      removeViaModal(png, "ping.png").catch((e) => console.log("warm ping failed:", e.message))
    );
  },
};
