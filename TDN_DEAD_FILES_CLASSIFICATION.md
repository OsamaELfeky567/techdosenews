# TDN DEAD FILES CLASSIFICATION

**Date:** 2026-06-18  
**Source:** `git ls-files` (tracked) + `git status --short` (untracked on disk)

## LEGEND

| Action | Meaning |
|--------|---------|
| **DELETE** | Safe to delete immediately. No live references. |
| **ARCHIVE** | Backup/snapshot — zip and store before deleting. |
| **REVIEW** | Needs manual inspection before action. |

---

## GROUP 1 — SAFE TO DELETE IMMEDIATELY

### 1.1 Root-Level Diagnostic Scripts (untracked — on disk only)

All are one-time diagnostic/fix/audit scripts. **None** referenced by any HTML, JS, config, or workflow file.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `admin_validate.mjs` | Validation of admin functions (copy of admin code) | None | DELETE |
| `analyze_css_dup.mjs` | Detect CSS duplication in admin | None | DELETE |
| `audit_admin.mjs` | Admin panel audit | None | DELETE |
| `audit_editor.mjs` | Editor component audit | None | DELETE |
| `check_jslines.mjs` | Count JS lines in admin | None | DELETE |
| `check_onclicks.mjs` | Verify onclick handler binding | None | DELETE |
| `comprehensive_admin_verify.mjs` | Full admin verification | None | DELETE |
| `final_audit.mjs` | Final repo audit | None | DELETE |
| `final_check.mjs` | Final integrity check | None | DELETE |
| `find_await_deep.mjs` | Find top-level await deep | None | DELETE |
| `find_brace_imbalance.mjs` | Detect brace imbalance | None | DELETE |
| `find_css_duplication.mjs` | Find CSS duplication | None | DELETE |
| `find_css_exact_span.mjs` | Exact CSS span finder | None | DELETE |
| `find_remaining_issues.mjs` | Find remaining admin issues | None | DELETE |
| `find_syntax_error.mjs` | Find syntax errors | None | DELETE |
| `find_top_await_v2.mjs` | Find top-level await v2 | None | DELETE |
| `find_top_level_await.mjs` | Find top-level await | None | DELETE |
| `fix_admin_missing.mjs` | Fix missing admin functions | None | DELETE |
| `fix_admin_missing2.mjs` | Fix missing admin functions v2 | None | DELETE |
| `fix_admin_missing3.mjs` | Fix missing admin functions v3 | None | DELETE |
| `fix_css_duplication.mjs` | Fix CSS duplication | None | DELETE |
| `fix_css_v2.mjs` | Fix CSS v2 | None | DELETE |
| `full_audit.mjs` | Full codebase audit | None | DELETE |
| `get_editor_html.mjs` | Extract editor HTML | None | DELETE |
| `quick_check.mjs` | Quick element check (just created) | None | DELETE |
| `real_syntax_check.mjs` | Real syntax validation | None | DELETE |
| `syntax_async_check.mjs` | Async syntax validation | None | DELETE |
| `syntax_check.mjs` | Syntax validation | None | DELETE |
| `syntax_search.mjs` | Syntax search tool | None | DELETE |
| `trace_braces.mjs` | Brace tracing | None | DELETE |
| `trace_parens.mjs` | Parenthesis tracing | None | DELETE |
| `validate_js.mjs` | JavaScript validation | None | DELETE |
| `validate_js_v2.mjs` | JavaScript validation v2 | None | DELETE |
| `verify_handlers.mjs` | Handler verification | None | DELETE |
| `write_temp_js.mjs` | Write temp JS for testing | None | DELETE |

### 1.2 Tools Directory — Diagnostic Scripts (untracked — on disk only)

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `tools/discover-installation.mjs` | GitHub App installation discovery | Reports only (dead) | DELETE |
| `tools/github_app_crud_test.mjs` | GitHub App CRUD test | None | DELETE |
| `tools/phase1_audit.mjs` | Phase 1 audit (legacy) | Reports only (dead) | DELETE |
| `tools/section_b_crud.mjs` | CRUD section test (legacy) | Reports only (dead) | DELETE |
| `tools/section_c_test.mjs` | Section C test (legacy) | Reports only (dead) | DELETE |
| `tools/start-proxy.mjs` | Start gh-proxy locally | Reports only (dead) | DELETE |
| `tools/test-token-flow.mjs` | Test token authentication flow | None | DELETE |

### 1.3 Tools Directory — Health Check Scripts (untracked — on disk only)

Referenced only by dead reports (MONITORING.md, TDN_PRODUCTION_LOCKDOWN_REPORT.md). Not referenced by any live HTML/JS/config.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `tools/health_check_admin.mjs` | Validate admin panel integrity | Dead reports only | DELETE |
| `tools/health_check_articles.mjs` | Validate article index | Dead reports only | DELETE |
| `tools/health_check_frontend.mjs` | Playwright browser checks | Dead reports only | DELETE |
| `tools/health_check_images.mjs` | Verify image URLs | Dead reports only | DELETE |
| `tools/health_check_repo.mjs` | Verify critical files exist | Dead reports only | DELETE |
| `tools/health_check_sync.mjs` | Compare GitHub vs Pages sync | Dead reports only | DELETE |

### 1.4 Obsolete Reports (untracked — on disk only)

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `MONITORING.md` | Weekly monitoring schedule (superseded by governance) | None | DELETE |
| `TDN_PRODUCTION_LOCKDOWN_REPORT.md` | Production lockdown report (obsolete) | None | DELETE |

### 1.5 Obsolete n8n Workflow Export (untracked — on disk only)

Uses PAT auth (deprecated). Superseded by GitHub App + direct GitHub API calls in admin.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `production_gh_proxy.json` | n8n proxy workflow (PAT-based, obsolete) | None | DELETE |

### 1.6 Agent Config Files (untracked — on disk only)

Not application code. OpenCode agent configuration — safe to delete from repo.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `opencode.json` | OpenCode agent configuration | None | DELETE |
| `skills-lock.json` | Skill lockfile for agent | None | DELETE |

### 1.7 Dependency Config (untracked — on disk only)

Only contains `@playwright/test` — not used by live application.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `package.json` | NPM dependencies (playwright only) | None | DELETE |

### 1.8 Environment Template (untracked — on disk only)

Template is documented in governance report. Safe to delete (template values are documented in `.env.template` comments are generic).

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `.env.template` | Environment variable template | None | DELETE |

### 1.9 Data Queue/Log Files (tracked)

Artifacts from n8n pipeline. Not referenced by any live frontend or admin code. Some contain historical record.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `data/logs/ai.log` | AI pipeline log | None | DELETE |
| `data/logs/errors.log` | Error log | None | DELETE |
| `data/logs/ingest.log` | Ingest log | None | DELETE |
| `data/logs/notify.log` | Notification log | None | DELETE |
| `data/logs/publish.log` | Publish log | None | DELETE |
| `data/logs/system.log` | System log | None | DELETE |
| `data/queues/archive.json` | Archived queue | None | DELETE |
| `data/queues/content_hashes.json` | Content hash queue | None | DELETE |
| `data/queues/pending.json` | Pending queue | None | DELETE |
| `data/queues/processing.json` | Processing queue | None | DELETE |
| `data/published_links.json` | Published links record | None | DELETE |
| `data/published_topics.json` | Published topics record | None | DELETE |
| `data/content_hashes.json` | Content dedup hashes | None | DELETE |

### 1.10 Empty Gitkeep Files (tracked)

No content. Directories are created automatically when needed.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `data/articles_db/.gitkeep` | Keep directory in git | None | DELETE |
| `data/testing-output/.gitkeep` | Keep directory in git | None | DELETE |

### 1.11 Sandbox Test Articles (tracked)

Test data from pipeline development. Not referenced by any live code. (Note: `.gitignore` now covers `sandbox/`, but these were committed before the ignore rule.)

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `sandbox/articles/art-*.json` (27 files) | Stale test articles during development | None | DELETE |

### 1.12 Individual Article Source Files (tracked)

Pipeline artifacts that feed `build_index.mjs`. Since n8n pipeline now builds index.json directly (inline JS in production_workflow.json), these are no longer needed.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `data/articles/----.json` | Pipeline article source | `data/articles/index.json` (historical source) | DELETE |
| `data/articles/-17---.json` | Pipeline article source | Same | DELETE |
| `data/articles/--17--.json` | Pipeline article source | Same | DELETE |
| `data/articles/---17-.json` | Pipeline article source | Same | DELETE |
| `data/articles/--17--pixel.json` | Pipeline article source | Same | DELETE |
| `data/articles/---18-.json` | Pipeline article source | Same | DELETE |
| `data/articles/-aba---.json` | Pipeline article source | Same | DELETE |
| `data/articles/----agentic.json` | Pipeline article source | Same | DELETE |
| `data/articles/-chatgpt---.json` | Pipeline article source | Same | DELETE |
| `data/articles/--chatgpt--.json` | Pipeline article source | Same | DELETE |
| `data/articles/cohesity--maestro--.json` | Pipeline article source | Same | DELETE |
| `data/articles/-fable--anthropic-.json` | Pipeline article source | Same | DELETE |
| `data/articles/hsbc----.json` | Pipeline article source | Same | DELETE |
| `data/articles/--hsbc--google.json` | Pipeline article source | Same | DELETE |
| `data/articles/hsbc--google-cloud-.json` | Pipeline article source | Same | DELETE |
| `data/articles/index.json` | **KEEP** — article SSoT | Admin, script.js | **PROTECTED** |
| `data/articles/mazon----.json` | Pipeline article source | Same | DELETE |
| `data/articles/--pixel--.json` | Pipeline article source | Same | DELETE |
| `data/articles/---shopify-.json` | Pipeline article source | Same | DELETE |
| `data/articles/----spacex.json` | Pipeline article source | Same | DELETE |
| `data/articles/-state-farm--.json` | Pipeline article source | Same | DELETE |
| `data/articles/---trend-hunter.json` | Pipeline article source | Same | DELETE |

---

## GROUP 2 — ARCHIVE ONLY

### 2.1 `backup_cleanup_final/` (untracked — 1,528 files on disk)

Full directory snapshot — multiple generations of nested backups. Contains copies of entire site at various points.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `backup_cleanup_final/` | Massive nested backup directory | None | **ARCHIVE** — zip to external storage, then DELETE from disk |

### 2.2 `backup_admin_finalization/` (untracked — 6 files on disk)

Snapshot of admin/index.html + related files from before latest admin finalization.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `backup_admin_finalization/` | Pre-admin-finalization backup | None | **ARCHIVE** — zip to external storage, then DELETE from disk |

### 2.3 `tdn_v1_0_stable/` (tracked — 38 files)

Complete snapshot of the production site at v1.0 stable release point. Duplicates entire production site (SSoT violation — HIGH severity).

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `tdn_v1_0_stable/admin/admin_config.json` | Archived config copy | None | **ARCHIVE** — `git rm`, zip to external storage |
| `tdn_v1_0_stable/admin/index.html` | Archived admin panel | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/config/.env.template` | Archived env template | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/config/opencode.json` | Archived agent config | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/config/package.json` | Archived deps | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/data/articles/index.json` | Archived article index | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/data/categories.json` | Archived categories | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/data/content_hashes.json` | Archived hashes | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/data/health.json` | Archived health check | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/data/near_miss.json` | Archived near-miss data | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/data/published_links.json` | Archived links | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/data/published_topics.json` | Archived topics | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/data/quality_config.json` | Archived quality config | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/data/workflow_lock.json` | Archived lock file | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/docs/*.md` (11 files) | Archived documentation | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/frontend/*.html` (12 files) | Archived frontend pages | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/frontend/robots.txt` | Archived robots | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/frontend/script.js` | Archived JS | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/frontend/sitemap.xml` | Archived sitemap | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/frontend/style.css` | Archived CSS | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/reports/*.md` (3 files) | Archived reports | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/server/gh-proxy.mjs` | Archived proxy server | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/tools/README.md` | Archived tools docs | None | **ARCHIVE** — same |
| `tdn_v1_0_stable/workflows/*.json` (2 files) | Archived workflows | None | **ARCHIVE** — same |

---

## GROUP 3 — MANUAL REVIEW REQUIRED

### 3.1 Image Files (tracked)

Verification images uploaded during admin testing. Check if any are still referenced by production articles.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `img/article_1781543894685.webp` | Test image upload | Admin upload test | **REVIEW** — check article body for img URL |
| `img/article_art-1781670620305-0v14ha.jpeg` | Test image upload | Admin upload test | **REVIEW** — same |
| `img/vrfy_img_0_1781719969538.png` | Verification image | Verification test | **REVIEW** — same |
| `img/vrfy_img_1_1781719971383.png` | Verification image | Verification test | **REVIEW** — same |
| `img/vrfy_img_2_1781719973104.png` | Verification image | Verification test | **REVIEW** — same |
| `img/vrfy_img_3_1781719974327.png` | Verification image | Verification test | **REVIEW** — same |
| `img/vrfy_img_4_1781719975804.png` | Verification image | Verification test | **REVIEW** — same |
| `img/vrfy_new_3_1781719480285.png` | Verification image | Verification test | **REVIEW** — same |

### 3.2 `tools/build_index.mjs` (tracked)

Standalone tool that rebuilds `data/articles/index.json` from individual article JSONs. Currently redundant (n8n pipeline builds index.json inline), but serves as a fallback manual rebuild tool.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `tools/build_index.mjs` | Article index builder (fallback) | Governance report | **REVIEW** — keep as safety net until n8n pipeline is verified independently |

### 3.3 `server/gh-proxy.mjs` (untracked — on disk only)

Node.js proxy server for GitHub API. The admin panel currently calls GitHub API directly with Bearer token — no proxy in use. However, this file implements GitHub App JWT authentication and might be useful as an alternative auth method.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `server/gh-proxy.mjs` | GitHub App proxy server | Admin (potential) | **REVIEW** — evaluate if needed for GitHub App auth migration |

### 3.4 `.gitignore` (untracked)

Git ignore rules. Critical for security (blocks *.pem, *.key, .env). But it's currently untracked — should be tracked to ensure rules apply to all clones.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `.gitignore` | Git ignore rules | Git itself | **REVIEW** — should be `git add`ed, not deleted |

### 3.5 `docs/` Directory (untracked)

Contains documentation files. Check content before deleting.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `docs/` | Documentation files | None (potential) | **REVIEW** — inspect files first |

### 3.6 `data/categories.json` (tracked)

Category data file with 7 legacy categories. Needs to be SYNCED with admin's 11-category registry, not deleted in isolation. See TDN_CATEGORY_MIGRATION_PLAN.md (Phase C).

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `data/categories.json` | Category definitions (7 legacy) | Admin, script.js (potential) | **REVIEW** — needs sync, not plain deletion |

### 3.7 `sandbox/` Directory (partially tracked + gitignored)

The sandbox `og-image.png` at `/sandbox/og-image.png` is referenced by ALL frontend pages as the `og:image` meta tag. However:
- The 27 article JSONs in `sandbox/articles/` are safe to delete (GROUP 1)
- The `og-image.png` file itself may need to remain or be moved

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `sandbox/og-image.png` | Default OG image for all pages | index.html, article.html, contact.html, etc. (10+ pages) | **REVIEW** — URL is hardcoded in HTML `<meta>` tags. Either keep file, move to `img/`, or replace with proper logo |

### 3.8 `data/articles/index.json` (tracked — PROTECTED)

Included here for completeness. This is the **article Single Source of Truth** — must NEVER be deleted.

| Path | Purpose | Referenced By | Action |
|------|---------|---------------|--------|
| `data/articles/index.json` | Article SSoT (333 entries) | Admin, script.js, frontend | **PROTECTED** — never delete |

---

## SUMMARY

| Group | Files | Disk Size (est.) | Action |
|-------|-------|------------------|--------|
| **GROUP 1 — DELETE** | ~110 files (tracked + untracked) | ~2 MB | Safe to delete immediately |
| **GROUP 2 — ARCHIVE** | ~1,572 files (tracked + untracked) | ~15 MB | Zip to external storage, then delete |
| **GROUP 3 — REVIEW** | ~12 files | ~500 KB | Manual review needed |
| **PROTECTED** | ~20 files | N/A | Never delete |
| **TOTAL** | ~1,714 files on disk | ~18 MB | Fully accounted |

**TRACKED FILES TO `git rm`:** 19 individual article JSONs + 27 sandbox article JSONs + 13 data queue/log files + 2 .gitkeep + 38 tdn_v1_0_stable/* + tools/build_index.mjs (review) = **~100 tracked files**

**UNTRACKED FILES TO DELETE FROM DISK:** 35 diagnostic .mjs scripts + 6 tools scripts + 6 health check scripts + 2 reports + 1 workflow export + 2 agent configs + 1 package.json + 1 .env.template + 2 backup directories (1,534 files) = **~1,590 files on disk**

---

*End of Report — Tech Dose News Dead File Classification*
