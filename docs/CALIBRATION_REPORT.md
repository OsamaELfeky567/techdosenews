# TDN v5.4.3 — Calibration Report

**Period**: 2026-05-26 → 2026-05-27 (24h)
**Mode**: Controlled Live Calibration
**Pipeline**: 9-node sequential (no modifications during window)

## How to use

After EACH execution:
1. Check n8n execution output (or system.log on GitHub)
2. Check GitHub `data/articles/index.json`
3. Check `data/published_topics.json`, `data/content_hashes.json`
4. Fill one row in the table below
5. If article was published → verify Telegram + GitHub Pages URL manually
6. Append qualitative notes for APPROVED or REJECTED articles

---

## Execution Log

| # | execution_id | time | rss_candidates | freshness_pass | dedup_pass | writer_generated | reviewer_approved | published | telegram_sent | rejection_reason | article_topic | source | duration(s) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | | | | | |
| 2 | | | | | | | | | | | | | |
| 3 | | | | | | | | | | | | | |
| 4 | | | | | | | | | | | | | |
| 5 | | | | | | | | | | | | | |
| 6 | | | | | | | | | | | | | |
| 7 | | | | | | | | | | | | | |
| 8 | | | | | | | | | | | | | |
| 9 | | | | | | | | | | | | | |
| 10 | | | | | | | | | | | | | |
| 11 | | | | | | | | | | | | | |
| 12 | | | | | | | | | | | | | |
| 13 | | | | | | | | | | | | | |
| 14 | | | | | | | | | | | | | |
| 15 | | | | | | | | | | | | | |
| 16 | | | | | | | | | | | | | |
| 17 | | | | | | | | | | | | | |
| 18 | | | | | | | | | | | | | |
| 19 | | | | | | | | | | | | | |
| 20 | | | | | | | | | | | | | |
| 21 | | | | | | | | | | | | | |
| 22 | | | | | | | | | | | | | |
| 23 | | | | | | | | | | | | | |
| 24 | | | | | | | | | | | | | |

---

## Column Guide

| Column | Source | How to fill |
|---|---|---|
| `execution_id` | n8n UI | Copy from n8n execution page URL (`/execution/{id}`) |
| `rss_candidates` | Orchestrator | Total RSS items fetched across all sources |
| `freshness_pass` | Orchestrator | Count that passed 24h freshness filter |
| `dedup_pass` | Orchestrator | Count that passed content hash check |
| `writer_generated` | Parse Article | `YES` if Writer produced output, `NO` if source rejected |
| `reviewer_approved` | AI Reviewer | `YES` if all 7 thresholds passed, `NO` with rejection_reason |
| `published` | S&P | `YES` if article written to `data/articles/{slug}.json` and verified |
| `telegram_sent` | Post to Telegram | `YES` if URL verified + message sent to channel |
| `rejection_reason` | system.log | Exact reason from `ARTICLE_REJECTED_QUALITY` or `REVIEWER_ERROR` log |
| `article_topic` | Article | Normalized topic (e.g. "Apple AI", "Tesla FSD", "ChatGPT update") |
| `source` | Orchestrator | Source name: TechCrunch / The Verge / Wired / Ars Technica |
| `duration(s)` | n8n UI | Execution duration in seconds from n8n execution page |

---

## Rejection Analysis

For every REJECTED execution (# where reviewer_approved = NO):

| # | topic | source | rejection_reason | Was rejection correct? | Valuable news lost? | Notes |
|---|---|---|---|---|---|---|
| | | | | | | |
| | | | | | | |
| | | | | | | |

---

## Quality Validation (APPROVED articles)

For every APPROVED execution (# where published = YES):

| # | topic | source | Fresh? | Valuable? | Arabic quality? | Title strong? | Telegram verified? | Notes |
|---|---|---|---|---|---|---|---|---|
| | | | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | |
| | | | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | |

---

## Duplicate Tracking

| # | topic | source | Duplicate type | Details |
|---|---|---|---|---|
| | | | semantic / narrative / company-saturation / topic-saturation | |
| | | | | |

If the same company or topic appears in multiple executions → flag as TOPIC_OVERFIT.

---

## Source Performance

| Source | Attempts | Writer generated | Reviewer approved | Published | Notes |
|---|---|---|---|---|---|
| TechCrunch | | | | | |
| The Verge | | | | | |
| Wired | | | | | |
| Ars Technica | | | | | |

---

## Reviewer Score Distribution

| # | nw | rv | clarity | originality | curiosity | spam | ai_generic | decision |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | APPROVED / REJECTED |
| | | | | | | | | |

(Read scores from system.log `REVIEW_APPROVED` entries or Reviewer node output)

---

## Calibration Log

| Time | Adjustment | Reason | Impact |
|---|---|---|---|
| | (none — observation only during window) | | |
| | | | |
