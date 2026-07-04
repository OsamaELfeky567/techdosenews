# Phase 7.4 — Editorial Quality Audit

## Step 1: Execution Analysis

### Execution Results (IDs 2241–2286)

| Exec | Status | Quality Score | Failed Because | Word Count | Entities | Internal Links | Image |
|------|--------|--------------|----------------|------------|----------|----------------|-------|
| 2273 | success | 42 | Hard failure — multiple dimensions <50% | — | — | 5 | pexels |
| 2274 | success | 37 | Hard failure — multiple dimensions <50% | — | — | 0 | pexels |
| 2275 | success | 50 | All dimensions below threshold | — | — | 5 | unsplash |
| 2277 | success | 49 | Hard failure — multiple dimensions <50% | — | — | 0 | pexels |
| 2278 | success | 32 | Hard failure — multiple dimensions <50% | — | — | 0 | pexels |
| 2279 | success | 43 | All dimensions below threshold | — | — | 5 | unsplash |
| 2280 | success | 50 | All dimensions below threshold | — | — | 0 | unsplash |
| 2281 | success | 44 | All dimensions below threshold | — | — | 6 | pexels |
| 2282 | success | 48 | All dimensions below threshold | — | — | 5 | pexels |
| 2283 | success | 40 | Hard failure — multiple dimensions <50% | — | — | 0 | pexels |
| 2284 | success | 46 | All dimensions below threshold | — | — | 0 | pexels |
| 2285 | success | 70 | Information value too low (3 digits, 194 words) | 194 | company only | 1 | pexels |
| 2286 | success | 70 | Information value too low | — | 2t, C | 2 | pexels |

### Published Articles Score Analysis (n=14)

| Stat | Value |
|------|-------|
| **Average score** | 62.8 |
| **Median** | 63 |
| **Highest** | 78 |
| **Lowest** | 51 |
| **Passed (≥80)** | 0 |

### Score Distribution

| Range | Count |
|-------|-------|
| 50–59 | 5 |
| 60–69 | 6 |
| 70–79 | 3 |

### Common Failure Reasons (ranked)

1. **Paragraph count = 1** (affects Editorial Flow, Readability, Intro) — body stored as HTML in index so `\n\n` split yields 1 paragraph. In pipeline (raw body) this is fine, but scoring on HTML body shows structural weakness.
2. **Word count too low** (<450 words) — articles under 450 lose ~10pts from word count + readability
3. **No product/technology entities** — most articles lack products or technologies arrays
4. **Internal links dependency** — 3+ links required for full Technical Depth score; early articles have 0 links
5. **Headline constraints** — title length 25-75 gets only 2pt (loses 2pts vs 30-65 range)
6. **Generic word detection** inverted logic — rewards titles that DON'T contain specific Arabic words, but some good titles contain "جديد" naturally

---

## Step 2: Fake Penalties Detected

### QUESTIONABLE rules:

1. **Unique digits threshold (10pt)**:
   - Requires 12+ unique multi-digit numbers for full score
   - Only 6+ numbers for partial (7pt)
   - Good articles with 4-5 numbers score 4pt — loses 6pts unnecessarily
   - **Fix**: Lower thresholds to 8+/5+/3+

2. **Version mentions (8pt)**:
   - Requires 3+ unique versions like "GPT-4o", "iOS 18" for full score
   - Many excellent articles don't mention version numbers
   - **Fix**: Reduce to 2+/1+ thresholds, drop weight to 4pt max

3. **Word count double-counting**:
   - Word count appears in Information Value (7pt) AND Readability (5pt) = 12pt total
   - Same metric rewarded twice
   - **Fix**: Keep word count in Information Value only (5pt), reduce Readability weight

4. **Internal links dependency (5pt)**:
   - Requires 3+ internal links for full Technical Depth score
   - Internal links depend on entity match against existing index
   - First articles have no links; entity-sparse articles get 0 links
   - **Fix**: Reduce to optional bonus (2pt), not core requirement

5. **Paragraph count constraint (4pt)**:
   - Requires 5-15 paragraphs for full Editorial Flow score
   - Articles with 3-4 paragraphs still lose 2pt despite being well-structured
   - **Fix**: Widen range to 3-20

6. **SEO completeness bonus**:
   - SEO title length ≥35 (2pt), meta desc ≥100 (1pt), focus keyword (1pt)
   - These are metadata fields populated by the AI — not editorial quality
   - **Fix**: Keep but reduce to de facto bonus (included in total)

### REMOVE rules:

None strictly — all rules capture some signal. But weights need significant rebalancing.

### GOOD rules (keep/strengthen):

- **No AI clichés** ← keep, this is a journalism quality signal
- **No cliché start in intro** ← keep, but reduce penalty
- **Unique paragraph openings** ← keep, signals writing variety
- **Conclusion length** ← keep, signals article has proper ending
- **Entity presence** ← keep, but don't over-weight
- **Technical depth** ← keep, core to tech journalism

---

## Step 3: Rebalanced Weights

| Category | Old | New | Change |
|----------|-----|-----|--------|
| Information Value | 30 | 35 | +5 |
| Editorial Flow | 13 | 20 | +7 |
| Headline Quality | 12 | 15 | +3 |
| Intro Quality | 12 | 10 | -2 |
| Technical Depth | 15 | 10 | -5 |
| Readability | 13 | 5 | -8 |
| SEO Completeness | 5 | 5 | 0 |
| **Total** | **100** | **100** | |

---

## Step 4: Journalism Metrics (New)

### Positive signals rewarded:

| Signal | Category | Points |
|--------|----------|--------|
| Explains why / impact ("يؤدي", "بسبب", "تأثير") | Information Value | +4 |
| Explains background ("بدأ", "أطلقت", "منذ") | Information Value | +3 |
| Explains future ("سوف", "مستقبل", "يتوقع") | Information Value | +3 |
| Contains comparison ("مقارنة", "أكبر", "أفضل") | Information Value | +3 |
| Includes numbers/figures | Information Value | 8 |
| Contains technical explanation | Technical Depth | 5 |

### Negative signals penalized:

| Signal | Penalty |
|--------|---------|
| Repetitive openings | Editorial Flow -2 |
| AI clichés | Editorial Flow -2 each |
| Generic conclusion ("في النهاية", "ختاماً") | Editorial Flow -2 |
| Vague language ("جداً", "للغاية") | Editorial Flow -1 |
| Translation artifacts | Editorial Flow -2 |

---

## Step 5: Rewrite Logic

Changed from "regenerate entire article" to **targeted rewrite**:

- **Bad headline** → rewrite headline only (dimension: headline)
- **Weak intro** → rewrite intro only (dimension: intro)
- **Weak conclusion** → rewrite conclusion only (dimension: flow)
- **Weak technical section** → expand technical section only (dimension: technical)
- **Low information value** → add more specific facts/numbers (dimension: info)
- **SEO incomplete** → fill SEO fields only (dimension: seo)

Each rewrite targets ONE dimension with a specific prompt, preserving the rest of the article.

---

## Step 6: Validation

When the new scoring model is applied to the last 14 published articles:

- Expected: 70%+ of "good" articles (those with professional headlines, strong intro, good technical depth) should naturally score ≥80
- Weak RSS rewrites (low word count, no entities) should stay <60

### Current scores vs Expected new scores:

| Article Topic | Current | Expected New | Reason |
|--------------|---------|-------------|--------|
| Xiaomi 18 Pro Max | 78 | **85** | Good headline, entities, internal links |
| iOS 26.5.2 update | 71 | **82** | Strong intro, versions, technical depth |
| iPhone Ultra foldable | 69 | **80** | Good headline, product focus |
| DLSS new games | 68 | **81** | Technical depth, entities |
| Sony PS6 price | 65 | **75** | Weak product data |
| Samsung lawsuit | 54 | **60** | Weak structure |
| Kirin 2026 Pro | 51 | **70** | Low word count but decent entity |

---

## Step 7: Safety Rule

If an article satisfies ALL of:
- 700+ words
- Good image (pexels/unsplash/original)
- Good entities (company + product OR technology)
- Professional headline (30-65 chars, entity present)
- Strong intro (25+ words, digit present, not cliché)
- Good technical explanation

Then it **must** naturally score ≥80.

If it still fails under the new model, the scoring model is wrong — fix the model, not the threshold.

---

## Step 8: Theoretical Score Projections

### Good article profile (700+ words, 10 paragraphs, entities, professional headline)

| Category | Max | Est. Score |
|----------|-----|-----------|
| Information Value | 35 | 33 (8 digits + 5 wc + 5 combo + 4 versions + 2+2+2+2 signals + 3 explain) |
| Editorial Flow | 20 | 20 (4 para + 3 unique + 2 conclusion + 4 cliches + 3 variance + 4 signals) |
| Headline Quality | 15 | 15 (5 length + 4 entity + 1 no Q + 3 not generic + 2 action) |
| Intro Quality | 10 | 10 (2 length + 3 no cliche + 2 digit + 3 substance) |
| Readability | 5 | 3 (2 wc + 0 avgPara + 1 maxSent) |
| Technical Depth | 10 | 10 (2 prod + 1 tech + 1 ai + 1 company + 2 links + 3 explain) |
| SEO Completeness | 5 | 5 (2 title + 1 desc + 1 kw + 1 sec) |
| **Total** | **100** | **96** |

### Good article: naturally passes at 96 ✓

### Moderate article profile (600 words, 8 paragraphs, some entities)

| Category | Max | Est. Score |
|----------|-----|-----------|
| Information Value | 35 | 26 (5 digits + 3 wc + 5 combo + 2 ver + 2+2+2+2 sig + 3 explain) |
| Editorial Flow | 20 | 16 (4 para + 3 unique + 2 conclusion + 4 cliches + 3 variance + 0 signals) |
| Headline Quality | 15 | 13 (5 length + 4 entity + 1 no Q + 3 not generic + 0 action) |
| Intro Quality | 10 | 10 (full) |
| Readability | 5 | 3 (2 wc + 0 avgPara + 1 maxSent) |
| Technical Depth | 10 | 8 (2 prod + 1 tech + 1 ai + 1 company + 0 links + 3 explain) |
| SEO Completeness | 5 | 4 (2 title + 0 desc + 1 kw + 1 sec) |
| **Total** | **100** | **80** |

### Moderate article: passes at 80 ✓

### Weak article profile (300 words, 3 paragraphs, no entities, generic headline)

| Category | Max | Est. Score |
|----------|-----|-----------|
| Information Value | 35 | 10 (1 digits + 2 wc + 0 combo + 0 ver + 1+2+0+0 sig + 0 explain) |
| Editorial Flow | 20 | 9 (2 para + 2 unique + 1 conclusion + 2 cliches + 0 variance + 2 signals) |
| Headline Quality | 15 | 6 (3 length + 0 entity + 1 no Q + 0 not generic + 0 action) |
| Intro Quality | 10 | 5 (1 length + 0 cliche + 2 digit + 0 substance) |
| Readability | 5 | 2 (0 wc + 1 avgPara + 1 maxSent) |
| Technical Depth | 10 | 0 |
| SEO Completeness | 5 | 1 (0 title + 0 desc + 0 kw + 1 sec) |
| **Total** | **100** | **33** |

### Weak article: correctly rejected at 33 ✗

## Validation

**Tier-1 articles (700+ words, strong entities, professional headline) should score 85–96**
**Tier-2 articles (600+ words, some entities, decent headline) should score 75–85**
**Tier-3 articles (<500 words, weak entities, generic headline) should score 30–60**

Threshold remains at **80**, ensuring published articles are genuinely high quality while removing the formatting penalties that previously caused false negatives.
