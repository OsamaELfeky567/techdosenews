# TDN Adsterra Deployment Report

## Final Ad Count

| Page | Slot | Size | Key | Method |
|---|---|---|---|---|
| Homepage | Top Banner | 728×90 | dc29c632… | Static (index.html) |
| Homepage | Mid Banner | 728×90 | dc29c632… | Static (index.html) |
| Homepage | Footer Banner | 728×90 | dc29c632… | Static (index.html) |
| Article | After Intro (p3) | 300×250 | 8650abba… | Dynamic (injectAdsIntoBody) |
| Article | Mid Article | 728×90 | dc29c632… | Dynamic (injectAdsIntoBody) |
| Article | Before End | 300×250 | 8650abba… | Dynamic (injectAdsIntoBody) |
| Article | Before Related | 300×250 | 8650abba… | Dynamic (loadArticle) |
| Article | Sidebar Skyscraper | 160×600 | c229277a… | Dynamic (loadArticle) |

**Total: 8 ad slots** (3 homepage + 5 article)

## Ad Placement Map

### Homepage
```
[Header]
[Top Banner 728×90]
[Hero Section]
[Latest + Trending News]
[Mid Banner 728×90]
[Sidebar + Main Content]
[Telegram CTA]
[Footer Banner 728×90]
[Footer]
```

### Article Page (Desktop)
```
[Header]
[Article Content]
  [After Intro 300×250 — after paragraph 3]
  [Mid Article 728×90 — middle of body]
  [Before End 300×250 — 2 paragraphs before end]
[Before Related 300×250]
[Related Articles]
[Sidebar: Skyscraper 160×600 (sticky)]
[Footer]
```

## Issues Fixed

| Issue | Status |
|---|---|
| 3 duplicate 300×250 on homepage | ✅ Removed |
| Grid card ad every 6 items | ✅ Removed |
| After-title 300×250 on article | ✅ Removed |
| Sidebar 300×250 on article | ✅ Removed |
| Wrong size: body after-intro was 728×90 → 300×250 | ✅ Fixed |
| Wrong size: body before-end was 728×90 → 300×250 | ✅ Fixed |
| `adHtml` unused variable | ✅ Removed |

## Mobile Safety

| Check | Status |
|---|---|
| 728×90 hidden on ≤768px (CSS: `.ad-leaderboard{display:none}`) | ✅ Existing |
| 160×600 hidden on ≤768px (CSS: `.sb-article-sidebar{display:none}`) | ✅ Existing |
| No horizontal scroll | ✅ `overflow:hidden` on `.ad-container` |
| No forced resize of non-fitting banners | ✅ Hidden, not squished |
| 300×250 safe on mobile | ✅ Fits 100% width via `max-width:300px` |

## Exclusions

| Page | Ads Present |
|---|---|
| admin/index.html | ✅ None |
| dashboard.html | ✅ None |
| 404.html | ✅ None |

## Performance

| Check | Status |
|---|---|
| Async script loading (`async` attribute) | ✅ Already on invoke.js |
| No duplicate Adsterra scripts | ✅ Each key loaded once |
| No layout shift from static banners | ✅ Fixed dimensions, reserved space via `ad-container` |
| No layout shift from dynamic banners | ✅ `createAdsterra` creates fixed-size containers |
| Lazy loading for content images | ✅ `loading="lazy"` on article images |

## Git

Commit: `TDN P0: Adsterra Production Deployment`

## Future Improvements

- Add ` IntersectionObserver` for lazy-loading below-fold ad slots
- Track ad impressions with analytics events
- Add A/B testing for 300×250 vs 728×90 performance on mobile
