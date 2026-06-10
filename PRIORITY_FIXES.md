# Priority Fixes — TD بالعربي Pre-Domain Launch

Ranked by impact on Google indexing and user experience.

---

## Critical — Must Fix Before Domain Launch

### C1 — Add NewsArticle JSON-LD Schema

**Impact:** Extreme — Google requires structured data for news indexing.

**Action:** Add inline JSON-LD schema in `article.html` for each article. Use author Organization since no individual authors exist.

**Implementation:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "...",
  "description": "...",
  "image": "...",
  "datePublished": "...",
  "author": {"@type":"Organization","name":"TD بالعربي","url":"..."},
  "publisher": {"@type":"Organization","name":"TD بالعربي","logo":{"@type":"ImageObject","url":"..."}}
}
</script>
```

Add to `script.js` inside `loadArticle()` after line 439.

**Estimate:** 2 hours

---

### C2 — Add HTML Headings to Article Bodies

**Impact:** High — zero articles have `<h2>` or `<h3>`. Headings are a core content quality signal and improve readability.

**Action:** Modify article body HTML to include `<h2>` before each major section. Either:
- Edit bodies in `index.json` to insert heading tags
- Or implement JS-based heading generation from article structure

**Implementation:** Add `<h2>` wrappers around topic sentences in body HTML for all 85 articles, or modify the n8n pipeline to generate structured body content with headings.

**Estimate:** 4-8 hours (manual body editing) or pipeline fix

---

### C3 — Fix or Remove 11 Test Articles

**Impact:** High — 11 articles with <200 chars body will not index and may dilute site quality score.

**Action:** Either:
- Expand each test article to minimum 300 words (structured, with headings)
- Or remove them from `index.json`

**Articles:**
| ID | Current Body |
|----|-------------|
| test-ai-001 | 82 chars |
| test-ai-002 | 86 chars |
| test-ai-003 | 85 chars |
| test-companies-001 | 90 chars |
| test-companies-002 | 77 chars |
| test-sec-001 | 67 chars |
| test-sec-002 | 85 chars |
| test-mobile-001 | 77 chars |
| test-mobile-002 | 68 chars |
| test-ev-001 | 81 chars |
| art-test-20260609-011219 | 92 chars |

**Estimate:** 2 hours (expansion) or 30 min (removal)

---

### C4 — Add Canonical Tags

**Impact:** High — prevents duplicate content issues.

**Action:** Add `<link rel="canonical" href="...">` to:
- `article.html` → current article URL
- `category.html` → current category URL
- `index.html` → site root

**Implementation:** JS-based like `og:url`.

```js
document.querySelector('[rel="canonical"]').href = 'https://.../article.html?id=' + a.id;
```

**Estimate:** 30 min

---

### C5 — Add Organization + WebSite Schema

**Impact:** High — improves brand visibility in search results.

**Action:** Add global JSON-LD in `<head>` of all pages.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TD بالعربي",
  "url": "https://osamaelfeky567.github.io/techdosenews/",
  "logo": "https://osamaelfeky567.github.io/techdosenews/sandbox/og-image.png"
}
```

**Estimate:** 1 hour

---

## Important — Fix Within First Month

### I1 — Add Author Bylines

Add author field to each article (default: "TD بالعربي") and display it in article meta.

### I2 — Add Breadcrumb Schema

Implement on article pages: Home > Category > Article Title.

### I3 — Article Body Enrichment

For the 51 C-grade articles:
- Add more body content (target 500+ words)
- Add structured sections with headings
- Add bullet points where appropriate
- Add blockquotes for key statements

### I4 — Arabic Language Refinement

For identified issues:
- Remove AI filler phrases ("جدير بالذكر", "يذكر أن")
- Vary sentence openings
- Fix the Chinese-character article (art-1781015423376-4onw13)
- Add editorial voice

---

## Optional — Future Improvements

### O1 — SearchAction Schema

Add WebSite schema with SearchAction for Google Sitelinks search box.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "TD بالعربي",
  "url": "https://osamaelfeky567.github.io/techdosenews/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://osamaelfeky567.github.io/techdosenews/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### O2 — Article Quality Pipeline

Update n8n pipeline to:
- Enforce minimum 500 words body length
- Auto-generate h2 headings from article outline
- Add author attribution
- Include external source links

### O3 — Editorial Team Page

Create `/team.html` with editorial staff, credentials, and experience to boost EEAT.

### O4 — External Linking

Add outbound links to original sources within article bodies to improve trust and originality signals.

---

## Priority Matrix

| ID | Task | Effort | Indexing Impact | Priority |
|----|------|--------|----------------|----------|
| C1 | NewsArticle Schema | 2h | Extreme | 1 |
| C2 | HTML Headings | 4-8h | High | 2 |
| C3 | Fix test articles | 2h | High | 3 |
| C4 | Canonical tags | 30m | High | 4 |
| C5 | Organization Schema | 1h | High | 5 |
| I1-I4 | Content enrichment | 8-16h | Medium | 6-9 |
| O1-O4 | Future improvements | 4-8h | Low | 10-13 |

---

## Expected Impact After Fixes

| Metric | Before | After (estimated) |
|--------|--------|-------------------|
| Technical SEO | 20/100 | 75/100 |
| EEAT | 40% | 60% |
| Arabic Quality | 70% | 80% |
| Expected Index Rate | 57.2% | 80-85% |
| First Month Indexed | ~49 | ~68-72 |
