# GA4 Deployment Report — td-arabi.com

**Project:** TechDose News (TD بالعربي)
**Date:** 2026-06-19
**Measurement ID:** G-XJD3ENNWK9
**Domain:** td-arabi.com (GitHub Pages)

---

## Phases Summary

### Phase A — Analytics Audit
- **Result:** No existing analytics on any production page
- Zero GA4, GTM, GoatCounter, Plausible, Umami, Clarity scripts found
- `admin_config.json` had empty `ga4MeasurementId` — never configured
- Only `td_analytics` (localStorage, per-browser) was active

### Phase B — Architecture
- 11 production frontend pages identified for tracking
- Pages tracked: index, article, category, 404, about, contact, terms, privacy, disclaimer, editorial-policy, dashboard
- Admin panel excluded from tracking

### Phase C — Integration
- **js/analytics.js** — centralized GA4 loader (29 lines)
  - Dynamic gtag.js loading (async, non-blocking)
  - SPA navigation support via `pushState` override + `popstate` listener
  - Deduplication guard (`window.tdnGaLoaded`)
- Injected into `<head>` with `async` attribute across all 11 HTML files
- Admin panel intentionally excluded

### Phase D — Custom Events
Three custom events added to `script.js`:
| Event | Trigger | Payload |
|---|---|---|
| `article_open` | Article page fully loaded | `article_id`, `article_title`, `article_category` |
| `telegram_click` | Telegram button clicked | (none) |
| `search_used` | Search performed (non-empty query) | `search_term` |

### Phase E — SEO Verification
- `sitemap.xml` — intact, no modifications
- `robots.txt` — intact, no modifications
- Canonical URLs — all valid, no changes
- Structured data (JSON-LD) — all valid, not affected
- Analytics.js loads with `async` — no render-blocking impact

### Phase F — Runtime Verification (Code Review)
- Script chain: `<script async src="/js/analytics.js">` → creates gtag.js dynamically → fires `page_view` on load + SPA navigation
- Custom events guarded with `typeof gtag === 'function'` — safe if gtag.js fails to load
- SPA navigation: `pushState` override fires after 100ms delay (avoids duplicate during initial render)
- `popstate` listener handles browser back/forward buttons

### Phase G — Production Validation
- Deployment is additive — no existing analytics removed or modified
- No changes to article content, sitemap, robots, or admin panel
- Rollback: remove `<script src="/js/analytics.js">` from all 11 HTML files

---

## Files Changed

| File | Change |
|---|---|
| `js/analytics.js` | **New** — GA4 loader with SPA support |
| `index.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `article.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `category.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `404.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `about.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `contact.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `terms.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `privacy.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `disclaimer.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `editorial-policy.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `dashboard.html` | Added `<script async src="/js/analytics.js">` in `<head>` |
| `script.js` | Added 3 custom events: `article_open`, `telegram_click`, `search_used` |

---

## Verification Checklist

- [x] All 11 HTML files have analytics.js
- [x] All script tags use `async` attribute
- [x] GA4 gtag.js loads dynamically (not render-blocking)
- [x] SPA navigation tracked via `pushState` + `popstate`
- [x] Custom events fire with correct payloads
- [x] Events guarded with `typeof gtag === 'function'`
- [x] No analytics on admin panel
- [x] sitemap.xml, robots.txt untouched
- [x] Structured data, canonical URLs unaffected

---

## Commit History

`feat(analytics): deploy GA4 tracking for td-arabi.com (G-XJD3ENNWK9)`

Includes: analytics.js, 11 HTML script injections, 3 custom events in script.js
