/* =========================================================
   Tech Dose News â€” script.js
   Vanilla JS, no dependencies
   ========================================================= */

'use strict';

/* =========================================================
   DATETIME BAR â€” Ù…ÙŠÙ„Ø§Ø¯ÙŠ + Ù‡Ø¬Ø±ÙŠ + Ø³Ø§Ø¹Ø©
   ========================================================= */
function initDatetimeBar() {
  function updateClock() {
    const now = new Date();

    // ===== Ù…ÙŠÙ„Ø§Ø¯ÙŠ =====
    const miladiOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const miladi = now.toLocaleDateString('ar-EG', miladiOptions);
    const miladiEl = document.getElementById('miladiDate');
    if (miladiEl) miladiEl.textContent = miladi;

    // ===== Ù‡Ø¬Ø±ÙŠ =====
    const hijriOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic' };
    try {
      const hijri = now.toLocaleDateString('ar-SA-u-ca-islamic', hijriOptions);
      const hijriEl = document.getElementById('hijriDate');
      if (hijriEl) hijriEl.textContent = hijri;
    } catch(e) {
      // fallback if islamic calendar not supported
      const hijriEl = document.getElementById('hijriDate');
      if (hijriEl) hijriEl.textContent = '';
      const sep = document.querySelectorAll('.datetime-sep');
      if (sep[0]) sep[0].style.display = 'none';
      const dtHijri = document.getElementById('dtHijri');
      if (dtHijri) dtHijri.style.display = 'none';
    }

    // ===== Ø³Ø§Ø¹Ø© 12 ØµØ¨Ø§Ø­Ø§Ù‹/Ù…Ø³Ø§Ø¡Ù‹ =====
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'Ù…' : 'Øµ';
    hours = hours % 12 || 12;
    const timeStr = `${hours}:${minutes}:${seconds} ${ampm}`;
    const clockEl = document.getElementById('clockTime');
    if (clockEl) clockEl.textContent = timeStr;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* =========================================================
   RELATIVE DATE â€” ØªØ­ÙˆÙŠÙ„ timestamp Ù„ÙˆÙ‚Øª Ù†Ø³Ø¨ÙŠ Ø¯Ù‚ÙŠÙ‚
   ========================================================= */
function getRelativeTime(articleId) {
  if (!articleId || isNaN(articleId) || articleId < 1000000) return null;
  const now = Date.now();
  if (articleId > now + 86400000) return null;
  const diff = now - articleId;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 2) return 'Ù…Ù†Ø° Ù„Ø­Ø¸Ø§Øª';
  if (minutes < 60) return `Ù…Ù†Ø° ${minutes} Ø¯Ù‚ÙŠÙ‚Ø©`;
  if (hours === 1) return 'Ù…Ù†Ø° Ø³Ø§Ø¹Ø©';
  if (hours === 2) return 'Ù…Ù†Ø° Ø³Ø§Ø¹ØªÙŠÙ†';
  if (hours < 11) return `Ù…Ù†Ø° ${hours} Ø³Ø§Ø¹Ø§Øª`;
  if (hours < 24) return `Ù…Ù†Ø° ${hours} Ø³Ø§Ø¹Ø©`;
  if (days === 1) return 'Ø£Ù…Ø³';
  if (days === 2) return 'Ù…Ù†Ø° ÙŠÙˆÙ…ÙŠÙ†';
  if (days < 7) return `Ù…Ù†Ø° ${days} Ø£ÙŠØ§Ù…`;
  if (days < 14) return 'Ù…Ù†Ø° Ø£Ø³Ø¨ÙˆØ¹';
  if (days < 30) return 'Ù…Ù†Ø° Ø£Ø³Ø¨ÙˆØ¹ÙŠÙ†';
  return `Ù…Ù†Ø° ${Math.floor(days/30)} Ø´Ù‡Ø±`;
}


/* â”€â”€ View Tracking (localStorage) â”€â”€ */
function getViewCounts() {
  try { return JSON.parse(localStorage.getItem('tdn_views') || '{}'); } catch { return {}; }
}

function incrementView(id) {
  const counts = getViewCounts();
  counts[id] = (counts[id] || 0) + 1;
  localStorage.setItem('tdn_views', JSON.stringify(counts));
}

/* â”€â”€ Get display date from multiple sources â”€â”€ */
function getArticleDateDisplay(article) {
  const rt = getRelativeTime(article.id);
  if (rt) return rt;
  if (article.date && !article.date.includes('Ù…Ù†Ø°')) return article.date;
  if (article.publishedAt) {
    const ts = new Date(article.publishedAt).getTime();
    const rt2 = getRelativeTime(ts);
    if (rt2) return rt2;
  }
  if (article.date) return article.date;
  return 'Ù…Ù†Ø° Ù„Ø­Ø¸Ø§Øª';
}

/* â”€â”€ Live Refresh â”€â”€ */
function refreshLiveUI() {
  document.querySelectorAll('.rt-date').forEach(el => {
    const id = parseInt(el.dataset.articleId, 10);
    const article = articles.find(a => a.id === id);
    if (id && article) el.textContent = getArticleDateDisplay(article);
    else if (id) el.textContent = getRelativeTime(id) || 'Ù…Ù†Ø° Ù„Ø­Ø¸Ø§Øª';
  });
  document.querySelectorAll('.rt-view').forEach(el => {
    const id = parseInt(el.dataset.articleId, 10);
    if (id) {
      const vc = getViewCounts();
      el.textContent = vc[id] || 0;
    }
  });
  renderTrending();
}

/* â”€â”€ Sample Data â”€â”€ */
let articles = [];

/* â”€â”€ Fallback sample data (used if articles/index.json fetch fails) â”€â”€ */
const FALLBACK_ARTICLES = [
  {
    id: 1,
    title: "OpenAI ØªØ·Ù„Ù‚ GPT-5 Ø¨Ù‚Ø¯Ø±Ø§Øª ØªÙÙˆÙ‚ ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø®Ø¨Ø±Ø§Ø¡",
    excerpt: "ÙƒØ´ÙØª Ø´Ø±ÙƒØ© OpenAI Ø§Ù„Ù†Ù‚Ø§Ø¨ Ø¹Ù† Ø§Ù„Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø§Ù…Ø³ Ù…Ù† Ù†Ù…ÙˆØ°Ø¬Ù‡Ø§ Ø§Ù„Ø´Ù‡ÙŠØ± Ø¨Ù…Ø²Ø§ÙŠØ§ ØºÙŠØ± Ù…Ø³Ø¨ÙˆÙ‚Ø© ØªØªØ¬Ø§ÙˆØ² ÙƒÙ„ Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„ØªÙŠ Ø£Ø·Ù„Ù‚Ù‡Ø§ Ø®Ø¨Ø±Ø§Ø¡ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø­ÙˆÙ„ Ø§Ù„Ø¹Ø§Ù„Ù….",
    category: "Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    date: "Ù…Ù†Ø° Ø³Ø§Ø¹ØªÙŠÙ†",
    readTime: "4 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: true,
    featured: true
  },
  {
    id: 2,
    title: "Ø³Ø§Ù…Ø³ÙˆÙ†Ø¬ ØªÙƒØ´Ù Ø¹Ù† Galaxy S25 Ø¨Ø´Ø§Ø´Ø© Ø£ÙƒØ«Ø± Ø¥Ø´Ø±Ø§Ù‚Ø§Ù‹",
    excerpt: "Ø£Ø¹Ù„Ù†Øª Ø³Ø§Ù…Ø³ÙˆÙ†Ø¬ Ø±Ø³Ù…ÙŠØ§Ù‹ Ø¹Ù† Ù‡Ø§ØªÙ Galaxy S25 Ø§Ù„Ø¬Ø¯ÙŠØ¯ Ø¨Ù…Ø¹Ø§Ù„Ø¬ Snapdragon 8 Elite ÙˆÙƒØ§Ù…ÙŠØ±Ø§ Ù…Ø­Ø³Ù‘Ù†Ø© Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ.",
    category: "Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
    date: "Ù…Ù†Ø° 5 Ø³Ø§Ø¹Ø§Øª",
    readTime: "3 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: true,
    featured: false
  },
  {
    id: 3,
    title: "Ø«ØºØ±Ø© Ø£Ù…Ù†ÙŠØ© Ø®Ø·ÙŠØ±Ø© ØªÙ‡Ø¯Ø¯ Ù…Ù„Ø§ÙŠÙŠÙ† Ù…Ø³ØªØ®Ø¯Ù…ÙŠ Ø£Ù†Ø¯Ø±ÙˆÙŠØ¯",
    excerpt: "Ø§ÙƒØªØ´Ù Ø¨Ø§Ø­Ø«Ùˆ Ø§Ù„Ø£Ù…Ù† Ø§Ù„Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ Ø«ØºØ±Ø© Ø®Ø·ÙŠØ±Ø© ÙÙŠ Ù†Ø¸Ø§Ù… Ø£Ù†Ø¯Ø±ÙˆÙŠØ¯ ØªØ¤Ø«Ø± Ø¹Ù„Ù‰ Ø£ÙƒØ«Ø± Ù…Ù† Ù…Ù„ÙŠØ§Ø± Ø¬Ù‡Ø§Ø² Ø­ÙˆÙ„ Ø§Ù„Ø¹Ø§Ù„Ù….",
    category: "Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    date: "Ù…Ù†Ø° 8 Ø³Ø§Ø¹Ø§Øª",
    readTime: "5 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 4,
    title: "Ø¬ÙˆØ¬Ù„ ØªØ³ØªØ«Ù…Ø± 10 Ù…Ù„ÙŠØ§Ø± Ø¯ÙˆÙ„Ø§Ø± ÙÙŠ Ø§Ù„Ø¨Ù†ÙŠØ© Ø§Ù„ØªØ­ØªÙŠØ© Ù„Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ",
    excerpt: "Ø£Ø¹Ù„Ù†Øª Ø´Ø±ÙƒØ© Ø¬ÙˆØ¬Ù„ Ø¹Ù† Ø®Ø·Ø© Ø§Ø³ØªØ«Ù…Ø§Ø±ÙŠØ© Ø¶Ø®Ù…Ø© Ù„ØªÙˆØ³ÙŠØ¹ Ø¨Ù†ÙŠØªÙ‡Ø§ Ø§Ù„ØªØ­ØªÙŠØ© Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø®Ù„Ø§Ù„ Ø§Ù„Ø¹Ø§Ù… Ø§Ù„Ø¬Ø§Ø±ÙŠ.",
    category: "Ø´Ø±ÙƒØ§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©",
    image: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&q=80",
    date: "Ø£Ù…Ø³",
    readTime: "6 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 5,
    title: "Ù…ØµØ± ØªØ·Ù„Ù‚ Ø£ÙˆÙ„ Ù…Ù†ØµØ© Ø­ÙƒÙˆÙ…ÙŠØ© Ù„Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ",
    excerpt: "Ø£Ø·Ù„Ù‚Øª Ø§Ù„Ø­ÙƒÙˆÙ…Ø© Ø§Ù„Ù…ØµØ±ÙŠØ© Ù…Ù†ØµØªÙ‡Ø§ Ø§Ù„Ø±Ù‚Ù…ÙŠØ© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ…Ø© Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ù„ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø­ÙƒÙˆÙ…ÙŠØ©.",
    category: "Ù…ØµØ± ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ©",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
    date: "Ù…Ù†Ø° ÙŠÙˆÙ…ÙŠÙ†",
    readTime: "4 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: true,
    featured: false
  },
  {
    id: 6,
    title: "Ø£Ø¨Ù„ ØªØ®ØªØ¨Ø± Ù…ÙŠØ²Ø© Ø§Ù„Ø´Ø­Ù† Ø§Ù„Ù„Ø§Ø³Ù„ÙƒÙŠ Ø§Ù„ÙØ§Ø¦Ù‚ Ø§Ù„Ø³Ø±Ø¹Ø© ÙÙŠ iPhone 17",
    excerpt: "ØªÙƒØ´Ù Ø§Ù„ØªØ³Ø±ÙŠØ¨Ø§Øª Ø§Ù„Ø£Ø®ÙŠØ±Ø© Ø£Ù† Ø£Ø¨Ù„ ØªØ¹Ù…Ù„ Ø¹Ù„Ù‰ ØªÙ‚Ù†ÙŠØ© Ø´Ø­Ù† Ù„Ø§Ø³Ù„ÙƒÙŠ Ø¨Ù‚Ø¯Ø±Ø© 50 ÙˆØ§Ø· ÙÙŠ Ø¬ÙŠÙ„ iPhone Ø§Ù„Ù‚Ø§Ø¯Ù….",
    category: "Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
    date: "Ù…Ù†Ø° 3 Ø£ÙŠØ§Ù…",
    readTime: "3 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 7,
    title: "ØªØ³Ù„Ø§ ØªÙƒØ´Ù Ø¹Ù† Ø±ÙˆØ¨ÙˆØª Optimus Ø§Ù„Ø¬Ø¯ÙŠØ¯ Ø¨Ù‚Ø¯Ø±Ø§Øª Ù…Ø°Ù‡Ù„Ø©",
    excerpt: "Ø¹Ø±Ø¶Øª Ø´Ø±ÙƒØ© ØªØ³Ù„Ø§ Ø§Ù„Ø¬ÙŠÙ„ Ø§Ù„Ø«Ø§Ù†ÙŠ Ù…Ù† Ø±ÙˆØ¨ÙˆØªÙ‡Ø§ Ø§Ù„Ø¥Ù†Ø³Ø§Ù†ÙŠ Optimus Ø§Ù„Ø°ÙŠ ÙŠØ³ØªØ·ÙŠØ¹ Ø£Ø¯Ø§Ø¡ Ù…Ù‡Ø§Ù… Ù…Ù†Ø²Ù„ÙŠØ© Ù…Ø¹Ù‚Ø¯Ø© Ø¨Ø§Ø³ØªÙ‚Ù„Ø§Ù„ÙŠØ© Ø¹Ø§Ù„ÙŠØ©.",
    category: "Ø³ÙŠØ§Ø±Ø§Øª ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©",
    image: "https://images.unsplash.com/photo-1561144257-e32e8506e647?w=800&q=80",
    date: "Ù…Ù†Ø° 4 Ø£ÙŠØ§Ù…",
    readTime: "5 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 8,
    title: "Ù…ÙŠÙƒØ±ÙˆØ³ÙˆÙØª ØªØ¯Ù…Ø¬ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ÙÙŠ ÙƒÙ„ Ù…Ù†ØªØ¬Ø§ØªÙ‡Ø§ Ø®Ù„Ø§Ù„ 2025",
    excerpt: "Ø£Ø¹Ù„Ù†Øª Ø´Ø±ÙƒØ© Ù…ÙŠÙƒØ±ÙˆØ³ÙˆÙØª Ø¹Ù† Ø®Ø·ØªÙ‡Ø§ Ø§Ù„Ø´Ø§Ù…Ù„Ø© Ù„Ø¯Ù…Ø¬ Ù†Ù…Ø§Ø°Ø¬ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ÙÙŠ Ø¬Ù…ÙŠØ¹ ØªØ·Ø¨ÙŠÙ‚Ø§ØªÙ‡Ø§ Ø¨Ù…Ø§ ÙÙŠÙ‡Ø§ Office ÙˆWindows.",
    category: "Ø´Ø±ÙƒØ§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©",
    image: "https://images.unsplash.com/photo-1642952469120-eed4b65104be?w=800&q=80",
    date: "Ù…Ù†Ø° 5 Ø£ÙŠØ§Ù…",
    readTime: "4 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 9,
    title: "ØªÙ‚Ø±ÙŠØ±: Ù…Ø¨ÙŠØ¹Ø§Øª Ø§Ù„Ù‡ÙˆØ§ØªÙ Ø§Ù„Ø°ÙƒÙŠØ© ØªØ±ØªÙØ¹ 12% ÙÙŠ Ù…ØµØ± Ø¹Ø§Ù… 2024",
    excerpt: "ÙƒØ´Ù ØªÙ‚Ø±ÙŠØ± Ø­Ø¯ÙŠØ« Ø¹Ù† Ø§Ø±ØªÙØ§Ø¹ Ù…Ù„Ø­ÙˆØ¸ ÙÙŠ Ù…Ø¨ÙŠØ¹Ø§Øª Ø§Ù„Ù‡ÙˆØ§ØªÙ Ø§Ù„Ø°ÙƒÙŠØ© ÙÙŠ Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ù…ØµØ±ÙŠØ© Ø®Ù„Ø§Ù„ Ø§Ù„Ø¹Ø§Ù… Ø§Ù„Ù…Ø§Ø¶ÙŠ Ø±ØºÙ… Ø§Ù„ØªØ­Ø¯ÙŠØ§Øª Ø§Ù„Ø§Ù‚ØªØµØ§Ø¯ÙŠØ©.",
    category: "Ù…ØµØ± ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ©",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    date: "Ù…Ù†Ø° Ø£Ø³Ø¨ÙˆØ¹",
    readTime: "3 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: true,
    featured: false
  },
  {
    id: 10,
    title: "Sony ØªØ·Ù„Ù‚ WH-1000XM6 Ø¨Ø¹Ø²Ù„ ØµÙˆØª Ø£Ø°ÙƒÙ‰ ÙˆØ¨Ø·Ø§Ø±ÙŠØ© Ø£Ø·ÙˆÙ„",
    excerpt: "ÙƒØ´ÙØª Ø³ÙˆÙ†ÙŠ Ø¹Ù† Ø¬ÙŠÙ„ Ø¬Ø¯ÙŠØ¯ Ù…Ù† Ø³Ù…Ø§Ø¹Ø§ØªÙ‡Ø§ Ø§Ù„Ø±Ø§Ø¦Ø¯Ø© Ù…Ø¹ ØªØ­Ø³ÙŠÙ†Ø§Øª ÙƒØ¨ÙŠØ±Ø© ÙÙŠ Ø¹Ø²Ù„ Ø§Ù„Ø¶ÙˆØ¶Ø§Ø¡ Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ÙˆØ¹Ù…Ø± Ø¨Ø·Ø§Ø±ÙŠØ© ÙŠØµÙ„ Ø¥Ù„Ù‰ 40 Ø³Ø§Ø¹Ø©.",
    category: "Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    date: "Ù…Ù†Ø° Ø£Ø³Ø¨ÙˆØ¹",
    readTime: "4 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 11,
    title: "Ù‡Ø§ÙƒØ± ÙŠØ³ØªØºÙ„ Ø«ØºØ±Ø© ÙÙŠ ChatGPT Ù„Ø§Ø®ØªØ±Ø§Ù‚ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†",
    excerpt: "Ø§ÙƒØªØ´Ù Ø¨Ø§Ø­Ø«ÙˆÙ† ÙÙŠ Ø§Ù„Ø£Ù…Ù† Ø§Ù„Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ Ø·Ø±ÙŠÙ‚Ø© Ø¬Ø¯ÙŠØ¯Ø© Ù„Ø§Ø³ØªØºÙ„Ø§Ù„ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø°Ø§ÙƒØ±Ø© ChatGPT Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ø­Ø³Ø§Ø³Ø©.",
    category: "Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ",
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&q=80",
    date: "Ù…Ù†Ø° Ø£Ø³Ø¨ÙˆØ¹ÙŠÙ†",
    readTime: "6 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: false,
    featured: false
  },
  {
    id: 12,
    title: "Nvidia ØªØ·Ù„Ù‚ Ø¨Ø·Ø§Ù‚Ø© RTX 5090 Ø¨Ø£Ø¯Ø§Ø¡ ÙŠØªØ¬Ø§ÙˆØ² Ø§Ù„Ø¬ÙŠÙ„ Ø§Ù„Ù…Ø§Ø¶ÙŠ Ø¨Ù…Ø±ØªÙŠÙ†",
    excerpt: "Ø£Ø·Ù„Ù‚Øª Nvidia Ø¨Ø·Ø§Ù‚ØªÙ‡Ø§ Ø§Ù„Ø±Ø³ÙˆÙ…ÙŠØ© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© RTX 5090 Ø§Ù„ØªÙŠ ØªØ¹Ø¯ Ø¨Ø£Ø¯Ø§Ø¡ Ù…Ø¶Ø§Ø¹Ù ÙÙŠ Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨ ÙˆØ§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ù…Ù‚Ø§Ø±Ù†Ø©Ù‹ Ø¨Ù€ RTX 4090.",
    category: "Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
    date: "Ù…Ù†Ø° Ø£Ø³Ø¨ÙˆØ¹ÙŠÙ†",
    readTime: "5 Ø¯Ù‚Ø§Ø¦Ù‚",
    hasEgyptImpact: false,
    featured: false
  }
];

/* â”€â”€ Category maps â”€â”€ */
const catClass = {
  'Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ':    'cat-ai',
  'Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©':      'cat-phone',
  'Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ':     'cat-security',
  'Ø´Ø±ÙƒØ§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©':   'cat-company',
  'Ù…ØµØ± ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ©':    'cat-egypt',
  'Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª':      'cat-elec',
  'Ø³ÙŠØ§Ø±Ø§Øª ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©': 'cat-car'
};

const CAT_ALIASES = {
  'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ': 'Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',
  'Ø§Ù„ØªÙ„ÙŠÙÙˆÙ†Ø§Øª': 'Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ©',
  'Ø§Ù„Ø£Ù…Ù† Ø§Ù„Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ': 'Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ',
  'Ø§Ù„Ø´Ø±ÙƒØ§Øª': 'Ø´Ø±ÙƒØ§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©',
  'Ù…ØµØ± ÙˆØ§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§': 'Ù…ØµØ± ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ©',
  'Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª': 'Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª',
  'Ø§Ù„Ø³ÙŠØ§Ø±Ø§Øª': 'Ø³ÙŠØ§Ø±Ø§Øª ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©'
};

function normalizeCategory(cat) {
  return CAT_ALIASES[cat] || cat;
}

/* â”€â”€ State â”€â”€ */
const PAGE_SIZE = 6;
let currentFilter = 'Ø§Ù„ÙƒÙ„';
let currentPage   = 1;

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initDatetimeBar();
  const isArticlePage = document.body.classList.contains('article-page');

  async function loadArticles() {
    try {
      const res = await fetch('articles/index.json');
      if (res.ok) {
        const remote = await res.json();
        const ids = new Set(remote.map(a => a.id));
        articles = [
          ...remote.map(a => ({ ...a, category: normalizeCategory(a.category) })),
          ...FALLBACK_ARTICLES.filter(a => !ids.has(a.id))
        ];
      } else {
        articles = [...FALLBACK_ARTICLES];
      }
    } catch {
      articles = [...FALLBACK_ARTICLES];
    }
  }

  (async () => {
    await loadArticles();
    initDatetimeBar();
    initTicker();
    initHamburger();
    initSearch();
    initNewsletterForms();

    if (isArticlePage) {
      initArticlePage();
    } else {
      renderHero();
      renderArticles();
      renderTrending();
      initCategoryFilter();
      initLoadMore();
      lazyLoadImages();
    }

    setInterval(refreshLiveUI, 30000);
  })();
});

/* =========================================================
   1. TICKER
   ========================================================= */
function initTicker() {
  const content = document.getElementById('tickerContent');
  if (!content) return;
  // Clone for seamless loop
  const clone = content.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  content.parentNode.appendChild(clone);
}

/* =========================================================
   2. HAMBURGER
   ========================================================= */
function initHamburger() {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    nav.setAttribute('aria-hidden', !isOpen);
    btn.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !nav.contains(e.target) && nav.classList.contains('open')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      btn.querySelector('i').className = 'fas fa-bars';
    }
  });

  // Close on link click & handle nav filter
  nav.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      btn.querySelector('i').className = 'fas fa-bars';

      const filter = link.dataset.filter;
      if (filter) {
        filterByCategory(filter);
        // Sync desktop cat pills
        syncCatPills(filter);
      }
    });
  });

  // Desktop nav links with data-filter
  document.querySelectorAll('.nav-link[data-filter]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      filterByCategory(link.dataset.filter);
      syncCatPills(link.dataset.filter);
      // Scroll to articles
      document.getElementById('articlesGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* =========================================================
   3. CATEGORY FILTER
   ========================================================= */
function initCategoryFilter() {
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.dataset.category;
      filterByCategory(cat);
    });
  });
}

function filterByCategory(category) {
  currentFilter = category;
  currentPage   = 1;
  syncCatPills(category);

  const normMap = {};
  articles.forEach(a => {
    const nc = normalizeCategory(a.category);
    if (!normMap[nc]) normMap[nc] = [];
    normMap[nc].push(a);
  });

  renderHero();
  renderArticles();
  document.getElementById('heroSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function syncCatPills(category) {
  document.querySelectorAll('.cat-pill').forEach(p => {
    const isActive = p.dataset.category === category;
    p.classList.toggle('active', isActive);
    p.setAttribute('aria-pressed', isActive);
  });
}

/* =========================================================
   4. HERO SECTION
   ========================================================= */
function renderHero() {
  const hero = document.getElementById('heroSection');
  if (!hero) return;

  const pool = currentFilter === 'Ø§Ù„ÙƒÙ„'
    ? articles
    : articles.filter(a => normalizeCategory(a.category) === currentFilter);

  const featured = pool.find(a => a.featured) || pool[0];
  if (!featured) { hero.innerHTML = ''; return; }

  const heroCounts = getViewCounts();
  const heroNormCat = normalizeCategory(featured.category);
  hero.innerHTML = `
    <div class="hero-inner">
      <img class="hero-bg" src="${featured.image}" alt="${escapeHtml(featured.title)}" loading="eager" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="hero-cat-badge">${escapeHtml(heroNormCat)}</span>
        <h2 class="hero-headline">${escapeHtml(featured.title)}</h2>
        <p class="hero-desc">${escapeHtml(featured.excerpt)}</p>
        <div class="hero-meta">
          <span class="hero-meta-item"><i class="far fa-calendar-alt" aria-hidden="true"></i> <span class="rt-date" data-article-id="${featured.id}">${getArticleDateDisplay(featured)}</span></span>
          <span class="hero-meta-item"><i class="far fa-clock" aria-hidden="true"></i> ${escapeHtml(featured.readTime)}</span>
          <span class="hero-meta-item"><i class="far fa-eye" aria-hidden="true"></i> <span class="rt-view" data-article-id="${featured.id}">${heroCounts[featured.id] || 0}</span> Ù…Ø´Ø§Ù‡Ø¯Ø©</span>
        </div>
        <a href="article.html?id=${featured.id}" class="hero-read-btn" aria-label="Ø§Ù‚Ø±Ø£ Ø§Ù„Ù…Ø²ÙŠØ¯ Ø¹Ù† ${escapeHtml(featured.title)}">
          Ø§Ù‚Ø±Ø£ Ø§Ù„Ù…Ø²ÙŠØ¯ <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </a>
      </div>
    </div>
  `;
}

/* =========================================================
   5. ARTICLES GRID
   ========================================================= */
function renderArticles() {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;

  const pool = currentFilter === 'Ø§Ù„ÙƒÙ„'
    ? articles
    : articles.filter(a => normalizeCategory(a.category) === currentFilter);

  const gridItems = currentFilter === 'Ø§Ù„ÙƒÙ„'
    ? pool.filter(a => !a.featured)
    : pool;

  const visible = gridItems.slice(0, currentPage * PAGE_SIZE);

  if (visible.length === 0) {
    grid.innerHTML = `<p class="no-results-msg" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);font-family:'Tajawal',sans-serif;">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‚Ø§Ù„Ø§Øª ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ØªØµÙ†ÙŠÙ Ø­Ø§Ù„ÙŠØ§Ù‹.</p>`;
    updateLoadMoreBtn(0, 0);
    return;
  }

  grid.innerHTML = visible.map((a, i) => buildCard(a, i)).join('');
  updateLoadMoreBtn(visible.length, gridItems.length);
  lazyLoadImages();
}

function buildCard(article, index) {
  const normCat = normalizeCategory(article.category);
  const cls = catClass[normCat] || 'cat-ai';
  const delay = (index % PAGE_SIZE) * 0.07;
  const vc = getViewCounts();
  const egyptBadge = article.hasEgyptImpact
    ? `<span class="egypt-badge">â˜… ÙŠØ´Ù…Ù„ ØªØ£Ø«ÙŠØ± Ù…ØµØ±</span>`
    : '';
  return `
    <a href="article.html?id=${article.id}" class="article-card" data-category="${escapeHtml(article.category)}"
       style="animation-delay:${delay}s" aria-label="${escapeHtml(article.title)}">
      <div class="card-img-wrapper">
        <img class="card-img lazy" data-src="${article.image}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect fill='%23D6EAF8' width='800' height='450'/%3E%3C/svg%3E"
          alt="${escapeHtml(article.title)}" loading="lazy" />
        <span class="card-cat-badge ${cls}">${escapeHtml(normCat)}</span>
      </div>
      <div class="card-body">
        <h3 class="card-headline">${escapeHtml(article.title)}</h3>
        <p class="card-excerpt">${escapeHtml(article.excerpt)}</p>
        <div class="card-footer">
          <div class="card-meta">
            <span class="card-meta-item"><i class="far fa-calendar-alt" aria-hidden="true"></i> <span class="rt-date" data-article-id="${article.id}">${getArticleDateDisplay(article)}</span></span>
            <span class="card-meta-item"><i class="far fa-clock" aria-hidden="true"></i> ${escapeHtml(article.readTime)}</span>
            <span class="card-meta-item"><i class="far fa-eye" aria-hidden="true"></i> <span class="rt-view" data-article-id="${article.id}">${vc[article.id] || 0}</span></span>
          </div>
          ${egyptBadge}
        </div>
      </div>
    </a>
  `;
}

/* =========================================================
   6. LOAD MORE
   ========================================================= */
function initLoadMore() {
  const btn = document.getElementById('loadMoreBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    currentPage++;
    renderArticles();
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function updateLoadMoreBtn(shown, total) {
  const btn = document.getElementById('loadMoreBtn');
  if (!btn) return;
  btn.classList.toggle('hidden', shown >= total);
}

/* =========================================================
   7. TRENDING SIDEBAR
   ========================================================= */
function renderTrending() {
  const list = document.getElementById('trendingList');
  if (!list) return;

  const counts = getViewCounts();
  const top5 = [...articles]
    .map(a => ({ ...a, _views: counts[a.id] || 0, _cat: normalizeCategory(a.category) }))
    .sort((a, b) => b._views - a._views)
    .slice(0, 5);

  list.innerHTML = top5.map((a, i) => `
    <li class="trending-item" onclick="location.href='article.html?id=${a.id}'" role="button" tabindex="0"
        aria-label="${escapeHtml(a.title)}"
        onkeydown="if(event.key==='Enter')location.href='article.html?id=${a.id}'">
      <span class="trending-num" aria-hidden="true">0${i + 1}</span>
      <div class="trending-info">
        <p class="trending-title">${escapeHtml(a.title)}</p>
        <span class="trending-date"><i class="far fa-eye" aria-hidden="true"></i> ${a._views} Ù‚Ø±Ø§Ø¡Ø©</span>
      </div>
    </li>
  `).join('');
}

/* =========================================================
   8. SEARCH OVERLAY
   ========================================================= */
function initSearch() {
  const overlay  = document.getElementById('searchOverlay');
  const toggle   = document.getElementById('searchToggle');
  const closeBtn = document.getElementById('searchClose');
  const input    = document.getElementById('searchInput');
  const results  = document.getElementById('searchResults');
  if (!overlay || !toggle) return;

  toggle.addEventListener('click', openSearch);
  closeBtn?.addEventListener('click', closeSearch);

  // Close on overlay backdrop click
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeSearch();
  });

  let debounceTimer;
  input?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(input.value.trim(), results), 300);
  });

  function openSearch() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => input?.focus(), 50);
  }

  function closeSearch() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (input) { input.value = ''; }
    if (results) results.innerHTML = '<p class="search-hint">Ø§ÙƒØªØ¨ Ù„Ù„Ø¨Ø­Ø« ÙÙŠ Ø£Ø®Ø¨Ø§Ø± Ø§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§...</p>';
  }
}

function doSearch(query, resultsEl) {
  if (!query) {
    resultsEl.innerHTML = '<p class="search-hint">Ø§ÙƒØªØ¨ Ù„Ù„Ø¨Ø­Ø« ÙÙŠ Ø£Ø®Ø¨Ø§Ø± Ø§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§...</p>';
    return;
  }
  const q = query.toLowerCase();
  const found = articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    normalizeCategory(a.category).toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q)
  );

  if (found.length === 0) {
    resultsEl.innerHTML = `<p class="no-results">Ù„Ù… Ù†Ø¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù„Ù€ "<strong>${escapeHtml(query)}</strong>"</p>`;
    return;
  }

  resultsEl.innerHTML = found.map(a => {
    const vc = getViewCounts();
    return `
    <a href="article.html?id=${a.id}" class="search-result-card">
      <img class="search-result-img" src="${a.image}" alt="${escapeHtml(a.title)}" loading="lazy" />
      <div class="search-result-info">
        <p class="search-result-title">${escapeHtml(a.title)}</p>
        <span class="search-result-cat">${escapeHtml(normalizeCategory(a.category))} Â· <span class="rt-date" data-article-id="${a.id}">${getArticleDateDisplay(a)}</span> Â· <i class="far fa-eye" aria-hidden="true"></i> ${vc[a.id] || 0}</span>
      </div>
    </a>`; }).join('');
}

/* =========================================================
   9. LAZY LOAD IMAGES
   ========================================================= */
function lazyLoadImages() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all
    document.querySelectorAll('img.lazy').forEach(img => {
      if (img.dataset.src) { img.src = img.dataset.src; img.classList.remove('lazy'); }
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy');
        }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });

  document.querySelectorAll('img.lazy').forEach(img => observer.observe(img));
}

/* =========================================================
   10. NEWSLETTER FORMS
   ========================================================= */
function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form, .footer-newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast('Ø´ÙƒØ±Ø§Ù‹! ØªÙ… Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ ÙÙŠ Ø§Ù„Ù†Ø´Ø±Ø© Ø§Ù„Ø¨Ø±ÙŠØ¯ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­ âœ“');
        input.value = '';
      }
    });
  });
}

/* =========================================================
   11. ARTICLE PAGE
   ========================================================= */
function initArticlePage() {
  const params     = new URLSearchParams(window.location.search);
  const id         = parseInt(params.get('id') || '1', 10);
  const article    = articles.find(a => a.id === id) || articles[0];

  // Update meta
  document.title   = `${article.title} â€” Tech Dose News`;
  setMeta('og:title', article.title);
  setMeta('og:image', article.image);
  setMeta('og:description', article.excerpt);

  // Breadcrumb
  setEl('breadcrumbCategory', article.category);
  setEl('breadcrumbTitle', article.title);

  const normCat = normalizeCategory(article.category);

  // Meta top
  const badge = document.getElementById('articleCatBadge');
  if (badge) {
    badge.textContent = normCat;
    badge.className   = `article-cat-badge ${catClass[normCat] || 'cat-ai'}`;
  }
  setEl('articleReadTime', article.readTime);
  setEl('articleDate', getArticleDateDisplay(article));
  incrementView(id);
  const vc = getViewCounts();
  setEl('articleViews', (vc[id] || 0) + ' Ù…Ø´Ø§Ù‡Ø¯Ø©');

  // Headline & image
  setEl('articleHeadline', article.title);
  const img = document.getElementById('articleImage');
  if (img) { img.src = article.image; img.alt = article.title; }
  setEl('articleCaption', `ØµÙˆØ±Ø©: ${article.title}`);

  // Article body
  const bodyEl = document.getElementById('articleBody');
  if (bodyEl && article.body) bodyEl.innerHTML = article.body;

  // Egypt impact box
  const egyptBox = document.getElementById('egyptImpactBox');
  const egyptBody = document.getElementById('egyptImpactBody');
  if (article.hasEgyptImpact && article.egyptImpact) {
    if (egyptBox) egyptBox.style.display = 'block';
    if (egyptBody) egyptBody.innerHTML = article.egyptImpact;
  } else {
    if (egyptBox) egyptBox.style.display = 'none';
  }

  // Dynamic source
  const sourceEl = document.querySelector('.article-source span');
  if (sourceEl) {
    const src = article.source || article.sourceName || '';
    sourceEl.textContent = src
      ? `Ø§Ù„Ù…ØµØ¯Ø±: ${escapeHtml(src)} | Ø£ÙØ¹ÙŠØ¯Øª ÙƒØªØ§Ø¨ØªÙ‡ Ø¨ÙˆØ§Ø³Ø·Ø© Tech Dose News`
      : 'Ø£ÙØ¹ÙŠØ¯Øª ÙƒØªØ§Ø¨ØªÙ‡ Ø¨ÙˆØ§Ø³Ø·Ø© Tech Dose News';
  }

  // Dynamic tags from article title + category
  renderArticleTags(article);

  // Share buttons
  const url  = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(article.title);
  setHref('shareFacebook',  `https://facebook.com/sharer/sharer.php?u=${url}`);
  setHref('shareTelegram',  `https://t.me/share/url?url=${url}&text=${text}`);
  setHref('shareWhatsapp',  `https://wa.me/?text=${text}%20${url}`);

  const copyBtn = document.getElementById('shareCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToast('ØªÙ… Ù†Ø³Ø® Ø§Ù„Ø±Ø§Ø¨Ø· âœ“'))
        .catch(() => showToast('ØªØ¹Ø°Ù‘Ø± Ù†Ø³Ø® Ø§Ù„Ø±Ø§Ø¨Ø·'));
    });
  }

  // Related articles (same category, exclude current)
  renderRelated(article);

  // Refresh date & views every 30 seconds
  const dateEl = document.getElementById('articleDate');
  const viewsEl = document.getElementById('articleViews');
  setInterval(() => {
    if (dateEl) dateEl.textContent = getArticleDateDisplay(article);
    if (viewsEl) {
      const vc2 = getViewCounts();
      viewsEl.textContent = (vc2[id] || 0) + ' Ù…Ø´Ø§Ù‡Ø¯Ø©';
    }
  }, 30000);

  // Init search & hamburger
  initTicker();
  initHamburger();
  initSearch();
  initNewsletterForms();
}

function renderArticleTags(article) {
  const container = document.getElementById('articleTags');
  if (!container) return;

  const words = (article.title || '').split(/\s+/).filter(w => w.length > 3);
  const tagSet = new Set();

  words.forEach(w => { if (w.length > 3) tagSet.add(w); });
  if (article.category) tagSet.add(article.category);

  if (article.tags && Array.isArray(article.tags)) {
    article.tags.forEach(t => tagSet.add(t));
  }

  const tags = [...tagSet].slice(0, 8);
  if (tags.length === 0) { container.style.display = 'none'; return; }

  container.style.display = 'flex';
  container.innerHTML = `<span class="tag-label"><i class="fas fa-tags" aria-hidden="true"></i> Ø§Ù„ÙˆØ³ÙˆÙ…:</span>`
    + tags.map(t => `<a href="index.html?search=${encodeURIComponent(t)}" class="tag-pill">${escapeHtml(t)}</a>`).join('');
}

function renderRelated(current) {
  const grid = document.getElementById('relatedGrid');
  if (!grid) return;
  const normCat = normalizeCategory(current.category);
  const related = articles
    .filter(a => a.id !== current.id && normalizeCategory(a.category) === normCat)
    .slice(0, 3);

  const fallback = related.length < 3
    ? articles.filter(a => a.id !== current.id && !related.includes(a)).slice(0, 3 - related.length)
    : [];

  const all = [...related, ...fallback].slice(0, 3);
  grid.innerHTML = all.map((a, i) => buildCard(a, i)).join('');
  lazyLoadImages();
}

/* =========================================================
   HELPERS
   ========================================================= */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHref(id, href) {
  const el = document.getElementById(id);
  if (el) el.href = href;
}

function setMeta(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function showToast(msg) {
  const existing = document.getElementById('tdnToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'tdnToast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:var(--navy);color:#fff;
    font-family:'Cairo',sans-serif;font-size:.95rem;font-weight:600;
    padding:14px 22px;border-radius:10px;
    box-shadow:0 6px 20px rgba(0,0,0,0.25);
    animation:fadeInUp .3s ease both;
    max-width:320px;line-height:1.5;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
