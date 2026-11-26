// TD بالعربي tool bots: one Cloudflare Worker serves every tool bot (removebg, ocr, compress, img2pdf, merge, split, qr).
// Secrets: TOKENS (JSON {key: botToken}), HOOK (webhook path secret). KV: SUBS (prefix tb:)
const TG = "https://api.telegram.org";
const FOOTER = "\n\n📢 قناة TD بالعربي: https://t.me/td_arabi\n🌐 https://td-arabi.com/free-tools/";

const BOTS = {
  removebg: { hello: "إزالة خلفية الصور", does: "ابعتلي أي صورة وأنا أشيل خلفيتها وأرجعهالك PNG شفاف.", want: "image" },
  ocr: { hello: "تحويل الصورة إلى نص (OCR عربي)", does: "ابعتلي صورة فيها كلام عربي أو إنجليزي وأنا أطلعهولك نص تقدر تنسخه.", want: "image" },
  compress: { hello: "ضغط الصور وتقليل الحجم", does: "ابعتلي أي صورة وأنا أصغّر حجمها مع الحفاظ على الجودة.", want: "image" },
  img2pdf: { hello: "تحويل الصور إلى PDF", does: "ابعتلي صورة أو أكتر (لحد 12) وبعدين دوس زرار «اعمل PDF».", want: "image" },
  merge: { hello: "دمج ملفات PDF", does: "ابعتلي ملفين PDF أو أكتر (لحد 10) بالترتيب اللي عايزه، وبعدين دوس زرار «ادمج».", want: "pdf" },
  split: { hello: "تقسيم PDF واستخراج صفحات", does: "ابعتلي ملف PDF وبعدين اكتب أرقام الصفحات اللي عايزها (مثال: 1-3 أو 2,5) أو اكتب «كل» عشان كل صفحة في ملف.", want: "pdf" },
  qr: { hello: "صانع QR كود", does: "ابعتلي أي رابط أو نص وأنا أعملهولك QR كود.", want: "text" },
};
const T = {
  gate: (b) => `أهلاً بيك! 👋\nبوت «${b.hello}» من TD بالعربي.\n${b.does}\n\nعشان تستخدمه مجاناً:\n1) انضم لقناتنا على تيليجرام\n2) تابع صفحتنا على فيسبوك\nوبعدين دوس «تم ✅».`,
  joinBtn: "📢 انضم للقناة", fbBtn: "👍 تابع صفحة فيسبوك", doneBtn: "تم ✅",
  notJoined: "لسه مش مشترك في القناة. انضم وبعدين دوس «تم ✅» تاني.",
  ready: (b) => `تمام! ✅\n${b.does}`,
  quota: "وصلت للحد المجاني النهاردة. ارجع بكرة، أو جرّب باقي أدواتنا: https://td-arabi.com/free-tools/",
  working: "شغال… ⏳", fail: "حصلت مشكلة. جرّب ملف أو صورة تانية (أقل من 15MB).",
  wrong: (b) => ({ image: "ابعتلي صورة (Photo أو Document).", pdf: "ابعتلي ملف PDF.", text: "ابعتلي نص أو رابط." }[b.want]),
};

// ---- helpers ----
const J = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json" } });
async function tg(tok, method, payload, form) {
  const r = await fetch(`${TG}/bot${tok}/${method}`, { method: "POST", headers: form ? undefined : { "content-type": "application/json" }, body: form ? payload : JSON.stringify(payload) });
  return r.json();
}
const say = (tok, chat, text, extra = {}) => tg(tok, "sendMessage", { chat_id: chat, text, disable_web_page_preview: true, ...extra });
async function isMember(env, tok, uid) {
  try { const s = (await tg(env.CHECK_TOKEN || tok, "getChatMember", { chat_id: env.CHANNEL, user_id: uid }))?.result?.status; return ["member", "administrator", "creator"].includes(s); } catch { return false; }
}
async function sendFile(tok, chat, field, bytes, name, mime, caption) {
  const f = new FormData(); f.append("chat_id", String(chat)); f.append(field, new Blob([bytes], { type: mime }), name); if (caption) f.append("caption", caption);
  return tg(tok, field === "photo" ? "sendPhoto" : "sendDocument", f, true);
}
async function download(tok, fileId) {
  const f = await tg(tok, "getFile", { file_id: fileId });
  const p = f?.result?.file_path; if (!p) throw new Error("nofile");
  const r = await fetch(`${TG}/file/bot${tok}/${p}`); if (!r.ok) throw new Error("dl");
  const b = new Uint8Array(await r.arrayBuffer()); if (b.length > 15 * 1024 * 1024) throw new Error("big"); return b;
}
async function modal(env, name, fields) {
  const f = new FormData();
  for (const [k, v] of fields) f.append(k, v instanceof Uint8Array ? new Blob([v]) : v, v instanceof Uint8Array ? (k === "file" || k === "files" ? "f.bin" : k) : undefined);
  const r = await fetch(`${env.MODAL}-${name}.us-east.modal.run`, { method: "POST", body: f });
  if (!r.ok) throw new Error(`modal ${name} ${r.status}`);
  return r;
}
async function quota(env, key, uid) {
  const k = `tb:q:${key}:${new Date().toISOString().slice(0, 10)}:${uid}`;
  const n = parseInt((await env.SUBS.get(k)) || "0", 10); if (n >= parseInt(env.DAILY_QUOTA, 10)) return false;
  await env.SUBS.put(k, String(n + 1), { expirationTtl: 172800 }); return true;
}
const getS = async (env, key, uid) => JSON.parse((await env.SUBS.get(`tb:s:${key}:${uid}`)) || "{}");
const putS = (env, key, uid, s) => env.SUBS.put(`tb:s:${key}:${uid}`, JSON.stringify(s), { expirationTtl: 86400 });
const delS = (env, key, uid) => env.SUBS.delete(`tb:s:${key}:${uid}`);

async function gate(env, key, tok, chat) {
  return say(tok, chat, T.gate(BOTS[key]), { reply_markup: { inline_keyboard: [
    [{ text: T.joinBtn, url: `https://t.me/${env.CHANNEL.slice(1)}` }],
    [{ text: T.fbBtn, url: env.FB_URL }],
    [{ text: T.doneBtn, callback_data: "done" }],
  ] } });
}
async function allowed(env, key, tok, uid, chat) {
  if ((await env.SUBS.get(`tb:fb:${key}:${uid}`)) && (await isMember(env, tok, uid))) return true;
  await gate(env, key, tok, chat); return false;
}

// ---- tools ----
async function run(env, key, tok, chat, uid, kind, payload) {
  const b = BOTS[key];
  if (!(await quota(env, key, uid))) return say(tok, chat, T.quota);
  await say(tok, chat, T.working);
  try {
    if (key === "removebg") {
      const img = await download(tok, payload);
      const f = new FormData(); f.append("file", new Blob([img]), "photo.jpg");
      const r = await fetch(env.BG_URL, { method: "POST", body: f }); if (!r.ok) throw new Error("bg");
      await sendFile(tok, chat, "document", new Uint8Array(await r.arrayBuffer()), "no-bg.png", "image/png", "خلصت! ✅ PNG شفاف من غير خلفية." + FOOTER);
    } else if (key === "ocr") {
      const r = await modal(env, "ocr", [["file", await download(tok, payload)]]);
      const t = (await r.text()).trim();
      if (!t) return say(tok, chat, "ما لقيتش نص واضح في الصورة. جرّب صورة أوضح." + FOOTER);
      if (t.length > 3800) await sendFile(tok, chat, "document", new TextEncoder().encode(t), "text.txt", "text/plain", "النص كامل في الملف." + FOOTER);
      else await say(tok, chat, t + FOOTER);
    } else if (key === "compress") {
      const r = await modal(env, "compress", [["file", await download(tok, payload)], ["quality", "70"]]);
      const o = +r.headers.get("x-orig-size"), n = +r.headers.get("x-new-size");
      const kb = (x) => Math.round(x / 1024) + "KB";
      await sendFile(tok, chat, "document", new Uint8Array(await r.arrayBuffer()), "compressed.jpg", "image/jpeg", `خلصت! ✅ من ${kb(o)} إلى ${kb(n)}` + FOOTER);
    } else if (key === "img2pdf" || key === "merge") {
      const fields = []; for (const id of payload) fields.push(["files", await download(tok, id)]);
      const r = await modal(env, key === "merge" ? "merge" : "imgs2pdf", fields);
      await sendFile(tok, chat, "document", new Uint8Array(await r.arrayBuffer()), key === "merge" ? "merged.pdf" : "images.pdf", "application/pdf", "خلصت! ✅" + FOOTER);
      await delS(env, key, uid);
    } else if (key === "split") {
      const r = await modal(env, "split", [["file", await download(tok, payload.file)], ["pages", payload.pages]]);
      const zip = (r.headers.get("content-type") || "").includes("zip");
      await sendFile(tok, chat, "document", new Uint8Array(await r.arrayBuffer()), zip ? "pages.zip" : "pages.pdf", zip ? "application/zip" : "application/pdf", "خلصت! ✅" + FOOTER);
      await delS(env, key, uid);
    } else if (key === "qr") {
      const r = await modal(env, "qr", [["text", payload]]);
      await sendFile(tok, chat, "photo", new Uint8Array(await r.arrayBuffer()), "qr.png", "image/png", "QR كود جاهز ✅" + FOOTER);
    }
  } catch (e) {
    console.log("run fail", key, e.message);
    await say(tok, chat, e.message.includes("split") || e.message.includes("400") ? "أرقام الصفحات مش مظبوطة. اكتب مثلاً 1-3 أو 2,5 أو «كل»." : T.fail);
  }
}

const imgId = (m) => m.photo?.length ? m.photo[m.photo.length - 1].file_id : /^image\//.test(m.document?.mime_type || "") && !/webp|gif/.test(m.document.mime_type) ? m.document.file_id : null;
const pdfId = (m) => (m.document?.mime_type === "application/pdf" ? m.document.file_id : null);

async function onUpdate(env, key, tok, u) {
  const b = BOTS[key];
  if (u.callback_query) {
    const cb = u.callback_query, chat = cb.message.chat.id, uid = cb.from.id;
    await tg(tok, "answerCallbackQuery", { callback_query_id: cb.id });
    if (cb.data === "done") {
      if (!(await isMember(env, tok, uid))) return say(tok, chat, T.notJoined);
      await env.SUBS.put(`tb:fb:${key}:${uid}`, "1"); // Facebook follow cannot be verified by Telegram; trusted on press
      return say(tok, chat, T.ready(b) + FOOTER);
    }
    if (cb.data === "make") {
      if (!(await allowed(env, key, tok, uid, chat))) return;
      const s = await getS(env, key, uid);
      if (!s.files?.length) return say(tok, chat, T.wrong(b));
      if (key === "merge" && s.files.length < 2) return say(tok, chat, "ابعت ملفين PDF على الأقل.");
      return run(env, key, tok, chat, uid, "files", s.files);
    }
    return;
  }
  const m = u.message; if (!m || m.chat.type !== "private") return;
  const chat = m.chat.id, uid = m.from.id, text = (m.text || "").trim();
  await env.SUBS.put(`tb:u:${key}:${uid}`, String(Date.now()));
  if (text.startsWith("/start") || text.startsWith("/help")) {
    if (await allowed(env, key, tok, uid, chat)) await say(tok, chat, T.ready(b) + FOOTER);
    return;
  }
  if (!(await allowed(env, key, tok, uid, chat))) return;
  if (b.want === "text") { if (text) return run(env, key, tok, chat, uid, "text", text); return say(tok, chat, T.wrong(b)); }
  if (key === "removebg" || key === "ocr" || key === "compress") {
    const id = imgId(m); if (!id) return say(tok, chat, T.wrong(b)); return run(env, key, tok, chat, uid, "img", id);
  }
  if (key === "img2pdf" || key === "merge") {
    const id = key === "merge" ? pdfId(m) : imgId(m); if (!id) return say(tok, chat, T.wrong(b));
    const s = await getS(env, key, uid); s.files = s.files || []; const max = key === "merge" ? 10 : 12;
    if (s.files.length >= max) return say(tok, chat, `وصلت للحد الأقصى (${max}). دوس الزرار تحت.`);
    s.files.push(id); await putS(env, key, uid, s);
    return say(tok, chat, `استلمت ${s.files.length} ${key === "merge" ? "ملف" : "صورة"} ✅\nابعت تاني أو دوس الزرار.`, { reply_markup: { inline_keyboard: [[{ text: key === "merge" ? "ادمج 📎" : "اعمل PDF 📄", callback_data: "make" }]] } });
  }
  if (key === "split") {
    const id = pdfId(m);
    if (id) { await putS(env, key, uid, { file: id }); return say(tok, chat, "استلمت الملف ✅\nاكتب أرقام الصفحات (مثال: 1-3 أو 2,5) أو «كل» لكل صفحة في ملف."); }
    const s = await getS(env, key, uid);
    if (s.file && text) return run(env, key, tok, chat, uid, "split", { file: s.file, pages: text });
    return say(tok, chat, T.wrong(b));
  }
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url); const parts = url.pathname.split("/").filter(Boolean);
    if (url.pathname === "/health") return J({ ok: true, bots: Object.keys(BOTS) });
    if (req.method === "POST" && parts[0] === "h" && parts[2] === env.HOOK) {
      const key = parts[1]; const toks = JSON.parse(env.TOKENS); const tok = toks[key];
      if (!tok || !BOTS[key]) return new Response("no", { status: 404 });
      const upd = await req.json();
      ctx.waitUntil(onUpdate(env, key, tok, upd).catch((e) => console.log("err", key, e.message)));
      return J({ ok: true });
    }
    return new Response("TD tools", { status: 200 });
  },
};
