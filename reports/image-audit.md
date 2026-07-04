# Image Audit — Phase 8A

**Date:** 2026-07-04
**Source:** `data/articles/index.json` image fields

---

## Summary

| Metric | Value |
|--------|-------|
| Total Unique Images | 36 |
| Broken Images | 0 |
| Missing Images (empty field) | 0 |
| Duplicate Images | 1 |
| Articles with GitHub-persisted images | 0 |

---

## Image Domain Breakdown

| Domain | Count | % |
|--------|-------|---|
| `images.pexels.com` | 22 | 61% |
| `arabhardware.net` | 14 | 39% |
| `images.unsplash.com` | 1 | 3% |
| `raw.githubusercontent.com` | 0 | 0% |

---

## Issues

### 1. No GitHub-Persisted Images
Zero articles use images stored in the GitHub repository. All images link to external domains (Pexels, ArabHardware, Unsplash). This creates dependency on external CDNs.

### 2. Duplicate Image
- `pexels-photo-7561900.jpeg` used by 2 articles:
  - `art-1782648398720-gisbhi` — "لماذا ترتدي أي شيء آخر غير هودي الشمس..."
  - `art-1782648294337-ruj8z5` — "الفرق بين الغني والفقير"

### 3. No Image Metadata
- No articles have `image_source` populated (all null)
- No articles have `ogImage` field
- No articles store image dimensions or aspect ratio info

### 4. No ALT Text
Images use title as alt text in frontend, but no dedicated `image_alt` metadata exists.

---

## Conclusion
No broken images currently. 14 images from `arabhardware.net` (RSS enclosures) are the most "editorial" images. The remaining 22 are generic stock photos from Pexels — these should be replaced with more relevant images in a future phase.
