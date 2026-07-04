# Phase 8A — Summary Report

**Date:** 2026-07-04
**Scope:** Read-only inventory of entire TDN project

---

## Single Source of Truth
**`data/articles/index.json`** — All frontend pages read from this file via `raw.githubusercontent.com`.

---

## Overall Health

| Area | Status | Key Issue |
|------|--------|-----------|
| Articles | ⚠️ 37 total, 37 published | 14 empty slugs, 1 duplicate title, placeholders |
| Images | ✅ No broken, but 0 GitHub-persisted | 61% Pexels stock photos |
| Sitemap | ❌ 8/37 articles only | Last updated June 26 |
| RSS | ❌ 11/37 articles only | Last updated June 26 |
| Sources | ✅ Single source of truth confirmed | 4 unused directories, 3 legacy files |
| Dashboard | ⚠️ Client-side only | No server-side analytics |
| Frontend | ✅ All pages uniform | All read from same index.json |
| Admin | ⚠️ Works but weak auth | Default password 'admin123', no proxy used |
| CI/CD | ❌ auto-publish.yml exists | Sitemap/RSS not regenerating (detached from live data) |

---

## Critical Issues (must fix in Phase 8B)

1. **Sitemap outdated** — only 8 of 37 articles indexed
2. **RSS outdated** — only 11 of 37 articles in feed
3. **14 articles missing seo_slug** — cannot be properly linked
4. **Placeholder tags** — `["تاغ ذو صلة", "تاغ ثاني", "تاغ ثالث"]` in article art-1783074620829-roxois
5. **Non-tech articles mixed in** — BBC Arabic political/news content shouldn't be in a tech publication
6. **Thin articles** — 7 articles under 100 words
7. **Duplicate title** — "إيران ترد على البيان المشترك" (×2)

---

## Files to Clean Up (Phase 8B)

### Delete (UNUSED)
- `data/articles_db/` — empty directory
- `data/events/` — empty directory
- `data/queues/` — empty directory
- `data/testing-output/` — empty directory

### Archive (LEGACY)
- `data/categories.json`
- `data/health.json`
- `data/quality_config.json`

### Fix (ACTIVE with issues)
- `data/published_links.json` — dead code (written but never read)
- `data/articles/index.json` — missing slugs, placeholders, non-tech content
- `sitemap.xml` — regenerate with all articles
- `rss.xml` — regenerate with all articles
- `.github/workflows/auto-publish.yml` — verify/fix CI/CD trigger

### Keep (ACTIVE, working)
- `data/articles/index.json` — single source of truth
- `data/articles/*.json` — individual article files
- `data/published_topics.json` — dedup tracking
- `data/content_hashes.json` — content dedup
- `pipeline_production.js` — n8n pipeline code
- `pipeline_clean.js` — pipeline mirror

---

## Data Flow Architecture

```
n8n Pipeline → GitHub (data/articles/{id}.json + index.json)
  → GitHub Actions (auto-publish.yml)
    → generate-sitemap.js → sitemap.xml
    → generate-rss.mjs → rss.xml
  → Frontend (script.js)
    → raw.githubusercontent.com/.../index.json
    → Homepage, Article, Category, Search
```

**Dashboard:** localStorage only (not connected to article data)
**Admin Panel:** GitHub API directly + admin_config.json auth
