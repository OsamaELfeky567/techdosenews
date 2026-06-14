# Google News Readiness Report — TECH DOSE NEWS

## Audit Date
2026-06-14

## Scoring

| Area | Score (0-10) | Status |
|------|:---:|:------:|
| NewsArticle Schema | **0** | ❌ Not present |
| Organization Schema | **8** | ✅ Present on all pages |
| Sitemap (article coverage) | **3** | ⚠️ 60/273 articles, no lastmod/news |
| Robots.txt | **10** | ✅ Correct |
| Canonical URLs | **7** | ✅ Present, but static (no article-specific dynamic) |
| Open Graph / Twitter | **8** | ✅ Present, but static (not article-specific) |
| Article Dates | **2** | ❌ No visible published date in HTML |
| Image Requirements | **5** | ⚠️ 100% have images, but 130 share the same |
| Category Structure | **7** | ✅ 6 categories, clear taxonomy |
| Author Information | **0** | ❌ No author markup anywhere |
| Content Quality | **7** | ⚠️ Original content, 273 articles, body exists for all |
| **Overall** | **5.2** | ⚠️ Needs work |

## Detailed Findings

### 1. NewsArticle Schema — ❌ FAIL (0/10)
- **Status:** No NewsArticle JSON-LD on any page
- **Found:** Only `Organization` schema on article pages
- **Required for Google News:** Articles must have `NewsArticle` schema with `@type: NewsArticle`, `headline`, `datePublished`, `dateModified`, `image`, `author`, `publisher`
- **Fix:** Generate dynamic NewsArticle schema in `script.js` when article loads

### 2. Organization Schema — ✅ PASS (8/10)
- **Status:** Present on homepage and article pages
- **Content:** Name, URL, logo — all correct
- **Missing:** `sameAs` links (Telegram, Facebook, Twitter), `publisher` type for Google News
- **Fix:** Add social links and `publisher` property

### 3. Sitemap — ⚠️ PARTIAL (3/10)
- **Current:** XML sitemap with 70 URLs
- **Article coverage:** Only ~60 of 273 articles indexed (22%)
- **Missing:** `<lastmod>` tags on all URLs
- **Missing:** `<news:news>` extension for Google News
- **Includes:** 404.html (minor), editorial-policy.html
- **Fix:** Generate sitemap dynamically with all articles, add lastmod and news:news

### 4. Robots.txt — ✅ PASS (10/10)
- **Content:** Correct — allows Googlebot, allows all except dashboard.html
- **Sitemap:** Properly linked
- **No disallow of Google News crawler**

### 5. Canonical URLs — ⚠️ PARTIAL (7/10)
- **Present:** On all pages
- **Issue:** Static canonical `<link>` — same URL regardless of article ID
- **Fix:** Update canonical dynamically when article loads (use JS to set article-specific canonical)

### 6. Open Graph / Twitter Cards — ⚠️ PARTIAL (8/10)
- **Present:** On all pages with og:title, og:description, og:image, og:url, twitter:card
- **Issue:** Static values — don't change per article
- **Fix:** Update OG tags dynamically when article loads

### 7. Article Dates — ❌ FAIL (2/10)
- **Status:** No visible published date in HTML
- **script.js** dynamically renders dates but not in JSON-LD
- **Fix:** Add `datePublished` to NewsArticle schema

### 8. Image Requirements — ⚠️ PARTIAL (5/10)
- **100% image coverage:** ✅
- **Image source:** Unsplash (good quality) ✅
- **Image width:** 800px (Google News requires 1200px minimum) ❌
- **130 articles share the same image** ❌
- **Fix:** Increase to 1200px, deduplicate

### 9. Category Structure — ✅ PASS (7/10)
- **6 clear categories:** AI, Companies, Security, Mobile, EVs, Tech
- **Clean URL structure:** category.html?cat=ai
- **Issue:** Not in NewsArticle schema
- **Fix:** Add `articleSection` to NewsArticle schema

### 10. Author Information — ❌ FAIL (0/10)
- **No author markup** anywhere in the HTML
- No `author` property in JSON-LD
- **Fix:** Add author field to NewsArticle schema

### 11. Content Quality — ⚠️ PARTIAL (7/10)
- **273 articles** with unique content
- **Body exists** for all articles
- **Original Arabic content** — Google News values original journalism
- **Issue:** Article length varies; some are very short
- **No bylines or author credit**

## Critical Issues for Google News Inclusion

1. **Add NewsArticle schema** — This is the #1 blocker. Without it, articles won't be considered for Google News.
2. **Fix sitemap** — Include all articles, add lastmod and news:news extension.
3. **Dynamic per-article metadata** — OG tags, canonical, and JSON-LD must reflect the actual article loaded.
4. **No author** — Google News prefers content with clear authorship.
5. **Image diversity** — 130 articles sharing 1 image is a flag.

## Recommendation

This site has solid technical foundations (good robots, schemas for org, OG tags, https) but is NOT ready for Google News submission. The top 3 actions:

1. **+NewsArticle schema** (dynamic, per-article)
2. **+Full sitemap** (all 273 articles, lastmod, news:news)
3. **+Dynamic metadata** (OG, canonical per article)
