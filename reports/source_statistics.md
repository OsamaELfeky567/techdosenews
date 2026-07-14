# Source Statistics — Per-Source Metrics

## Summary
This report tracks per-source performance metrics to inform future trust score adjustments and tier promotions/demotions.

## Metrics Tracked (per execution)
- `fetched`: article count from each RSS fetch
- `fresh`: articles within 24h window
- `candidates`: articles surviving hash dedup
- `selected`: articles sent to AI generation (by rank)

## Planned Implementation
Source statistics will be stored in `data/source_stats.json` in the GitHub repo, updated after each execution.

### Schema (planned)
```json
{
  "source_id": {
    "last_fetch": "ISO timestamp",
    "total_fetched": 0,
    "total_published": 0,
    "total_rejected": 0,
    "duplicate_rate": 0,
    "average_quality": 0,
    "failure_count": 0,
    "publish_rate": 0
  }
}
```

### Fields
| Field | Description |
|-------|-------------|
| last_fetch | Most recent successful RSS fetch time |
| total_fetched | Cumulative article count fetched |
| total_published | Articles from this source that passed quality gate |
| total_rejected | Articles from this source that failed quality gate |
| duplicate_rate | Fraction of articles that were duplicates |
| average_quality | Mean quality score of AI-generated articles |
| failure_count | Number of RSS fetch failures |
| publish_rate | total_published / total_fetched |

## Current Sources (17)

| Source ID | Name | Tier | Trust Score | Status |
|-----------|------|------|-------------|--------|
| bbc-ar | BBC Arabic | 1 | 98 | Active |
| arabhd | عرب هاردوير | 1 | 97 | Active |
| techwd | التقنية بلا حدود | 1 | 96 | Active |
| aitnews | AIT News | 1 | 95 | Active (403 - may fail) |
| techcr | TechCrunch | 2 | 90 | Active |
| verge | The Verge | 2 | 88 | Active |
| arstech | Ars Technica | 2 | 92 | Active |
| gsmarena | GSMArena | 2 | 85 | Active |
| androidauth | Android Authority | 2 | 84 | Active |
| tomshw | Tom's Hardware | 2 | 86 | Active |
| techxar | TECHx Arabic | 2 | 87 | Active |
| mitrev | MIT Tech Review Arabic | 2 | 93 | Active |
| openai | OpenAI Blog | 3 | 80 | Active |
| nvidia | NVIDIA Blog | 3 | 78 | Active |
| msai | Microsoft AI Blog | 3 | 76 | Active |
| googleai | Google AI Blog | 3 | 75 | Active |
| zdnetai | ZDNet AI | 3 | 72 | Active |

## Next Steps
- [ ] Add execution-time collection of per-source metrics
- [ ] Store to data/source_stats.json
- [ ] Implement weekly report generation
