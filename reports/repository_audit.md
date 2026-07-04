# Repository Audit Report

**Date:** 2026-07-04 (Updated: Phase 8.1 Stabilization)
**Repo:** osamaelfeky567/techdosenews
**Location:** D:\Projects\Open Code
**Phase:** 8.1 — Repository Stabilization (Safe Fixes Only)

---

## Executive Summary

This report documents the complete audit of the Tech Dose News repository. The site currently shows **38 articles** out of a historical total of **297+** tracked publications. The audit identifies storage locations, content gaps, image quality issues, out-of-scope content, and sitemap discrepancies — without modifying any files.

**Phase 8.1 updates:** Sitemap fixed (38/38), RSS fixed (38 items), tracking files cleaned (published_links/topics/hashes), image URLs verified (all 15 arabhardware.net URLs confirmed HTTP 200).

---

## 1. Master Table

| Item | Count |
|------|-------|
| **All article files on disk** | **50** |
| **Visible articles (index.json)** | **38** |
| **Hidden articles (orphaned files)** | **12** |
| **Archived articles (phase8-backup)** | **37** |
| **Ever tracked (published_links)** | **297** |
| **On other branches** | **373** (357 + 16) |
| **Duplicate images** | **1** |
| **Malformed image URLs** | **0** (all 15 verified HTTP 200) |
| **Broken/missing images** | **0** (all have URLs) |
| **Articles missing image metadata** | **36** |
| **Political/out-of-scope articles** | **8** |
| **Articles needing update (quality < 60)** | **5** |
| **Articles recommended for ARCHIVE** | **1** |
| **Articles recommended for DELETE** | **8** |
| **Duplicate IDs** | **0** |
| **Missing IDs** | **~259** |
| **Duplicate titles** | **2** |
| **Broken JSON files** | **0** |
| **Orphaned sitemap entries** | **0** |
| **Articles missing from sitemap** | **0** (fixed) |
| **Articles missing from RSS** | **0** (fixed) |

---

## 2. Where Are All The Articles?

### Recovery Analysis: What Happened to the 259 Missing Articles?

The 259 articles were **not deleted maliciously**. They were lost through a series of intentional cleanup and consolidation operations:

| Event | Articles Before | Articles After | Change | Commit |
|-------|----------------|----------------|--------|--------|
| Initial index from old pipeline | 374 | 374 | — | `0aff528d` |
| Deduplication | 375 | 304 | -71 | `32ea192a` |
| Production certification | 304 | 290 | -14 | `902000c3` |
| English draft removal | 290 | 220 | -70 (drafted) | `ef62192c` |
| **Content Quality Recovery** | **220** | **21** | **-199** | `f0c6c422` |
| Phase 8B consolidation | 21 | 37 | +16 (restored) | `65b6c594` |
| Normal pipeline | 37 | 38 | +1 | Ongoing |

### Root Cause

1. **Content Quality Recovery (`f0c6c422`)**: ~199 articles removed from index in a quality purge. These were mostly low-quality AI-generated translations of English tech news.
2. **English Draft Removal (`ef62192c`)**: 131 English articles marked as draft and later removed. Their URLs remain in `published_links.json`.
3. **published_links.json is dead code**: The file accumulated 297 entries over time but was **never pruned** when articles were removed. It is documented as unused in the project's own reports.
4. **admin-finalization branch**: 357 articles from an older pipeline with a completely different ID scheme (zero overlap with current IDs). These were replaced by the current pipeline.

### Could They Be Recovered?

| Source | Articles | Recoverable? | Effort |
|--------|----------|-------------|--------|
| `published_links.json` URLs | 297 | No (links only, no content) | — |
| `published_topics.json` | 297 | Partial (titles + timestamps) | Low |
| `admin-finalization` branch | 357 | Yes (full articles, old pipeline format) | High (migration needed) |
| Git history (individual commits) | ~199 | Partial (in git object store) | Very High |
| Archive backup | 37 | Already recovered (phase8-backup) | — |
| Orphaned files | 12 | Yes (just need index rebuild) | Low |

**Recommendation**: Only recover the **12 orphaned files** (low effort). The 357 articles on `admin-finalization` are from a different era and would need content review before re-publishing. The 199 quality-purged articles were intentionally removed and should stay removed.

---

## 3. Storage Locations

| Location | Type | Articles | Access Path |
|----------|------|----------|------------|
| `data/articles/index.json` | Production index | 38 | Live site |
| `data/articles/*.json` | Orphaned individual files | 12 | Disk only |
| `archive/phase8-backup/index.json` | Archive snapshot | 37 | Disk / git |
| `origin/admin-finalization` branch | Old pipeline | 357 | Git |
| `origin/feature/telegram-funnel` branch | Feature branch | 16 | Git |
| `data/published_links.json` | Tracking (URLs only) | 297 | Disk / git |
| `data/published_topics.json` | Tracking (titles only) | 297 | Disk / git |
| `data/content_hashes.json` | Tracking (hashes only) | 297 | Disk / git |

---

## 4. Image Audit Summary

| Metric | Count |
|--------|-------|
| Total articles with images | 38 |
| Unique images | 37 |
| Duplicate images | 1 (Pexels stock photo) |
| Pexels stock images | 22 (58%) |
| Source-hosted images (arabhardware.net) | 15 (39%) |
| Unsplash images | 1 (3%) |
| Malformed URLs | 0 (all 15 verified HTTP 200 — intentional pattern) |
| Articles missing image metadata | 36 (95%) |
| Local orphaned image | 1 (`img/` directory) |

---

## 5. Editorial Classification

### In-Scope Tech Articles (KEEP): 24

Covering: Hardware, Mobile, Apple, AI, Cybersecurity, Gaming, Cloud, Startups, Google, Meta, OpenAI, Social Media, IoT, Fintech

### Out-of-Scope Articles (DELETE): 8

| ID | Title | Reason |
|----|-------|--------|
| art-1782648398720-gisbhi | لماذا ترتدي أي شيء آخر غير هودي الشمس؟ | Fashion/lifestyle |
| art-1782648294337-ruj8z5 | الفرق بين الغني والفقير | Socio-economic opinion |
| art-1782648200129-q10hz6 | سوريا وحزب الله | Geopolitics/military |
| art-1782473420219-v9qp6m | إيران تصف البيان المشترك بـ"الاستفزازي" | Politics/Iran |
| art-1782469820154-27yzm4 | إيران ترد على البيان المشترك | Politics/Iran |
| art-1782468020319-ux8ir7 | إيران ترد على البيان المشترك (duplicate) | Politics/Iran |
| art-1782459970826-swtw2h | دعوة الأمم المتحدة لاعتماد نظام تحقق نووي في إيران | Nuclear/UN politics |
| art-1782444620332-l0yi0q | الأمم المتحدة تعلق إجلاء البحارة بعد هجوم في مضيق هرمز | Military/geopolitics |

### Borderline (ARCHIVE): 1

| ID | Title | Reason |
|----|-------|--------|
| art-1782475220805-jtvj6o | تطبيق في كوريا الجنوبية لحماية النساء من الملاحقة | Tech-adjacent but more social issue |

---

## 6. Sitemap Audit

| Comparison | Result |
|------------|--------|
| Articles in index.json | 38 |
| Articles in sitemap.xml | 45 (7 static + 38 articles) |
| Articles in RSS | 38 |
| Articles missing from sitemap | 0 (fixed) |
| Articles in sitemap but not index | 0 (clean) |
| Articles in RSS but not sitemap | 0 |
| Robots.txt sitemap URL | `https://td-arabi.com/sitemap.xml` (correct) |

**Phase 8.1 fix:** Both sitemap and RSS regenerated from index.json. Sitemap now has 45 URLs (7 static + 38 articles). RSS expanded from 20 to 38 items.

---

## 7. Admin Panel Audit

| Capability | Status |
|------------|--------|
| Shows all index.json articles (38) | Yes |
| Reads individual article files | No — index.json only |
| Pagination | Yes (PER_PAGE=20) |
| Rebuild index feature | No — separate CLI tool only (`tools/build_index.mjs`) |
| Fallback data source | Raw GitHub (same index.json) |
| GitHub API integration | Yes (read + write) |
| n8n integration | Reports only (not direct) |

**Gap**: 12 orphaned article files exist on disk but are invisible to the admin panel because they are not in index.json.

---

## 8. Quality Score Distribution

| Range | Count | Percentage |
|-------|-------|------------|
| 80-100 (pass) | 2 | 12.5% |
| 60-79 | 9 | 56.3% |
| 40-59 | 5 | 31.2% |
| < 40 | 0 | 0% |
| No score | 22 | — |

Average score: **64.9** (of 16 scored articles). The remaining 22 articles predate the quality scoring system.

---

## 9. Git Statistics

| Metric | Value |
|--------|-------|
| Total commits (HEAD) | 4,808 |
| Total commits (all branches) | 4,845 |
| Branches | 5 (2 local + 3 remote) |
| Tags | 3 (v2.0.0-stable, v2.1-production, v3.0-production) |
| Commits touching index.json | 400+ |
| Commits deleting article files | ~70 |
| Commits mentioning "article" | 171 |
| Repo size (excl. node_modules) | 2.11 MB |

---

## 10. Overall Health Assessment

| Area | Rating | Notes |
|------|--------|-------|
| **Content freshness** | ✅ Good | Active articles from Jun 26 - Jul 4 |
| **Index integrity** | ⚠️ Partial | 38 in index, 12 orphaned on disk |
| **Image quality** | ⚠️ Fair | 58% generic stock photos, 95% missing metadata. 15 arabhardware.net URLs verified working (HTTP 200). |
| **Editorial focus** | ⚠️ Partial | 21% out-of-scope (politics/fashion) |
| **Sitemap hygiene** | ✅ Good | 38/38 in sync (fixed) |
| **Admin capability** | ⚠️ Limited | No index rebuild, no individual file fallback. Reads index.json only. |
| **Git hygiene** | ✅ Good | Clean history, proper branching |
| **Content recovery** | ❌ Unnecessary | Missing articles were intentionally removed |
| **Overall** | **⚠️ Needs editorial review** | Focus: delete 8 out-of-scope articles, restore 11 orphaned articles. Image URLs verified working. Sitemap/RSS fixed. Tracking files cleaned. |

---

## 11. Recommended Actions (Phase 9)

### Completed in Phase 8.1
- ✅ **Regenerate sitemap** — Done (45 URLs, all 38 articles)
- ✅ **Regenerate RSS** — Done (38 items)
- ✅ **Verify arabhardware.net image URLs** — Done (all 15 HTTP 200)
- ✅ **Clean tracking files** — Done (published_links/topics/hashes cleaned)

### Pending (Phase 9 — requires editorial approval)
1. **Delete 8 out-of-scope articles** (politics/fashion) through Admin panel
2. **Archive 1 borderline article** through Admin panel
3. **Restore 11 orphaned tech articles** to index.json
4. **Backfill image metadata** for all 36 articles (requires pipeline code change)
5. **Add rebuild-index feature** to Admin panel
6. **Remove duplicate image** (resolved when out-of-scope articles are deleted)
7. **Remove orphaned local image** (`img/article_art-1781670620305-0v14ha.jpeg`)
