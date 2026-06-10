# Google Readiness Audit — TD بالعربي

**Date:** 10 June 2026
**Articles:** 85
**Audit Scope:** Full pre-launch technical, content, and indexing readiness

---

## Executive Summary

TD Al Arabi has 85 articles across 5 categories. The site has clean robots.txt, sitemap.xml (92 URLs), index,follow on all pages, legal pages, and a polished UI. However, critical gaps exist in structured data, article content quality (no headings/bad structure), and EEAT signals that will significantly impact Google indexing performance.

---

## Part 1 — Technical SEO Audit

### Indexability Score: 18 / 25

| Criteria | Status | Notes |
|----------|--------|-------|
| robots.txt | ✅ Present | Allows all, sitemap linked |
| sitemap.xml | ✅ Present | 92 URLs (1 home + 1 dashboard + 5 cats + 85 articles) |
| Canonical tags | ❌ Missing | No `<link rel="canonical">` on any page |
| Meta robots | ✅ `index,follow` | All pages |
| URL structure | ✅ Clean | `article.html?id=<id>`, `category.html?cat=<key>` |
| Duplicate URLs | ⚠️ Potential | No canonical — article parameters could create dupes |
| Pagination | ⚠️ Not applicable | Articles are single-page |
| Category URLs | ✅ Consistent | 5 clean category params |

**Missing:** Canonical tags on all pages.

**Fix:** Add `<link rel="canonical" href="...">` to article.html, category.html, index.html.

### Structured Data Audit Score: 2 / 25

| Schema Type | Status | Notes |
|-------------|--------|-------|
| NewsArticle | ❌ Missing | No JSON-LD schema on article pages |
| Organization | ❌ Missing | No organization schema |
| WebSite | ❌ Missing | No website schema |
| Breadcrumb | ❌ Missing | No breadcrumb schema |
| Author | ❌ Missing | No author schema |
| SearchAction | ❌ Missing | No search action schema |

**Impact:** Zero structured data. Google relies heavily on schema for news indexing. This is the single biggest technical SEO gap.

**Fix Priority:** CRITICAL

### Core Technical SEO Score: 20 / 100

Breakdown:
- Indexability: 18/25
- Structured Data: 2/25
- Performance (estimated): 20/25 (good LCP, reasonable CLS)
- Mobile friendliness: 15/15
- HTTPS: 10/10

---

## Part 2 — Crawlability Audit

### Internal Linking Score: 10 / 15

| Metric | Value | Assessment |
|--------|-------|------------|
| Homepage → article | ✅ via JS `goto()` | 1 click |
| Category → article | ✅ via inline | 1 click |
| Article → related | ✅ 4 related articles | Good |
| Footer links | ✅ All pages | Good |
| Orphan articles | ⚠️ 11 test articles | D-grade, weak/no body |

**Orphan risk:** 11 test articles (body <200 chars) exist but have minimal internal link value.

### Crawl Depth Score: 15 / 15

All pages within 2 clicks from homepage:
- Click 1: category or article page
- Click 2: article page from category

### Sitemap Quality Score: 10 / 15

- ✅ Covers all 85 articles
- ✅ Includes homepage, categories, dashboard
- ❌ No lastmod dates (all set to static date)
- ❌ No article-level metadata
- ✅ Valid XML, proper encoding for special chars in URLs

### Crawlability Score: 12 / 15

---

## Part 3 — Content Quality Audit

### Overall Results

| Grade | Count | Percentage |
|-------|-------|------------|
| A (90-100) | 0 | 0% |
| B (75-89) | 23 | 27.1% |
| C (60-74) | 51 | 60.0% |
| D (<60) | 11 | 12.9% |

**Average Score: 69.2 / 100**

### Component Averages

| Component | Score | Max | Assessment |
|-----------|-------|-----|------------|
| Title Quality | 14.0 | 20 | OK — titles are descriptive but lack hooks |
| Introduction | 14.9 | 20 | Decent — most have excerpts >50 chars |
| Structure | 7.3 | 20 | **Critical** — ZERO articles have headings |
| Originality | 14.4 | 20 | Moderate — some filler phrases detected |
| Media Quality | 8.9 | 10 | Good — all articles have images |
| Internal Links | 9.6 | 10 | Excellent — all have tags + category |

### Body Length Distribution

| Range | Count | Assessment |
|-------|-------|------------|
| <200 chars | 11 | Too short — high risk of non-indexing |
| 200-500 chars | 5 | Marginal |
| 500-1000 chars | 60 | Good |
| 1000+ chars | 9 | Excellent |

### Key Finding: No Headings

Zero articles contain HTML heading tags (`<h2>`, `<h3>`, etc.) in their body. This is a critical content quality signal for Google. Article body text is delivered as flat `<p>` tags.

### D-Grade Articles (High Risk of Not Indexing)

11 articles identified with scores below 60:
- 10 test articles (from testing pipeline) — body <100 chars
- 1 broken article (art-test-20260609-011219) — body 92 chars

---

## Part 4 — EEAT Audit

### Score: 8 / 20

| Signal | Status | Notes |
|--------|--------|-------|
| About page | ✅ Present | Basic, no team details |
| Contact page | ✅ Present | Email + Telegram |
| Privacy policy | ✅ Present | Basic |
| Terms of use | ✅ Present | Basic |
| Disclaimer | ✅ Present | Basic |
| HTTPS | ✅ Present | GitHub Pages |
| Author pages | ❌ Missing | No author info |
| Author bylines | ❌ Missing | No author on any article |
| Editorial policy | ❌ Missing | No editorial guidelines |
| Team information | ❌ Missing | No team page |
| Company info | ❌ Missing | No legal entity info |
| External citations | ⚠️ Weak | Source name but no links to sources |

**Missing trust signals:**
- No author bylines on any article
- No editorial team information
- No editorial policy or corrections page
- No external linking to original sources
- No author bios or expertise indicators

---

## Part 5 — Arabic Content Quality Audit

### Score: 14 / 20

| Criteria | Rating | Notes |
|----------|--------|-------|
| Grammar | ✅ Good | Acceptable Arabic |
| Punctuation | ✅ Good | Reasonable |
| Encoding | ✅ Clean | UTF-8, no mojibake in production |
| Translation artifacts | ⚠️ Some | A few articles show non-native phrasing |
| AI repetitive openings | ⚠️ Moderate | Some articles start with "يعد/تعد" |
| AI filler phrases | ⚠️ Some | "جدير بالذكر" detected in some bodies |
| Robotic structure | ⚠️ Yes | Articles lack varied sentence structure |
| Arabic journalism quality | Acceptable | Not professional journalism grade but readable |

### Arabic Quality Score: 14 / 20

**Issues:**
- Template wording visible in some articles
- Lack of editorial voice
- Some articles have choppy sentence flow
- One article contains Chinese characters (ID: art-1781015423376-4onw13)

---

## Part 6 — Mobile UX Audit

### Score: 9 / 10

| Breakpoint | Status | Notes |
|------------|--------|-------|
| 360px | ✅ Clean | No overflow, good spacing |
| 390px | ✅ Clean | No overflow, good spacing |
| 412px | ✅ Clean | No overflow, good spacing |
| 768px | ✅ Clean | No overflow, good spacing |

Minor issue: Ad placeholder labels at 360px are slightly cramped at full width.

---

## Part 7 — Google Indexing Probability Model

### Expected Index Rate: 57.2%

**Calculation:**

| Grade | Count | Index Probability | Weighted |
|-------|-------|-------------------|----------|
| A | 0 | 95% | 0.0 |
| B | 23 | 80% | 18.4 |
| C | 51 | 55% | 28.1 |
| D | 11 | 20% | 2.2 |
| **Total** | **85** | | **48.7 / 85 = 57.2%** |

### First Month Indexed Articles

**Estimated:** 49 / 85 articles indexed within first 30 days.

Justification:
- 23 B-grade articles likely to index quickly (80%)
- 51 C-grade have moderate index probability (55%) — many will get indexed but some won't
- 11 D-grade very unlikely to index
- Zero structured data will significantly slow initial indexing

### Domain Launch Readiness

## NOT READY ⚠️

### Justification

| Criteria | Target | Actual | Pass? |
|----------|--------|--------|-------|
| Technical SEO | ≥ 90% | 20% | ❌ |
| EEAT | ≥ 80% | 40% | ❌ |
| Arabic Quality | ≥ 90% | 70% | ❌ |
| Mobile UX | ≥ 95% | 90% | ❌ |
| Expected Index Rate | ≥ 85% | 57.2% | ❌ |

**The site needs significant improvements before domain migration:**

1. **Critical:** Add NewsArticle JSON-LD schema to all article pages
2. **Critical:** Add HTML headings (h2-h3) to all article bodies
3. **Critical:** Fix/remove 11 test articles with body <200 chars
4. **Important:** Add canonical tags
5. **Important:** Add author bylines
6. **Important:** Add Organization + WebSite schema
7. **Important:** Improve article bodies with headings and structure
8. **Optional:** Add breadcrumb schema, search action schema

---

## Appendix A — Schema Template (NewsArticle)

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "{{ARTICLE_TITLE}}",
  "description": "{{ARTICLE_EXCERPT}}",
  "image": "{{ARTICLE_IMAGE}}",
  "datePublished": "{{ARTICLE_DATE}}",
  "dateModified": "{{ARTICLE_DATE}}",
  "author": {
    "@type": "Organization",
    "name": "TD بالعربي",
    "url": "https://osamaelfeky567.github.io/techdosenews/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "TD بالعربي",
    "logo": {
      "@type": "ImageObject",
      "url": "https://osamaelfeky567.github.io/techdosenews/sandbox/og-image.png"
    }
  }
}
```

## Appendix B — Category Distribution

| Category | Count | Avg Score |
|----------|-------|-----------|
| الذكاء الاصطناعي | 39 | 70.4 |
| شركات | 16 | 70.4 |
| هواتف ذكية | 7 | 66.3 |
| أمن سيبراني | 4 | 66.5 |
| سيارات كهربائية | 1 | 74.0 |
| غير مصنف | 18 | 66.7 |
