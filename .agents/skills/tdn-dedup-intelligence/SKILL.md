---
name: tdn-dedup-intelligence
description: "Dedup intelligence for Tech Dose News — analyze, improve, and verify article deduplication logic"
---

# Dedup Intelligence Skill

## Current Dedup System

**Location:** n8n Code node in `production_workflow.json`

**Algorithm:**
```javascript
function contentHash(str) {
  // 1. Normalize Arabic: remove tashkeel, normalize Alef variants (أ إ آ → ا),
  //    normalize Teh Marbuta (ة → ه), remove non-alphanumeric
  // 2. Concatenate: title + description.substring(0, 100)
  // 3. Hash: simple string hash (not cryptographic)
}
```

**Storage:** `data/content_hashes.json` — array of hashes, capped at 10,000

**Current behavior:**
- ✅ Hash dedup works for same title + same description
- ❌ `published_links.json` is written but NEVER read during dedup
- ❌ Same URL with different AI-generated title → false negative (missed duplicate)
- ❌ Same topic from different sources → not detected
- ❌ English→Arabic translated titles vary per Groq inference → hash may differ

## Known Issues

| Issue | Type | Impact |
|-------|------|--------|
| published_links.json unused | False negative | Same URL can be published under different titles |
| Hash only on title+desc[0:100] | False negative | Different descriptions of same story pass |
| Arabic normalization may collapse distinct words | False positive | Rare, low impact |

## Dedup V2 Proposed Design

**Three-layer dedup:**

1. **URL check** — read `published_links.json`, check `source_link` against existing links
2. **Hash check** — existing `contentHash()` on title + description[0:100]
3. **Semantic check** — optional: fuzzy match on normalized title (future)

**Layer priority:** URL → Hash → (future) Semantic

## Verification Checklist

- [ ] Each new article has a unique `source_link` not in published_links.json
- [ ] Each new article's contentHash not in content_hashes.json
- [ ] After dedup filter, verify no article was incorrectly blocked
- [ ] On false positive: add to allowlist and clear hash

## Dedup Tracking Files

| File | Purpose | Last Count |
|------|---------|-----------|
| `data/content_hashes.json` | Hash fingerprints | 12 entries |
| `data/published_links.json` | Source URLs | 13 entries (1 leftover) |
| `data/published_topics.json` | Article titles | 12 entries |
