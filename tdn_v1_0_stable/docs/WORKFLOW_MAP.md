# Tech Dose News — Workflow Map

## Full Pipeline

```
[1. Schedule Trigger]
  Type: Schedule Trigger
  Interval: Every 60 minutes
  Output: Empty trigger signal
  Connected to: Orchestrator v5
  Failure: Nothing triggered (expected)
  ↓

[2. Orchestrator v5]
  Type: Code (71 lines)
  Fetch RSS from 4 sources, apply freshness/tech/dedup filters
  Input: Trigger signal
  Output: Single article object | empty array
  Connected to: Prepare Groq Payload
  Dependencies: GitHub API (content_hashes.json)
  Failure: Returns empty array → pipeline stops
  ↓

[3. Prepare Groq Payload]
  Type: Code (29 lines)
  Build Groq prompt with Writer AI persona, hard rules, article structure
  Input: Article object
  Output: { groqPayload, sourceLink, sourceName, video_url }
  Connected to: Groq Write Article
  Dependencies: None (pure transformation)
  Failure: Returns REJECT_ARTICLE error → pipeline stops
  ↓

[4. Groq Write Article]
  Type: HTTP Request
  POST to Groq API with writer prompt
  Input: groqPayload
  Output: Raw Groq response (JSON string)
  Connected to: Parse Article
  Dependencies: Groq API (llama-3.3-70b-versatile)
  Failure: HTTP error → Parse Article catches
  ↓

[5. Parse Article]
  Type: Code (45 lines)
  Parse Groq JSON, extract structured fields, generate ID
  Input: Raw HTTP response body
  Output: { title_ar, excerpt, body, category, tags, reading_time, source_name, source_link, id }
  Connected to: AI Reviewer
  Dependencies: None (pure parse)
  Failure: JSON parse error → AI Reviewer sees error
  ↓

[6. AI Reviewer]
  Type: Code (123 lines)
  Independent Groq-based review, 7-dimension scoring, dedup check
  Input: Article object
  Output: Article + { review: { decision, reason, scores... } }
  Connected to: Validate & Score v5
  Dependencies: GitHub API (published_topics.json), Groq API
  Failure: Catch → returns REJECTED with error details (fail-closed)
  ↓

[7. Validate & Score v5]
  Type: Code (76 lines)
  Category validation, field completeness, scoring
  Input: Article + review object
  Output: Article + { validation: { passed, errors, scores } }
  Connected to: Staging & Publish v5
  Dependencies: None (pure validation)
  Failure: validation.passed = false → S&P skips
  ↓

[8. Staging & Publish v5]
  Type: Code (141 lines)
  Lock → write article → verify → update indexes → release lock
  Input: Validated article object
  Output: { message, published: [...], publish_verified, index_verified }
  Connected to: Post to Telegram
  Dependencies: GitHub API (all data files), lock system
  Failure: PUBLISH_FAILED log, no partial state
  ↓

[9. Post to Telegram]
  Type: Code (90 lines)
  Verify public URL + index match → send Telegram message
  Input: { published: [...] }
  Output: { success, sent, count, results }
  Connected to: End
  Dependencies: GitHub API (index.json), Telegram API, public site
  Failure: Skip article, log TELEGRAM_URL_FAILED
```

## Connection Summary

```
Schedule Trigger ──→ Orchestrator v5 ──→ Prepare Groq Payload ──→ Groq Write Article
                                                                       ↓
Post to Telegram ←─ Staging & Publish v5 ←─ Validate & Score v5 ←─ AI Reviewer
                                            ↑
                              Parse Article ←┘
```

## Data Flow

| Node | Produces | Consumes |
|---|---|---|
| Schedule Trigger | Trigger signal | — |
| Orchestrator v5 | Article object | RSS feeds, content_hashes.json |
| Prepare Groq Payload | Groq payload | Article object |
| Groq Write Article | Raw JSON | Groq payload |
| Parse Article | Structured article | Raw JSON |
| AI Reviewer | Review object | Article, published_topics.json |
| Validate & Score v5 | Validation object | Article + Review |
| Staging & Publish v5 | Published articles | Validated article, data files |
| Post to Telegram | Send result | Published articles, index.json |

## Failure Behavior Matrix

| Failure point | What happens | Recovery |
|---|---|---|
| RSS fetch fails | Skips source, tries next | Auto (next execution) |
| All RSS fail | Returns `[]`, nothing published | Auto (next execution) |
| Writer content too short | REJECT_ARTICLE error | Auto (next execution) |
| Writer spam pattern | REJECT_ARTICLE error | Auto (next execution) |
| Groq API timeout | Error in Parse Article | Auto (next execution) |
| Groq JSON parse fails | Error in Parse Article | Auto (next execution) |
| Reviewer error | REJECTED (fail-closed) | Auto (next execution) |
| Reviewer rejects | REJECTED with reason | Auto (next execution) |
| Reviewer thresholds fail | REJECTED at code level | Auto (next execution) |
| Daily limit (3/day) | REJECTED | Auto next day |
| Lock held | S&P returns "Lock held" | Auto (next execution or 5min timeout) |
| GitHub write fails | PUBLISH_FAILED log | Manual retry |
| Verification fails | PUBLISH_FAILED log | Manual investigation |
| Telegram API fails | Skip article, TELEGRAM_URL_FAILED | Auto (next execution) |
| Telegram verify fails | Skip article, TELEGRAM_URL_FAILED | Auto (next execution) |

## Dependencies Graph

```
n8n (localhost:5678)
├── GitHub API (github.com)
│   ├── data/content_hashes.json
│   ├── data/published_topics.json
│   ├── data/articles/{slug}.json
│   ├── data/articles/index.json
│   ├── data/workflow_lock.json
│   └── data/logs/system.log
├── Groq API (api.groq.com)
│   ├── Writer: llama-3.3-70b-versatile
│   └── Reviewer: llama-3.3-70b-versatile
├── Telegram API (api.telegram.org)
│   └── Bot: @TechDoseNews_bot
├── RSS Feeds
│   ├── TechCrunch
│   ├── The Verge
│   ├── Wired
│   └── Ars Technica
└── GitHub Pages (osamaelfeky567.github.io)
    └── Public article URL verification
```
