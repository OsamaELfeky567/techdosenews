# Content Inventory Report

**Date:** 2026-07-04 (Updated: Phase 8.1 Stabilization)
**Repo:** osamaelfeky567/techdosenews
**Phase:** 8.1 — Repository Stabilization (Safe Fixes Only)

---

## 1. Total Article Files

| Location | Count | Notes |
|----------|-------|-------|
| `data/articles/index.json` | 38 | Single aggregated index, source of truth for site |
| `data/articles/*.json` (individual files) | 12 | Orphaned — NOT in index.json |
| `archive/phase8-backup/index.json` | 37 | Snapshot from Jun 26, 2026 |
| `admin-finalization` branch | 357 | Older pipeline, different ID scheme, 0 overlap with current |
| `feature/telegram-funnel` branch | 16 | Different branch |
| **Total unique articles on disk** | **50** | 38 indexed + 12 orphaned |
| **Total ever tracked** | **297** | published_links.json / published_topics.json / content_hashes.json |

---

## 2. Article Visibility

| Category | Count |
|----------|-------|
| Visible on site (index.json) | 38 |
| Hidden on disk but not indexed | 12 |
| Archived (phase8-backup) | 37 |
| In git history (admin-finalization branch) | 357 |
| Deleted from index (quality cleanup) | ~199 |
| English draft articles (status=draft, deleted) | ~131 |

---

## 3. Article Status Breakdown (index.json)

| Status | Count |
|--------|-------|
| `published` | 38 |
| `draft` | 0 |
| Total | 38 |

All 38 articles are published. No drafts exist in the current index.

---

## 4. Orphaned Individual Article Files

12 article files in `data/articles/` whose IDs do NOT appear in index.json:

| File Name | Article ID | Has Body? |
|-----------|-----------|-----------|
| `----.json` | art-1782167420206-uzy0ss | Yes |
| `---18-.json` | art-1781827220272-7t0iui | Yes |
| `---gemini-.json` | art-1781924420446-sc4zg5 | Yes |
| `---okta-google.json` | art-1782184567092-rjc44s | Yes |
| `--2026-7-.json` | art-1782284041063-jghve1 | Yes |
| `--ard--.json` | art-1782249387590-sxbvvn | Yes |
| `--chatgpt--.json` | art-1782226821405-dmbkd5 | Yes |
| `-chatgpt---.json` | art-1782207887552-d6ku4m | Yes |
| `-palantir---google.json` | art-1782206088269-2ytztd | Yes |
| `hsbc----.json` | art-1782186373238-5h5ii3 | Yes |
| `nard---llotja-de.json` | art-1782165612336-5hwrv4 | Yes |
| `shopify----.json` | art-1782171115295-v2u56f | Yes |

**Note:** All filenames are corrupted Arabic slugifications.

---

## 5. Duplicate IDs

**None found.** All 38 article IDs in index.json are unique. The 12 orphaned files have IDs not present in the index.

---

## 6. Missing IDs

IDs tracked in `published_links.json` (297 entries) that cannot be found in any current storage location: **~259**

---

## 7. Broken JSON

| File | Status |
|------|--------|
| `data/articles/index.json` | Valid |
| All 12 orphaned individual files | Valid |
| `archive/phase8-backup/index.json` | Valid |

**0 broken JSON files found.**

---

## 8. Image Summary

| Metric | Count |
|--------|-------|
| Articles with image | 38/38 (100%) |
| Unique image URLs | 37 (1 duplicate) |
| Articles with arabhardware.net images | 15 |
| Articles with pexels.com images | 22 |
| Articles with unsplash.com images | 1 |
| Articles missing image metadata | 36/38 (95%) |
| arabhardware.net URLs (verified working) | 15 (HTTP 200, valid WebP) |

See `reports/image_audit.md` for full details.

---

## 9. Repeated Images

| Image URL | Articles Using It |
|-----------|------------------|
| `https://images.pexels.com/photos/7561900/pexels-photo-7561900.jpeg` | art-1782648398720-gisbhi, art-1782648294337-ruj8z5 |

**1 duplicate image across 2 articles.**

---

## 10. Repeated Slugs

Slugs were not analyzed (many articles lack `seo_slug` field). This should be checked separately.

---

## 11. Phase 8.1 Changes Applied

| Fix | Before | After |
|-----|--------|-------|
| published_links.json | 297 orphaned URLs | 72 active links |
| published_topics.json | 297 stale topics | 38 current topics |
| content_hashes.json | 297 weak entries | 38 SHA-256 hashes |

---

## 12. Repeated Titles

| Title | Articles |
|-------|----------|
| "إيران ترد على البيان المشترك" | art-1782469820154-27yzm4, art-1782468020319-ux8ir7 |

**1 duplicate title across 2 articles** (both about Iran, likely near-duplicate content from BBC Arabic).

---

## 12. Storage Locations Summary

| Location | Path | Article Count |
|----------|------|--------------|
| Production index | `data/articles/index.json` | 38 |
| Orphaned files | `data/articles/*.json` | 12 |
| Archive | `archive/phase8-backup/` | 37 |
| Old branch | `origin/admin-finalization` | 357 |
| Old branch | `origin/feature/telegram-funnel` | 16 |
| Tracking (only) | `data/published_links.json` | 72 URLs (cleaned) |
| Tracking (only) | `data/published_topics.json` | 38 topics (cleaned) |
| Tracking (only) | `data/content_hashes.json` | 38 hashes (cleaned) |
