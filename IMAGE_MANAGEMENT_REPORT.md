# Image Management Report — TECH DOSE NEWS

## Audit Date
2026-06-14

## Summary

| Metric | Value |
|--------|-------|
| Total articles | 273 |
| Articles with images | **273 (100%)** |
| Articles without images | **0** |
| Broken images (404) | **3** |
| Unique images | 272 (1 duplicate) |
| Default/fallback image overuse | **130 articles share the same photo** |
| Generic stock images | 0 |

## Image Source
100% of images come from **Unsplash** via the `photo-XXXXX?w=800&q=80` format. No external image hosts used.

## Issues Found

### 1. Massive Overuse of Default Image
**Count:** 130 articles use `https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80`

This is a circuit board / tech generic photo being used as a fallback. The image pipeline assigns the same Unsplash photo when the query is generic or the automation fails to find a relevant image.

**Impact:** Poor UX, bad SEO (Google News requires distinct images per article), weakens EEAT signals.

**Recommendation:** Implement a curated image assignment workflow. Replace the 130 articles with context-relevant images.

### 2. Broken Images (404)
| Article ID | Image URL |
|---|---|
| pipeline-1781025999103-9 | `photo-1548094874-84d3a1db75c8` (404) |
| art-1780963222833-mwxbt1 | `photo-1603791440384-56cd371ee9a2` (404) |
| art-1780648222672-iuukcf | `photo-1516838884028-2e66d7f6e5b7` (404) |

**Impact:** Broken images on article pages, bad UX.

**Recommendation:** Replace with working Unsplash photos matching article content.

### 3. Missing Image Management Tools
The admin panel has basic image URL editing but lacks:
- Image preview before save
- Broken image detection on article list
- One-click image replacement
- Image library or browser

## Image Workflow (Manual)

### Current Workflow
1. Articles come from RSS → Groq AI processing → Published with Unsplash photo
2. Admin panel: Edit article → Change image URL field → Save
3. No image preview, no validation

### Required Improvements
1. **Image URL editor** with preview in admin panel
2. **Broken image scanner** to flag 404s
3. **Image replacement** workflow with Unsplash search integration
4. **Bulk image fixer** for the 130 default-image articles
5. **Deduplication checker**

## Image Requirements for Google News
- Minimum width: 1200px — ✅ (Unsplash serves at 800px by default, need to increase)
- High quality: ✅ (Unsplash source)
- Distinct per article: ❌ (130 share the same photo)
- Article-image relevance: ❌ (many are generic)

## Recommendation Priority
1. Fix 3 broken images (replace with working URLs)
2. Replace the 130 default images with unique, relevant photos
3. Add image preview to admin panel editor
4. Increase image width to 1200px+ for Google News compliance
