# Tech Dose News — Incidents

## Incident — 2026-05-26 — Telegram Links Broken
- **Issue**: Telegram messages were sending source article links instead of the Tech Dose News article page
- **Root cause**: `Post to Telegram` node used `a.source_link` (external URL) instead of `techdose_link` (internal article.html?id=)
- **Fix**: Changed Telegram link to `a.techdose_link || FRONTEND_URL + "/article.html?id=" + a.id`
- **Prevention**: Added HTTP GET URL verification before sending (checks status 200 + title match)
- **Tags**: telegram, url, verification

---

## Incident — 2026-05-26 — GitHub Pages Build Failing
- **Issue**: GitHub Pages deployment failed — site not building
- **Root cause**: Jekyll was processing the site, failing on JSON files without front matter
- **Fix**: Added `.nojekyll` file to repo root
- **Prevention**: N/A — one-time fix for static site setup
- **Tags**: github-pages, build, jekyll

---

## Incident — 2026-05-26 — Frontend Not Loading Articles
- **Issue**: Homepage showed no articles — blank page
- **Root cause**: `script.js` was fetching `articles/index.json` but articles were moved to `data/articles/index.json`
- **Fix**: Changed fetch path to `data/articles/index.json`
- **Prevention**: Path verification during deployment
- **Tags**: frontend, path, scriptjs

---

## Incident — 2026-05-26 — Groq API Key Typo
- **Issue**: Groq API calls returned 401 Unauthorized
- **Root cause**: API key had typo: `k7s7` instead of `k7sN`
- **Fix**: Corrected to `k7sN`
- **Prevention**: Manual verification after key entry
- **Tags**: groq, api-key, auth

---

## Incident — 2026-05-26 — Ferrari EV Duplicate Article
- **Issue**: Pipeline almost published two Ferrari EV articles from different angles
- **Root cause**: Hash-based dedup only checked exact matches; different angles had different hashes
- **Fix**: Added AI Reviewer with semantic dedup (checks topic fingerprint, not just hash)
- **Prevention**: 3-layer dedup system: hash → topic memory → AI semantic review
- **Tags**: dedup, reviewer, quality

---

## Incident — 2026-05-25 — Article Staging Gone
- **Issue**: Staged articles disappeared between v4 and v5 pipeline versions
- **Root cause**: Old `/articles/` directory deleted during cleanup before articles were migrated to `/data/articles/`
- **Fix**: Regenerated articles from S&P during v5.2.1 deployment
- **Prevention**: Migration script should copy, not delete first
- **Tags**: cleanup, migration, data-loss

---

## Incident — 2026-05-25 — Queue System Deadlock
- **Issue**: Pipeline got stuck processing the same article repeatedly
- **Root cause**: Queue-based architecture had no proper state machine; articles cycled between queues
- **Fix**: Removed queue system entirely in v5.2, replaced with single-pass pipeline
- **Prevention**: Simplified architecture eliminates queue complexity
- **Tags**: queue, deadlock, architecture

---

## Incident — 2026-05-25 — Lock Not Releasing
- **Issue**: S&P lock remained locked after failed execution, blocking all future runs
- **Root cause**: `finally` block not executing due to n8n Code node error handling
- **Fix**: Added 5-minute stale timeout for lock acquisition
- **Prevention**: Stale lock detection + timeout in `acquireLock()`
- **Tags**: lock, concurrency, timeout

---

## Incident — 2026-05-24 — Category Mismatch
- **Issue**: Writer generated articles with categories that didn't match V&V's ALLOWED list
- **Root cause**: Categories hard-coded in 3 separate places (Writer prompt, V&V, S&P CAT_MAP) — went out of sync
- **Fix**: Synced all 8 Arabic categories across Writer, V&V, and S&P
- **Prevention**: Single source of truth for category list
- **Tags**: categories, sync, config
