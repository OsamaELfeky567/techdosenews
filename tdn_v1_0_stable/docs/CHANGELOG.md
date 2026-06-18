# Tech Dose News — Changelog

## v5.4.7 — Implementation Sync Mode — docs → pipeline deployment (2026-05-26)
- Created `deploy_v547.js`: surgical patch-based deploy script targeting 5 pipeline nodes
- Orchestrator v5: improved freshness (prefer <12h), expanded rejection keywords (listicle, evergreen, "best AI tools")
- Prepare Groq Payload: expanded spam word list + forbidden Arabic phrases patched into existing code
- AI Reviewer: CALIBRATION_MODE=true flag deployed with calibration thresholds (nw>70, rv>70, spam<25)
- AI Reviewer: source-weighted trust logic (premium sources get lower spam suspicion + flexibility)
- AI Reviewer: topic saturation detection (same entity within 72h → auto reject)
- AI Reviewer: human-like editorial balance guidance added to system prompt
- Post to Telegram: 5-point verification (added body length minimum check)
- Post to Telegram: EXECUTION_SUMMARY logging after every send
- Staging & Publish v5: EXECUTION_SUMMARY logging on publish
- Production thresholds preserved as constants alongside calibration thresholds

## v5.4.6 — Live Production Recovery & Calibration Mode (2026-05-26)
- Full calibration specification saved as `docs/v5.4.6_SPEC.md`
- Activated CALIBRATION_MODE=true: temporary loosened thresholds for data collection (nw>70, rv>70, spam<25)
- Added human-like editorial balance guidance to reviewer (approve if useful/timely/informative, reject only if duplicate/fluff/bad)
- Added source-weighted trust: TechCrunch, The Verge, Wired, Ars Technica → HIGH base trust
- Added topic saturation control: auto-reject same company/product/narrative within 72h
- Improved Writer naturalness: sharp Arabic magazine editor style, forbidden phrases expanded, prefer concrete insight
- Hardened Telegram safety: 5-point pre-send verification (public existence, index slug, body length, title match, HTTP 200)
- Added EXECUTION_SUMMARY logging: source, title, reviewer scores, publish status, rejection reason, duplicate status, telegram status, duration
- Lightweight architecture reaffirmed: no queues, no lifecycle, no batch processing
- Repository audit to mark ACTIVE/LEGACY/DELETE_CANDIDATE per file
- 10 success criteria defined for production health declaration

## v5.4.5 — Production Validation & Hardening Mode (2026-05-26)
- Full production hardening specification saved as `docs/v5.4.5_SPEC.md`
- Hardened core principles: Quality > Freshness > Quantity
- Added freshness filtering rules: prefer <12h, hard reject >24h, reject evergreen listicles
- Added source-priority sequential behavior (no queue merging, one article per execution)
- Added advanced duplicate prevention: semantic, narrative, company saturation, topic saturation
- Added title quality enforcement with explicit good/bad Arabic examples
- Enforced Reviewer as final editorial authority (editor-in-chief, not spell checker)
- Simplified architecture philosophy: less moving parts = fewer failures
- Confirmed ONLY 2 active workflows: Full Pipeline + View Tracker
- All existing thresholds preserved — no quality standards loosened
- Documentation synced: ARCHITECTURE.md, CHANGELOG.md, SYSTEM_HEALTH.md

## v5.4.4 — Editorial Stress Test Mode (2026-05-26)
- Created `docs/EDITORIAL_STRESS_TEST.md`: 8 controlled scenario templates for editorial pipeline validation
- Tests: weak SEO rejection, old news rejection, duplicate topic rejection, listicle rejection, breaking news approval, deep analysis approval, cybersecurity approval, generic "Top 10" hard rejection
- Added Reviewer detection tests: generic AI tone, SEO bait, narrative duplication, strong story allowance
- Added Writer quality evaluation matrix: fluency, translation quality, structure, depth, context, repetition, AI-generic tone
- Verdict framework: does the system behave like an intelligent editor or sophisticated automation?
- No threshold changes during stress testing — observation and documentation only

## v5.4.3 — Controlled Live Calibration Mode (2026-05-26)
- Created `docs/CALIBRATION_REPORT.md`: per-execution metric tracker for 24h calibration window
- Created `docs/CALIBRATION_SUMMARY.md`: final analysis template and production readiness verdict
- Calibration tracks: execution_id, rss_candidates, freshness_pass, dedup_pass, writer_generated, reviewer_approved, published, telegram_sent, rejection_reason, article_topic, source, duration
- Added rejection analysis, quality validation, duplicate tracking, source performance tables
- Goal: reduce rejection rate from ~85% to 50–75% through observation and measurement only
- No pipeline modifications, no new nodes, no architecture changes — observation-only mode

## v5.4.2 — Documentation Synchronization & Architecture Cleanup (2026-05-26)
- Full rewrite of `ARCHITECTURE.md` to reflect real production state
- Canonical category sync: 8 categories documented and synchronized across all pipeline nodes, parser, validator, and frontend
- Category aliases removed: no legacy Arabic names, no name mapping layer — frontend and workflow now reference the same list
- GoatCounter documented as the ONLY analytics system; previous "No analytics" limitation marked RESOLVED
- AI System section restructured with two distinct roles: Writer (content creation) and Reviewer (independent quality gate)
- Repository Structure table updated with ACTIVE / LEGACY / STALE status tags
- Telegram publishing section clarified with explicit verification prerequisites
- Removed all aspirational architecture references: queues, lifecycle state machine, rollback engine, event-oriented architecture, multi-stage processing, archive pipeline, partition DB, dead observability systems
- Future Roadmap cleaned: analytics integration removed (already implemented)
- `SYSTEM_HEALTH.md` updated with current status and honest risk documentation
- Architecture docs are now part of production infrastructure: recovery reference, onboarding reference, production audit trail, disaster recovery map

## v5.3.1 — Editorial Personality & Premium Intelligence Mode (2026-05-26)
- Added `reader_curiosity_score >70` to Reviewer (7th dimension)
- Added uniqueness check vs last 20 articles (not just 72h dedup)
- Added 6 new rejection rules: boring summary, poor Arabic, SEO bait, repetitive structure, source intelligence
- Added title rules with good/bad examples to Writer prompt
- Changed Writer returns from `LOW_QUALITY_SOURCE` → `REJECT_ARTICLE`
- Strengthened Writer persona: senior journalist, deeper article structure (7 sections)
- Added slug/index.json verification to Telegram (verifies article exists before sending)
- Added debug logging tags across pipeline: `ARTICLE_VERIFIED`, `ARTICLE_PUBLISHED`, `PUBLIC_URL_CHECK`, `INDEX_UPDATED`, `TELEGRAM_URL`, `TELEGRAM_URL_FAILED`
- Added publication verification flags (`publish_verified`, `index_verified`) to S&P output
- Added `REVIEW_APPROVED` and `REVIEWER_ERROR` logging to Reviewer

## v5.3 — Editorial Quality Upgrade (2026-05-26)
- Updated Writer prompt: senior Arabic journalist persona, 10 hard rules, 6-part depth structure
- Updated Reviewer thresholds: nw>85, rv>80, clarity>80, originality>75, spam<15, ai_generic<20
- Added daily counter (max 3/day) enforced by Reviewer + S&P
- Enhanced Telegram verification: checks `hasStructure` + `bodyLength` + title match before sending
- Added frontend render verification to Telegram
- Published via `deploy_v53.js`

## v5.2.5 — Topic Memory & Category Sync (2026-05-26)
- Added `published_topics.json` for 72h dedup tracking
- Synced categories across Writer prompt, V&V ALLOWED list, S&P CAT_MAP
- Updated V&V to re-check Reviewer thresholds
- Simplified V&V: removed lifecycle state machine, simplified category aliases

## v5.2.4 — AI Reviewer Node Added (2026-05-26)
- New independent AI Reviewer node between Parse Article and Validate & Score
- Groq-based review with hard rejection rules and Newsworthiness Score
- Flexible response parsing (`decision`/`review_result`/`result` fields, nested scores)
- Fail-closed: on error → REJECTED
- Separated from V&V for independence

## v5.2.3 — Telegram Link Fix (2026-05-26)
- Changed Telegram link from source link to `techdose_link` (article.html?id=)
- Added HTTP GET verification before sending
- Logs URL, status, title match, body length
- Skips on verification failure

## v5.2.2 — GitHub Pages Fix (2026-05-26)
- Added `.nojekyll` file to disable Jekyll processing
- Pages build now succeeds

## v5.2.1 — Frontend Path Fix (2026-05-26)
- Fixed `script.js`: `fetch('articles/index.json')` → `fetch('data/articles/index.json')`
- Updated S&P index entries to include `body`, `tags`, `egyptImpact`, `link`, `techdose_link`
- Regenerated existing index with body from article files (18→22 entries)

## v5.2 — Phase 1–4: Simplified Architecture (2026-05-25)
- Removed queues, lifecycle states, dead code
- Reduced pipeline from 19→9 nodes (later 10 with reviewer)
- Cleaned GitHub repo: deleted 71 files (old `/articles/`, `/staging/`, `/backups/`, stale configs)
- Fixed Groq API key typo (`k7s7` → `k7sN`)
- Added lock system (`workflow_lock.json`, 5-min timeout)
- Added `View Tracker` workflow (unchanged since)

## v5.1 — Initial Automation (2026-05-24)
- Basic RSS → Writer → Publish → Telegram pipeline
- n8n workflow on localhost
- Orchard-based orchestrator with TechCrunch/The Verge/Wired/Ars Technica
- Basic Groq-based article generation
- GitHub Pages frontend (index.html, article.html)
- Initial admin dashboard

## v5.0 — Foundation (2026-05-22)
- Project kickoff: Tech Dose News concept
- n8n instance setup on localhost:5678
- GitHub Pages repo created: `osamaelfeky567/techdosenews`
- Telegram bot `@TechDoseNews_bot` created
- Basic frontend (index.html, article.html, script.js, style.css)
