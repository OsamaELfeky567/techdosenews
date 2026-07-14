# Source Ranking — Candidate Scoring Algorithm

## Overview
All candidates are collected from all enabled sources, then ranked by a composite score before AI generation.

## Formula

```
rankScore = freshScore × 0.35 + trustScore × 0.30 + langScore × 0.20 + techRelevance × 0.15
```

### Component Definitions

#### freshScore (weight: 0.35)
```
freshScore = max(0, 1 - ageHours / 48)
```
- ageHours = time since article publication
- Fresh articles (0h old): score = 1.0
- 24h old: score = 0.5
- 48h+ old: score = 0.0

#### trustScore (weight: 0.30)
```
trustScore = source.trust_score / 100
```
- Tier 1 sources: 0.95-0.98
- Tier 2 sources: 0.84-0.93
- Tier 3 sources: 0.72-0.80

#### langScore (weight: 0.20)
- Arabic (ar): 1.0
- English (en): 0.6

Arabic is preferred because the output pipeline produces Arabic articles.

#### techRelevance (weight: 0.15)
- Article title/desc contains TECH_KW keyword: 1.0
- No match: 0.5

All articles from tier 2+ sources go through isTech() filtering; this gives a slight edge to explicitly tech-related articles.

## Dedup Before Ranking

### Hash-based Dedup
- Each article is hashed via contentHash(title, contentEncoded|desc)
- Articles with existing hashes (in data/content_hashes.json) are excluded

### Similarity-based Dedup
- Normalized titles compared using Levenshtein similarity
- Pairs with >75% similarity: only highest-ranked kept
- Prevents near-identical articles (e.g., same news from different sources)

## Candidate Limits
- Maximum candidates processed per execution: 8
- All 8 go through AI generation in ranked order
- Processing stops when one article passes the quality gate

## Planned Improvements
- Track per-source success/publish rate to adjust trust scores dynamically
- Apply category preference weights based on recent publish history
- Add content-length bonus for articles with more substance
