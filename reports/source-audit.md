# Source Audit — Phase 8A

**Date:** 2026-07-04
**Repository:** `D:\Projects\Open Code`

---

## Article Storage Locations

| # | Source | Type | Classification | Notes |
|---|--------|------|---------------|-------|
| 1 | `data/articles/index.json` | Flat array of all articles (metadata + body) | **ACTIVE** | Single Source of Truth for ALL frontend pages |
| 2 | `data/articles/*.json` (individual files) | One JSON per article | **ACTIVE** | Pipeline writes here first, then updates index.json |
| 3 | `data/published_topics.json` | Array of published topic fingerprints | **ACTIVE** | 72h dedup, daily cap tracking |
| 4 | `data/published_links.json` | Flat array of published URLs | **CACHE** | Written but never read (known bug) |
| 5 | `data/content_hashes.json` | Array of content hash strings | **ACTIVE** | Arabic-aware content dedup |
| 6 | `data/categories.json` | Category definitions | **LEGACY** | Superseded by inline Code node logic |
| 7 | `data/health.json` | Health status | **LEGACY** | Unused |
| 8 | `data/quality_config.json` | Quality configuration | **LEGACY** | Unused |
| 9 | `data/workflow_lock.json` | Runtime lock | **TEMP** | Runtime-only, no article data |
| 10 | `data/articles_db/` | Empty directory | **UNUSED** | Remnant from earlier system |
| 11 | `data/events/` | Empty directory | **UNUSED** | Remnant |
| 12 | `data/queues/` | Empty directory | **UNUSED** | Remnant |
| 13 | `data/testing-output/` | Empty directory | **UNUSED** | Remnant |
| 14 | `data/logs/system.log` | Runtime logs | **TEMP** | No article data |
| 15 | `production_workflow.json` | n8n workflow with embedded pipeline | **ACTIVE** | n8n deployment source |
| 16 | `pipeline_production.js` | Pipeline code | **ACTIVE** | Extracted from n8n, local editing copy |
| 17 | `pipeline_clean.js` | Pipeline code (mirror) | **ACTIVE** | Mirror of pipeline_production.js |

---

## Classification Summary

| Classification | Count | Sources |
|---------------|-------|---------|
| **ACTIVE** | 6 | index.json, individual articles, published_topics, content_hashes, workflow, pipelines |
| **CACHE** | 1 | published_links.json |
| **LEGACY** | 3 | categories.json, health.json, quality_config.json |
| **TEMP** | 2 | workflow_lock.json, system.log |
| **UNUSED** | 4 | articles_db/, events/, queues/, testing-output/ |

---

## Primary Data Flow

```
Pipeline (n8n)
  → Creates individual article in data/articles/{slug}.json
  → Updates data/articles/index.json with new article
  → Pushes to GitHub main branch
    → GitHub Actions auto-publish.yml:
      → scripts/generate-sitemap.js (reads index.json)
      → tools/generate-rss.mjs (reads index.json)
      → Commits sitemap.xml + rss.xml + index.json
        → Frontend (script.js) fetches raw.githubusercontent.com/.../index.json
```

## Key Observations

1. **Single Source of Truth = `data/articles/index.json`** — ALL frontend pages read from this file
2. **Individual article JSONs are write targets** — pipeline writes individual files first for atomicity, then updates the index
3. **Dashboard is client-side only** — reads from localStorage, NOT from any article data file
4. **No server-side database** — everything is flat JSON files on GitHub
5. **published_links.json is dead code** — written but never read during dedup
6. **categories.json is legacy** — superseded by inline logic in pipeline Code node
7. **No actual archive/backup exists** — archive/ directory does not exist yet
