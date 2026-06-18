# Tech Dose News — Repository Inventory & Governance

**Date:** 2026-06-18
**Repository:** `osamaelfeky567/techdosenews`
**Branch:** `main`
**Live URL:** `https://osamaelfeky567.github.io/techdosenews/`

---

## Table of Contents

1. [Complete File Inventory](#1-complete-file-inventory)
2. [Dependency Map](#2-dependency-map)
3. [Dead File Identification](#3-dead-file-identification)
4. [Single Source of Truth Audit](#4-single-source-of-truth-audit)
5. [UTF-8 Safety Policy](#5-utf-8-safety-policy)
6. [Production File Protection](#6-production-file-protection)
7. [Merge Safety Rules](#7-merge-safety-rules)
8. [Runtime Verification Rules](#8-runtime-verification-rules)
9. [Admin Panel Protection](#9-admin-panel-protection)
10. [Permanent Maintenance Guidelines](#10-permanent-maintenance-guidelines)

---

## 1. Complete File Inventory

### 1.1 Live Production Site (Root — Git Tracked)

#### Root HTML Pages

| # | File | Size | Purpose | Critical | Active |
|---|------|------|---------|----------|--------|
| 1 | `index.html` | 9.5 KB | Homepage — Arabic tech news portal, article grid with categories | YES | YES |
| 2 | `article.html` | 5.2 KB | Article detail page (`?id=` param renders full article) | YES | YES |
| 3 | `category.html` | 5.0 KB | Category filter page (`?cat=` param) | YES | YES |
| 4 | `about.html` | 4.7 KB | About Us page | YES | YES |
| 5 | `contact.html` | 4.1 KB | Contact Us page | YES | YES |
| 6 | `privacy.html` | 4.9 KB | Privacy policy | YES | YES |
| 7 | `terms.html` | 4.6 KB | Terms of use | YES | YES |
| 8 | `disclaimer.html` | 4.7 KB | Disclaimer page | YES | YES |
| 9 | `editorial-policy.html` | 7.1 KB | Editorial policy | YES | YES |
| 10 | `404.html` | 3.8 KB | 404 error page | YES | YES |
| 11 | `dashboard.html` | 3.7 KB | Internal analytics dashboard (disallowed in robots.txt) | NO (internal) | YES |

#### Root Assets

| # | File | Size | Purpose | Critical | Active |
|---|------|------|---------|----------|--------|
| 12 | `script.js` | 43.5 KB | Main frontend JS: fetches index.json from GitHub, renders articles, SEO, Telegram buttons | YES | YES |
| 13 | `style.css` | 21.9 KB | Main stylesheet for all frontend pages | YES | YES |
| 14 | `robots.txt` | 122 B | Disallows dashboard, sitemap reference | YES | YES |
| 15 | `sitemap.xml` | 178 KB | Dynamic article sitemap for SEO | YES | YES |
| 16 | `.nojekyll` | 0 B | Disables Jekyll on GitHub Pages | YES | YES |

#### Admin Panel

| # | File | Size | Purpose | Critical | Active |
|---|------|------|---------|----------|--------|
| 17 | `admin/index.html` | 77 KB | Monolithic admin: article CRUD, categories, theme, settings, Telegram, workflow. Inline CSS + JS. | YES | YES |
| 18 | `admin_config.json` | 910 B | Site config SSoT: Telegram, social, colors, webhook | YES | YES |

#### Data Layer

| # | File | Size | Purpose | Critical | Active |
|---|------|------|---------|----------|--------|
| 19 | `data/articles/index.json` | 959 KB | **MASTER ARTICLE INDEX** — 307 published articles | YES | YES |
| 20-38 | `data/articles/*.json` (19 files) | Varies | Individual article source files (pipeline artifacts, feed `build_index.mjs`) | NO | NO |
| 39 | `data/categories.json` | 2 KB | Category definitions with keywords | YES | YES |
| 40 | `data/content_hashes.json` | 1 KB | Content dedup hashes | NO | NO |
| 41 | `data/published_links.json` | 4 KB | Published source URLs (pipeline dedup) | YES | YES |
| 42 | `data/published_topics.json` | 15 KB | Published topic tracking (pipeline) | YES | YES |
| 43 | `data/queues/pending.json` | 50 KB | Pending article queue | NO | NO (stale) |
| 44 | `data/queues/processing.json` | 8 KB | Processing queue | NO | NO (stale) |
| 45 | `data/queues/archive.json` | 5 KB | Processed queue archive | NO | NO (stale) |
| 46 | `data/queues/content_hashes.json` | 2 B | Empty queue hashes | NO | NO |
| 47-51 | `data/logs/*.log` (5 files) | 2 B each | Empty log files | NO | NO |
| 52 | `data/logs/system.log` | 80 KB | Old system event log | NO | NO (stale) |
| 53-54 | `data/articles_db/.gitkeep`, `data/testing-output/.gitkeep` | 0 B | Empty dir placeholders | NO | NO |

#### Images

| # | File | Purpose | Critical | Active |
|---|------|---------|----------|--------|
| 55-62 | `img/*.webp`, `img/*.png` | Verification/test images — not referenced in code | NO | NO |

#### Sandbox

| # | Files | Purpose | Critical | Active |
|---|-------|---------|----------|--------|
| 63-89 | `sandbox/articles/art-*.json` (27 files) | Test articles — not deployed | NO | NO |

#### Server

| # | File | Size | Purpose | Critical | Active |
|---|------|------|---------|----------|--------|
| 90 | `server/gh-proxy.mjs` | 8 KB | Node.js GitHub Proxy — GitHub App auth for admin | YES | Conditional |

#### Documentation

| # | File | Size | Purpose | Critical | Active |
|---|------|------|---------|----------|--------|
| 91-100 | `docs/*.md` (10 files) | 2-10 KB each | Architecture, changelog, calibration, incidents, health, workflows, specs | NO | Reference |

### 1.2 Duplicate Snapshot — `tdn_v1_0_stable/`

| Subdirectory | Files | Contents |
|-------------|-------|----------|
| `frontend/` | 16 | Stale HTML/CSS/JS (references ROOT data via URL) |
| `admin/` | 2 | Stale admin with mojibake encoding |
| `data/` | 9 | Stale index.json (6,993 vs 8,274 lines live), extra files |
| `server/` | 1 | Older gh-proxy.mjs (PAT + GitHub App vs GitHub App only) |
| `docs/` | 14 | Has 4 unique docs not at root |
| `config/` | 3 | package.json, .env.template, opencode.json |
| `reports/` | 3 | Old reports |
| `tools/` | 1 | README |
| `workflows/` | 2 | **Tracked copies** of n8n workflows |

**Assessment:** Entire directory is a stale snapshot. Safe to remove after migrating unique docs and verifying workflow tracking.

### 1.3 Backup Directories

| Directory | Files | Contents |
|-----------|-------|----------|
| `backup_admin_finalization/` | ~8 | Backups of admin, config, articles (taken before finalization work) |
| `backup_cleanup_final/` | ~1,114 | Massive nested backup: old articles, queue backups, test scripts, old tools, legacy reports, multiple nested backup generations |

---

## 2. Dependency Map

```
admin_config.json  (Configuration SSoT)
  ├── script.js          (fetches at runtime via raw.githubusercontent.com)
  ├── admin/index.html   (reads/writes via GitHub API)
  └── tdn_v1_0_stable/admin/admin_config.json  (STALE COPY — not referenced)

data/articles/index.json  (Article Index SSoT — 307 articles)
  ├── script.js          (fetches at runtime via raw.githubusercontent.com)
  ├── admin/index.html   (reads/writes via GitHub API)
  ├── tools/build_index.mjs  (builds this from individual article JSONs)
  └── data/articles/*.json   (19 source files feed INTO it — pipeline artifacts)

server/gh-proxy.mjs
  ├── admin/index.html  (configured as proxy endpoint for GitHub App auth)
  ├── tools/discover-installation.mjs
  └── tools/start-proxy.mjs

production_workflow.json  (n8n export — tracked in tdn_v1_0_stable/workflows/)
  └── n8n instance  (runs the actual workflow)

style.css
  ├── index.html
  ├── article.html
  ├── category.html
  ├── about.html
  ├── contact.html
  ├── privacy.html
  ├── terms.html
  ├── disclaimer.html
  ├── editorial-policy.html
  ├── 404.html
  └── dashboard.html

script.js
  ├── index.html
  ├── article.html
  ├── category.html
  └── dashboard.html
```

### External Dependencies

| Dependency | Used In | Purpose |
|-----------|---------|---------|
| Google Fonts (Cairo, Tajawal) | All HTML pages | Arabic-optimized typography |
| Font Awesome 6.5.0 (CDN) | All HTML pages, admin | Icons |
| SunEditor CDN | admin/index.html | **NOT USED** (plain textarea instead) |
| GitHub REST API | admin/index.html, script.js | Read/write repo content |
| Telegram Bot API | admin/index.html (`sendToTelegram`) | Publish articles to Telegram |
| raw.githubusercontent.com | script.js | Fetch index.json + admin_config.json |

---

## 3. Dead File Identification

### 3.1 Immediate Removal Candidates

| File/Directory | Size | Reason | Classification |
|---------------|------|--------|---------------|
| `tdn_v1_0_stable/` (entire dir) | ~38 files | Stale snapshot of entire production site. Not deployed. | **SAFE TO DELETE** |
| `backup_admin_finalization/` | ~8 files | Stale backup | **SAFE TO DELETE** |
| `backup_cleanup_final/` | ~1,114 files | Massive nested backup, multiple generations | **SAFE TO DELETE** |
| `sandbox/articles/` | 27 files | Test articles, never deployed | **SAFE TO DELETE** |
| `img/vrfy_*.png`, `img/vrfy_new_*.png` | 6 files | Verification images, not referenced | **SAFE TO DELETE** |
| `img/article_*.webp`, `img/article_art-*.jpeg` | 2 files | Test uploads, not referenced | **SAFE TO DELETE** |
| `data/queues/` (all 4 files) | 4 files | Stale/unprocessed queue data | **SAFE TO DELETE** |
| `data/logs/*.log` (6 files) | 6 files | Empty or stale logs | **SAFE TO DELETE** |
| `data/articles_db/.gitkeep` | 0 B | Empty placeholder | **SAFE TO DELETE** |
| `data/testing-output/.gitkeep` | 0 B | Empty placeholder | **SAFE TO DELETE** |
| `*.mjs` (38 root-level diagnostic scripts) | 38 files | One-time diagnostic/repair tools | **SAFE TO DELETE** |
| `proxy-bg.log`, `proxy-error.log`, `proxy-output.log` | 3 files | Proxy runtime logs | **SAFE TO DELETE** |
| `MONITORING.md` | ~2 KB | Stale monitoring report | **SAFE TO DELETE** |
| `TDN_PRODUCTION_LOCKDOWN_REPORT.md` | ~5 KB | Stale report | **SAFE TO DELETE** |
| `td-admin-panel.private-key.pem` | ~1 KB | **PRIVATE KEY** — security risk | **DELETE IMMEDIATELY** |
| `opencode.json` | ~1 KB | Agent config (copied elsewhere) | **SAFE TO DELETE** |
| `skills-lock.json` | ~1 KB | Agent lock file | **SAFE TO DELETE** |
| `package.json` | ~0.3 KB | Node deps (not used) | **SAFE TO DELETE** |
| `.env.template` | ~0.3 KB | Duplicate (exists in config/) | **SAFE TO DELETE** |

### 3.2 Needs Review

| File/Directory | Reason | Classification |
|---------------|--------|---------------|
| `data/articles/*.json` (19 files) | Source files for `build_index.mjs`. Pipeline artifacts. Remove only if index.json rebuild is automated and verified. | **NEEDS REVIEW** |
| `server/gh-proxy.mjs` | Active when GitHub Auth proxy is running. Check if still in use. | **KEEP** (if proxy used) |
| `data/content_hashes.json` | Used by pipeline for dedup. Check if pipeline still references it. | **NEEDS REVIEW** |
| `data/logs/system.log` | 80 KB of old log entries. Check if any active pipeline logs to it. | **NEEDS REVIEW** |

### 3.3 Must Keep

All files listed in sections [1.1](#11-live-production-site-root--git-tracked) as critical/active.

---

## 4. Single Source of Truth Audit

### 4.1 Articles: `data/articles/index.json`

**Verdict: ✅ SINGLE SOURCE OF TRUTH — NO VIOLATIONS**

| Consumer | Source | Correct? |
|----------|--------|----------|
| `script.js` (frontend) | `data/articles/index.json` via `raw.githubusercontent.com` | ✅ YES |
| `admin/index.html` (admin panel) | `data/articles/index.json` via GitHub API | ✅ YES |
| `tools/build_index.mjs` | Reads `data/articles/*.json`, writes `data/articles/index.json` | ✅ YES |
| n8n pipeline | GitHub API to `data/articles/` | ✅ YES |
| `tdn_v1_0_stable/data/articles/index.json` | **STALE COPY** (6,993 vs 8,274 lines) | ❌ STALE — NOT REFERENCED |
| `backup_admin_finalization/index.json` | **BACKUP COPY** | ❌ STALE — NOT REFERENCED |

### 4.2 Configuration: `admin_config.json`

**Verdict: ✅ SINGLE SOURCE OF TRUTH — NO VIOLATIONS**

| Consumer | Source | Correct? |
|----------|--------|----------|
| `script.js` (frontend) | `admin_config.json` via `raw.githubusercontent.com` | ✅ YES |
| `admin/index.html` (admin panel) | `admin_config.json` via GitHub API | ✅ YES |
| `tdn_v1_0_stable/admin/admin_config.json` | **STALE COPY** (with mojibake) | ❌ STALE — NOT REFERENCED |

### 4.3 Categories: `data/categories.json`

**Verdict: ⚠️ NEEDS REVIEW**

| Consumer | Source | Correct? |
|----------|--------|----------|
| `admin/index.html` | Uses inline `CATEGORIES` array (11 canonical categories) + reads `CONFIG.catColors` from `admin_config.json` | ⚠️ DIFFERENT from `data/categories.json` (7 legacy categories) |
| n8n pipeline | `data/categories.json` | ⚠️ Uses legacy categories |
| `script.js` | Has inline `CATEGORY_MAP` for translation | ⚠️ Needs sync with admin's CATEGORIES |

The admin panel uses 11 canonical categories inline. The `data/categories.json` file has 7 legacy categories. The pipeline references `data/categories.json`. **These need to be synchronized.**

### 4.4 Violation Summary

| # | Violation | Severity | Details |
|---|-----------|----------|---------|
| 1 | `tdn_v1_0_stable/` duplicates entire site | HIGH | Stale copy of frontend, admin, data, server, workflows — no code references it |
| 2 | Category mismatch: inline vs `data/categories.json` | MEDIUM | Admin has 11 categories, file has 7 legacy |
| 3 | Workflow files exist in two locations | MEDIUM | Root `production_workflow.json` (gitignored) + `tdn_v1_0_stable/workflows/` (tracked) |
| 4 | `tdn_v1_0_stable/data/articles/index.json` stale | LOW | Not referenced but could cause confusion |
| 5 | `backup_*` directories contain stale data copies | LOW | Not referenced, but create clutter |

---

## 5. UTF-8 Safety Policy

### 5.1 Mandatory Rule

**Every text file in this repository MUST remain UTF-8 WITHOUT BOM at all times.**

Never use:
- Windows-1252 / ANSI / Latin-1 encoding
- Tools that rewrite text through system code pages
- PowerShell `>` redirection or `Set-Content` for Arabic text

### 5.2 Arabic-Safe Tools

| Tool | Safe? | Notes |
|------|-------|-------|
| Node.js `fs.readFileSync/writeFileSync` (UTF-8) | ✅ SAFE | Default encoding is UTF-8. Use explicitly: `{ encoding: 'utf-8' }` |
| `git cat-file -p` via Node.js `execSync` | ✅ SAFE | Returns raw bytes correctly |
| PowerShell `Set-Content` | ❌ DANGEROUS | Converts through console code page |
| PowerShell `>` redirection | ❌ DANGEROUS | Converts through console code page |
| `chcp 65001` + PowerShell pipe | ⚠️ UNRELIABLE | May still corrupt Arabic in edge cases |
| Edit tool (in-IDE text editor) | ✅ SAFE | Preserves UTF-8 if file already has correct encoding |

### 5.3 Verification Protocol

Before committing any change to a file containing Arabic:

1. **Backup** the original file
2. **Make changes**
3. **Verify** Arabic sample strings survive intact:

   ```
   TD بالعربي
   الذكاء الاصطناعي
   أمن سيبراني
   ```

4. **Check encoding** via Node.js:

   ```js
   const bytes = fs.readFileSync('file.html');
   const hasBOM = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
   const isValidUTF8 = /* verify no mojibake sequences */;
   ```

5. **If mojibake appears** (e.g., `Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ` instead of `بالعربي`):
   - **REJECT THE CHANGE**
   - Restore from backup
   - Re-apply using Node.js `fs.writeFileSync` with UTF-8 encoding

### 5.4 Mojibake Recovery

If Arabic text appears as garbled characters like `Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ`:

1. **Identify corruption commit** via `git bisect` or manual inspection
2. **Restore from pre-corruption commit** using Node.js raw extraction:
   ```js
   const { execSync } = require('child_process');
   const fs = require('fs');
   const content = execSync('git cat-file -p <commit>:<file>', { encoding: 'buffer' });
   fs.writeFileSync('<file>', content);
   ```
3. **Re-apply intended changes** using modern tooling that preserves UTF-8

---

## 6. Production File Protection

### 6.1 Protected Files List

The following files require **extra verification** before any modification:

| # | File | Reason |
|---|------|--------|
| 1 | `index.html` | Homepage — Arabic content, SEO-critical |
| 2 | `article.html` | Article page — Arabic content, SEO-critical |
| 3 | `contact.html` | Contact page — Arabic content |
| 4 | `script.js` | Core frontend logic — breaks entire site if broken |
| 5 | `style.css` | Site-wide styling — visual design |
| 6 | `admin/index.html` | Full admin panel — inline CSS+JS, complex |
| 7 | `admin_config.json` | Configuration SSoT — Telegram, social, colors |
| 8 | `data/articles/index.json` | Article index SSoT — all published articles |
| 9 | `server/gh-proxy.mjs` | GitHub Proxy — auth security |
| 10 | `production_workflow.json` | n8n pipeline — automation |
| 11 | `sitemap.xml` | SEO — must remain valid XML |
| 12 | `robots.txt` | Search engine crawling rules |

### 6.2 Modification Protocol

Any modification to protected files requires:

1. **Backup** — Save original file content
2. **Diff review** — Review changes before staging
3. **Syntax validation** — `node --check` for JS, `w3c-validator` for HTML
4. **Arabic encoding check** — Verify sample Arabic strings
5. **Runtime verification** — Browser test if possible
6. **Production verification** — Check live site after deploy

### 6.3 Emergency Override

In case of production emergency (broken site, security fix):

1. Fix first, verify encoding second
2. Document the emergency in commit message with `HOTFIX` prefix
3. Perform post-fix verification within 24 hours

---

## 7. Merge Safety Rules

### 7.1 Pre-Merge Checklist

Before any merge or force-push:

- [ ] Compare LOCAL vs REMOTE for all protected files
- [ ] Verify functions not removed (grepping for `function name` and `async function name`)
- [ ] Verify event handlers not removed (check `onclick`, `addEventListener`)
- [ ] Verify dependencies not removed (script src, link href, import references)
- [ ] Verify Arabic encoding not corrupted
- [ ] Verify no blind overwrite of newer code with older code

### 7.2 Conflict Resolution

When resolving merge conflicts on protected files:

1. **Never prefer older code over newer code** — check `git log` timestamps
2. **For admin/index.html**: The file is monolithic. Conflicts must be resolved by comparing function-by-function, not file-level.
3. **For data/articles/index.json**: Always prefer the version with more articles (larger `INDEX` array length).
4. **For admin_config.json**: Always prefer the version with more config fields.

### 7.3 Force Push Prohibition

**No force push to `main`** without:
- Confirmation that no remote commits would be lost
- Explicit approval from a second party (if available)
- Full re-verification of all protected files

---

## 8. Runtime Verification Rules

### 8.1 Mandatory Checks

A feature is NOT complete unless:

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| JavaScript syntax | `node --check <file>` | No errors |
| Console errors | Browser DevTools | 0 errors |
| Network errors | Browser DevTools | 0 failed requests |
| UI behavior | Manual test | All buttons work, data displays |

### 8.2 Frontend Test Protocol

After modifying `script.js`, `index.html`, or `article.html`:

1. Open homepage → verify article grid loads
2. Open article page → verify article renders
3. Click category filter → verify filtering works
4. Check Telegram button → verify href resolved
5. Check console → 0 errors
6. Check network → 0 failed requests

### 8.3 Admin Panel Test Protocol

After modifying `admin/index.html`:

1. Load admin page → verify no blank screen
2. Dashboard → verify counters and statistics load
3. Articles → list, search, filter, open article
4. Editor → create article, edit, save, reload, verify persistence
5. Categories → selector, color, save
6. Settings → load config, save config, reload
7. Image → upload, preview, delete
8. Console → 0 errors in all operations

### 8.4 Pipeline Test Protocol

After modifying `production_workflow.json` or pipeline scripts:

1. Trigger n8n workflow manually
2. Verify new article appears in `data/articles/`
3. Verify index.json is updated
4. Verify frontend shows new article

### 8.5 Anything Untested = FAIL

If any verification step cannot be performed (e.g., no browser available):

- **Document the gap** in the commit message
- **Flag** the change as `[UNTESTED]`
- Schedule a follow-up verification within 24 hours

---

## 9. Admin Panel Protection

### 9.1 Never Modify `admin/index.html` Directly Without

1. **Backup** the current file
2. **Syntax validation** — `node --check` on extracted JS content
3. **Runtime validation** — Browser test all CRUD operations

### 9.2 Required Test Suite

Before committing admin changes:

| Test | Description |
|------|-------------|
| Open article | Load articles list, click to open |
| Save article | Create new article, save |
| Edit article | Modify existing article, save |
| Delete article | Delete article via confirmation modal |
| Settings save | Modify settings, save, verify persistence |
| Category save | Change category colors/names, save |
| Image upload | Upload image, verify preview |
| Telegram settings | Change channel/redirect/mode, save |

**All tests must PASS before commit.**

### 9.3 Admin-Specific Rules

- `admin/index.html` is **monolithic** — all HTML, CSS, and JS are inline. There is no separation of concerns.
- Any modification that changes the JS architecture (adding/removing functions, changing event handlers) requires extra scrutiny.
- The admin panel is **auth-gated** by `GH_TOKEN` stored in `localStorage`. Password-less access is not possible.
- Do not add SunEditor or rich text editors — the current `<textarea>` approach is simpler and more reliable.

### 9.4 Known Admin Architecture

```
admin/index.html (single file, ~77 KB)
├── CSS block (~9.7 KB)    — <style> section
├── HTML body (~18 KB)     — all pages (dashboard, articles, editor, categories, themes, settings, workflow)
└── JS block (~48 KB)      — all functions, event handlers, data
```

The HTML contains 7 page sections:
- `#page-dashboard` — Stats, insights, charts
- `#page-articles` — Article list with search/filter
- `#page-editor` — Article create/edit form
- `#page-categories` — Category management
- `#page-themes` — Color theme customization
- `#page-settings` — Site settings, Telegram, social
- `#page-workflow` — n8n workflow trigger

---

## 10. Permanent Maintenance Guidelines

### 10.1 File Organization

Keep the repository structure clean:

```
/                           ← Root: HTML pages + assets + admin
├── admin/                  ← Admin panel (1 HTML file + config.json)
├── data/
│   ├── articles/           ← Only index.json should be here long-term
│   ├── categories.json
│   ├── published_links.json
│   └── published_topics.json
├── docs/                   ← Documentation
├── img/                    ← Production images only
├── server/                 ← Server-side tools
├── tools/                  ← Diagnostic scripts
└── tdn_v1_0_stable/        ← TO DELETE (stale duplicate)
```

### 10.2 Cleanup Schedule

| Priority | Action | Target Date |
|----------|--------|-------------|
| **IMMEDIATE** | Delete `td-admin-panel.private-key.pem` | Now |
| HIGH | Delete `tdn_v1_0_stable/` directory | Next maintenance window |
| HIGH | Delete `backup_admin_finalization/` and `backup_cleanup_final/` | Next maintenance window |
| MEDIUM | Delete 38 root diagnostic `.mjs` scripts | Next maintenance window |
| MEDIUM | Sync `data/categories.json` with admin's 11-category registry | Next maintenance window |
| LOW | Delete sandbox articles, stale queues, empty logs | When convenient |
| LOW | Archive individual article source files (19 JSONs) | When stable |

### 10.3 Git Hygiene

- All commits must include ONLY files relevant to the change
- No binary files in git history
- No `.env`, `.pem`, or secret files ever committed
- Commit messages follow: `<type>: <description>` where type is `HOTFIX`, `FEATURE`, `CLEANUP`, `DOCS`, `CONFIG`
- Arabic text in commit messages is acceptable (as used in pipeline automation commits)

### 10.4 Backup Strategy

- Repository is version-controlled via git — no separate backup needed
- `admin_config.json` and `data/articles/index.json` are the only mutable data — they ARE the backup
- Before destructive operations (removing files, restructuring), create a git tag:

  ```bash
  git tag -a pre-cleanup-YYYYMMDD -m "Before cleanup on YYYY-MM-DD"
  ```

### 10.5 Deployment

- **Site is hosted on GitHub Pages** — no build step, no server
- Any push to `main` deploys automatically (GitHub Pages)
- `data/articles/index.json` updates are live immediately
- `admin/index.html` updates are live immediately
- `admin_config.json` updates are live immediately

---

## Appendix A: File Size Budget

| File | Current Size | Max Recommended | Notes |
|------|-------------|-----------------|-------|
| `admin/index.html` | 77 KB | 100 KB | Monolithic — consider splitting if growth continues |
| `script.js` | 43 KB | 60 KB | Can be optimized |
| `style.css` | 22 KB | 40 KB | Within limits |
| `data/articles/index.json` | 959 KB | 2 MB | Will grow with articles — monitor |

## Appendix B: Key Contacts

| Component | Owner | Notes |
|-----------|-------|-------|
| Frontend (HTML/CSS/JS) | Engineering | Inline, no framework |
| Admin Panel | Engineering | Monolithic HTML, inline JS |
| n8n Workflow | Automation | External n8n instance |
| GitHub Repo | Engineering | `osamaelfeky567/techdosenews` |
| GitHub Pages | Hosted | Automatic deploy from `main` |
