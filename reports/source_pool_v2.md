# Source Pool v2 — Phase 11 Implementation Report

## Summary

Phase 11 expanded the production RSS source pool from 12 sources (several dead) to **17 verified sources** across 3 tiers.

## Source Architecture

### Tier 1 — Primary (trust: 95-100)
| Source | URL | Language | Trust Score |
|--------|-----|----------|-------------|
| BBC Arabic | feeds.bbci.co.uk/arabic/rss.xml | ar | 98 |
| عرب هاردوير | arabhardware.net/feed/ | ar | 97 |
| التقنية بلا حدود | tech-wd.com/wd/feed/ | ar | 96 |
| AIT News | aitnews.com/feed | ar | 95 |

### Tier 2 — Secondary (trust: 85-94)
| Source | URL | Language | Trust Score |
|--------|-----|----------|-------------|
| MIT Technology Review Arabic | technologyreview.ae/feed | ar | 93 |
| Ars Technica | feeds.arstechnica.com/arstechnica/index | en | 92 |
| TechCrunch | techcrunch.com/feed/ | en | 90 |
| The Verge | theverge.com/rss/index.xml | en | 88 |
| TECHx Arabic | techxmediaarabic.com/feed/ | ar | 87 |
| Tom's Hardware | tomshardware.com/feeds/all | en | 86 |
| GSMArena | gsmarena.com/rss-news-reviews.php3 | en | 85 |
| Android Authority | androidauthority.com/feed/ | en | 84 |

### Tier 3 — Backup (trust: 70-84)
| Source | URL | Language | Trust Score |
|--------|-----|----------|-------------|
| OpenAI Blog | openai.com/news/rss.xml | en | 80 |
| NVIDIA Blog | blogs.nvidia.com/feed/ | en | 78 |
| Microsoft AI Blog | blogs.microsoft.com/feed/ | en | 76 |
| Google AI Blog | blog.google/technology/ai/rss/ | en | 75 |
| ZDNet AI | zdnet.com/news/rss.xml | en | 72 |

## Removed Sources
- **تك عربي** (techarabi.com) — parked domain for sale
- **تيك العرب** (techalarab.com) — returns HTML page, no RSS feed
- **Google News fallback** — replaced by real RSS sources

## Pipeline Changes

### Two-Phase Candidate Collection
1. **Phase 1**: Fetch ALL enabled sources → parse → filter freshness (24h) → filter by existing hashes → collect into unified pool
2. **Phase 2**: Normalized title similarity dedup (>75% similarity removed) → rank by composite score → process top 8

### Ranking Formula
candidate.rankScore = freshness \* 0.35 + trustScore \* 0.30 + langScore \* 0.20 + techRelevance \* 0.15

Where:
- **freshness**: 1 - ageHours/48 (capped at 0)
- **trustScore**: source trust_score/100
- **langScore**: 1 for Arabic, 0.6 for English
- **techRelevance**: 1 for tech keyword match, 0.5 for non-match

### Error Resilience
- Individual RSS fetch failures are silently caught — one broken source never blocks others
- AIT News (403) gracefully skipped via try/catch

## Deployment
- Workflow ID: 9YULEXSG9gEtoqr2
- Deployed via PATCH /rest/workflows/{id}
- Status: Deployed (awaiting scheduled validation execution)

## Result Fields Added
- `rss_sources_attempted`: number of sources fetched
- `rss_candidates_raw`: total candidates before dedup
- `rss_candidates_after_dedup`: candidates after similarity dedup

## Next Steps
- [ ] Observe next scheduled execution for candidate counts
- [ ] Verify every enabled source is reachable
- [ ] Tune ranking weights based on publish success rate
- [ ] Add source_statistics.json tracking (per-execution source metrics)
