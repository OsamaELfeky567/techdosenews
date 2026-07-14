# Source Performance Report

**Date:** 2026-07-14
**Phase:** 11C

## Performance Metrics

Per source, the pipeline tracks rolling statistics stored in `data/source_statistics.json`:

| Metric | Description |
|--------|-------------|
| fetch_count | Total RSS fetch attempts |
| valid_articles | Articles found in feed |
| published_articles | Articles published |
| duplicate_articles | Duplicates detected |
| rejected_articles | Quality-rejected articles |
| failed_fetches | Failed RSS fetches |
| average_quality | Mean quality score of published articles |
| consecutive_failures | Sequential failures count |
| publish_rate | published_articles / fetch_count |
| duplicate_rate | duplicate_articles / valid_articles |
| failure_rate | failed_fetches / fetch_count |
| health | GREEN/YELLOW/RED/DISABLED |
| health_history | Daily health snapshots (90 days) |
| daily_stats | Per-day published/failures (30 days) |

## Ranking Formula

```
source_score = (trust_score / 10) + (publish_rate * 50) + average_quality - (duplicate_rate * 30) - (failure_rate * 40)
```

- Higher score = higher `dynamic_priority`
- Recalculated daily
- Disabled sources get `dynamic_priority = 999`
