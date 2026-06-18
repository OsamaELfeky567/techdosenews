# Tech Dose News — Architecture

## 1. Executive Summary

| Field | Value |
|---|---|
| **Production version** | TDN v5.4.7 |
| **Mode** | Editorial Intelligence & Premium Content Mode |
| **Platform** | n8n (self-hosted, localhost:5678) |
| **Frontend** | GitHub Pages (technically legacy build, `.nojekyll` in root) |
| **AI provider** | Groq (llama-3.3-70b-versatile) |
| **Telegram bot** | @TechDoseNews_bot |
| **Live URL** | https://osamaelfeky567.github.io/techdosenews/ |

### Core goals

- Quality > Freshness > Quantity
- Max 1 article per execution, max 3/day
- Premium Arabic tech journalism — not translation, not SEO content
- Human-editorial feel (not RSS mirror, not AI farm)
- Fail-closed: if any verification fails, publish nothing
- ONLY 2 active workflows: Full Pipeline + View Tracker
- Less moving parts = fewer failures

### Current Mode

**v5.4.7 — Implementation Sync Mode (docs → n8n pipeline deployed)**

The system is in deployment synchronization:
- v5.4.6 specs now deployed as real Code node logic inside n8n
- `CALIBRATION_MODE=true` active in AI Reviewer Code node
- Calibration thresholds: nw>70, rv>70, spam<25 (temporary)
- Source-weighted trust: premium sources get slightly lower spam suspicion + flexibility
- Topic saturation control: same entity within 72h → auto reject
- Writer: sharp Arabic magazine editor tone, expanded forbidden phrases
- Telegram: 5-point pre-send verification, EXECUTION_SUMMARY logging
- All changes deployed via `deploy_v547.js` — surgical patches to existing v5.3.1 code

### Canonical Categories (8)

| English | Arabic |
|---|---|
| AI | `ذكاء اصطناعي` |
| Tech Companies | `شركات تقنية` |
| Smartphones | `هواتف` |
| Software | `برمجيات` |
| EVs | `سيارات كهربائية` |
| Cybersecurity | `الأمن السيبراني` |
| Development | `تطوير` |
| Devices | `أجهزة` |

All workflow nodes, parser logic, validator logic, frontend filters, and publish logic reference this single list. No category aliases remain. No legacy Arabic category names exist. Frontend and workflow are fully synchronized.

---

## 2. Production Workflow

### Pipeline (10 nodes, sequential)

```
[Schedule Trigger (every 1h)]
    ↓
[Orchestrator v5]          — Source-priority RSS, freshness, dedup, filters
    ↓
[Prepare Groq Payload]     — Writer AI: senior journalist persona, hard rules
    ↓
[Groq Write Article]       — HTTP POST to Groq API
    ↓
[Parse Article]            — JSON parse, field extraction
    ↓
[AI Reviewer]              — Independent editorial QA: 7-dim scoring, dedup, saturation checks
    ↓
[Validate & Score v5]      — Category validation, field check, threshold enforcement
    ↓
[Staging & Publish v5]     — Lock, write, verify URL, update index, hashes, topics
    ↓
[Post to Telegram]         — Verify public URL + index match → send only if all pass
```

### Core pipeline rules

- MAX 1 article per execution
- Publish ONLY if article passes ALL reviewer thresholds
- Reject weak stories even from premium sources
- No queues, no backlog, no batch processing
- Find ONE excellent article → process → publish → stop

### Node details

#### 1. Schedule Trigger
- **Type**: `n8n-nodes-base.scheduleTrigger`
- **Purpose**: Runs pipeline every 60 minutes
- **Output**: Empty trigger signal
- **Dependencies**: None

#### 2. Orchestrator v5
- **Type**: Code
- **Purpose**: Source-priority RSS selection, freshness filter, tech keyword filter, dedup
- **Input**: Trigger signal
- **Output**: Single article object `{ title, link, contentSnippet, pubDate, sourceName, hash }` or empty array
- **Sources** (priority order): TechCrunch → The Verge → Wired → Ars Technica
- **Behavior**: Try sources sequentially — return first valid match, do NOT merge multiple candidates
- **Freshness**:
  - Prefer news published within last 12h
  - Hard reject >24h unless extremely important
  - Reject evergreen listicles and generic SEO blogs
- **Filters**:
  - Tech keywords: matches against 80+ tech keywords
  - Rejection keywords: politics, sports, lifestyle, listicle patterns, "Top 10", "best AI tools"
  - Garbage title detection: CJK characters, excessive symbols
  - Content length: minimum 100 chars
  - Content hash dedup: checks `data/content_hashes.json`
- **Returns first match** from highest-priority source
- **Returns empty array** if no valid article found
- **Failure**: returns `[]`, pipeline continues with no items

#### 3. Prepare Groq Payload (Writer AI)
- **Type**: Code, 29 lines
- **Purpose**: Builds Groq API prompt with writer persona, article content, hard rules
- **Input**: Article object from Orchestrator
- **Output**: `{ groqPayload, sourceLink, sourceName, video_url }`
- **Pre-checks**:
  - Content length >= 200 chars → `REJECT_ARTICLE: source too short`
  - Source name not in [blogspot, medium, seo, spam, affiliate, listicle] → `REJECT_ARTICLE: low quality source`
  - Spam patterns [top 10, best ai tools, free chatgpt hack, etc.] → `REJECT_ARTICLE: spam pattern`
- **Writer persona**: Senior Arabic tech journalist (NOT translator, NOT SEO writer)
- **Title rules**:
  - Must sound natural and human
  - Avoid literal translation from English
  - Favor questioning style over declarative
  - Good example: `ما الذي تحاول OpenAI تغييره في طريقة البحث داخل ChatGPT؟`
  - Bad example: `OpenAI تطلق تحديثًا جديدًا لـ ChatGPT`
- **Forbidden phrases**: `في عالم التكنولوجيا المتسارع`, `يُعد هذا تطورًا مهمًا`, `من الجدير بالذكر`
- **Article structure** (7 sections):
  1. Strong natural headline
  2. Short intro summary
  3. What happened (details)
  4. Why this matters (reader importance)
  5. Industry impact (companies/market)
  6. Future implications
  7. Final concise takeaway
- **Rules**: No invented facts, 700–1000 Arabic words, professional Arabic journalism style, explain WHY, add context
- **Model**: `llama-3.3-70b-versatile`, temperature 0.7, max_tokens 3072

#### 4. Groq Write Article
- **Type**: HTTP Request
- **Purpose**: POST prompt to Groq API, receive generated article
- **Input**: Payload from Prepare Groq Payload
- **Output**: Raw Groq API response (JSON string)
- **Endpoint**: `POST https://api.groq.com/openai/v1/chat/completions`
- **Failure**: Returns error, pipeline catches in downstream nodes

#### 5. Parse Article
- **Type**: Code, 45 lines
- **Purpose**: Parse Groq JSON response, extract structured fields
- **Input**: Raw HTTP response body
- **Output**: `{ title_ar, excerpt, body, category, tags, reading_time, source_name, source_link, id }`
- **Key logic**:
  - `parseGroqJSON()` — handles Groq-specific response format
  - Extracts `title_ar`, `excerpt_ar`, `body_ar`, `category`, `tags`, `reading_time`
  - Generates unique article `id` via `makeId()`
- **Failure**: Throws error if JSON parse fails or required fields missing

#### 6. AI Reviewer
- **Type**: Code, 123 lines
- **Purpose**: Independent quality gate that reviews writer output before publication
- **Input**: Article object from Parse Article
- **Output**: Article + `review` object `{ decision, reason, newsworthiness, reader_value, clarity, originality, reader_curiosity, spam_risk, ai_generic }`
- **Groq call**: Same model (`llama-3.3-70b-versatile`), temperature 0.3, max_tokens 600
- **Scoring system** (7 dimensions, 0–100):

  | Metric | Threshold | Description |
  |---|---|---|
  | Newsworthiness | >85 | Is this actually newsworthy? |
  | Reader value | >80 | Will readers benefit? |
  | Clarity | >80 | Is the writing clear? |
  | Originality | >75 | Fresh angle, not generic? |
  | Reader curiosity | >70 | Would a real reader finish it? |
  | Spam risk | <15 | Is this clickbait/spam? |
  | AI generic | <20 | Does it sound machine-written? |

- **Rejection rules** (14 hard rules in prompt):
  1. Semantic duplicate within 72h
  2. Article older than 24h
  3. Weak/noisy blogspam or affiliate source
  4. Listicle / top-10 style
  5. Vague clickbait content
  6. Mixed language or weird characters in title
  7. Poor source credibility (even TechCrunch can be rejected)
  8. Less than 250 meaningful Arabic words
  9. No actual news value / generic filler
  10. Topic already saturated online
  11. Boring summary, no hook, weak reader value
  12. Repetitive AI-style structure
  13. Obvious SEO bait (keyword stuffing, unnatural phrasing)
  14. Poor Arabic quality

- **Uniqueness**: Checks similarity against last 20 published articles
- **Source intelligence**: Even high-authority sources rejected if article is shallow/obvious
- **Daily limit**: Max 3 articles/day (checked against `published_topics.json`)
- **Fail-closed**: On error → `decision: "REJECTED"` with error details
- **Logging**: `REVIEW_APPROVED`, `ARTICLE_REJECTED_QUALITY`, `REVIEWER_ERROR` in `system.log`

#### 7. Validate & Score v5
- **Type**: Code, 76 lines
- **Purpose**: Second validation gate, category enforcement, field completeness
- **Input**: Article + review object from AI Reviewer
- **Output**: Article with `validation` object `{ passed, errors, scores }`
- **Validation checks**:
  - Category must be in ALLOWED list (8 Arabic categories)
  - All required fields present (title, excerpt, body, category)
  - Body minimum length
- **Categories**: Validated against the canonical 8-category list (no aliases, no mapping — stored as-is)
- **Failure**: Returns `validation: { passed: false }` with error list

#### 8. Staging & Publish v5
- **Type**: Code, 141 lines
- **Purpose**: Write article to GitHub, verify publication, update all indexes
- **Input**: Validated article object
- **Output**: `{ message, published: [...], publish_verified, index_verified }`
- **Lock system**: `data/workflow_lock.json` — 5-minute stale timeout
- **Publish order** (critical sequence):
  1. Acquire lock (`workflow_lock.json`)
  2. Check content hash dedup (`content_hashes.json`)
  3. Write article file: `data/articles/{slug}.json`
  4. **PUBLIC_URL_CHECK**: Verify article exists on GitHub (SHA check)
  5. **ARTICLE_VERIFIED**: Log success
  6. Update `index.json`: Prepend new entry, cap at 500
  7. **INDEX_UPDATED**: Verify article ID in index
  8. Update `content_hashes.json`: Append hash, cap at 10000
  9. Update `published_topics.json`: Prepend with topic fingerprint, cap at 500
  10. Update `published_links.json`: Append source link, cap at 5000
  11. **ARTICLE_PUBLISHED**: Log with score/slug/category
  12. Release lock
- **Failure handling**: On any step failure → `PUBLISH_FAILED` log, no partial state
- **Verification flags**: `publish_verified`, `index_verified` returned in output
- **Logging**: `ARTICLE_VERIFIED`, `INDEX_UPDATED`, `ARTICLE_PUBLISHED`, `PUBLISH_FAILED`, `ARTICLE_REJECTED_QUALITY`, `ARTICLE_REJECTED_DUPLICATE`

#### 9. Post to Telegram
- **Type**: Code, 90 lines
- **Purpose**: Send article to Telegram channel with public URL verification
- **Input**: `{ published: [...] }` from Staging & Publish
- **Output**: `{ success, sent, count, results }`
- **Verification checks** (ALL must pass before sending):
  1. Article exists in `data/articles/index.json` (slug/id match)
  2. Public URL (`https://osamaelfeky567.github.io/techdosenews/article.html?id={id}`) returns HTTP 200
  3. Response body contains article title (first 30 characters)
  4. Response body has valid article page structure (`hasStructure` check)
- **Message format**: Title (bold) + Excerpt (2 lines) + Category badge + Read time + Source name + Public link
- **Link**: `https://osamaelfeky567.github.io/techdosenews/article.html?id={id}` (live GitHub Pages URL, not local/raw)
- **Failure handling**: If ANY verification fails → skips article entirely, logs `TELEGRAM_URL_FAILED`
- **Logging**: `TELEGRAM_URL` on success, `TELEGRAM_URL_FAILED` on failure
- **Principle**: Telegram is the final consumer — only sends after full publication verification chain succeeds

---

## 3. Repository Structure

### GitHub Pages repo (`osamaelfeky567/techdosenews`)

| Path | Purpose | Read nodes | Write nodes | Status |
|---|---|---|---|---|---|
| `index.html` | Homepage — lists articles from index.json | Browser | Manual deploy | ACTIVE |
| `article.html` | Single article page — loads from `data/articles/{id}.json` | Browser | Manual deploy | ACTIVE |
| `script.js` | Frontend JS — fetches index.json, renders articles | Browser | Manual deploy | ACTIVE |
| `style.css` | Frontend styling | Browser | Manual deploy | ACTIVE |
| `.nojekyll` | Disables Jekyll processing for GitHub Pages | GitHub Pages | Manual | ACTIVE |
| `data/articles/` | Individual article JSON files | Browser, S&P | S&P | ACTIVE |
| `data/articles/index.json` | Article index (list + metadata) | Browser, S&P, Telegram | S&P | ACTIVE |
| `data/published_topics.json` | Topic memory for 72h dedup + daily count | Reviewer, S&P | S&P | ACTIVE |
| `data/content_hashes.json` | Content hash dedup list | Orchestrator, S&P | Orchestrator, S&P | ACTIVE |
| `data/published_links.json` | Source link archive | S&P | S&P | ACTIVE |
| `data/workflow_lock.json` | Distributed lock for concurrent execution | S&P | S&P | ACTIVE |
| `data/logs/system.log` | Debug/audit log | Reviewer, Telegram, S&P | Reviewer, Telegram, S&P | ACTIVE |
| `data/health.json` | Health dashboard stats — written but never read by any node | — | — | LEGACY (unused) |
| `data/categories.json` | Category definitions — superseded by inline Code node logic | — | — | LEGACY (unused) |
| `data/quality_config.json` | Quality config — superseded by Code node variables | — | — | LEGACY (unused) |
| `data/articles_db/` | Remnant from earlier archive pipeline — empty | — | — | STALE |
| `data/events/` | Remnant from earlier event-oriented architecture — empty | — | — | STALE |
| `data/queues/` | Remnant from earlier queue-based processing — empty | — | — | STALE |
| `data/testing-output/` | Remnant from earlier testing system — empty | — | — | STALE |
| `admin/` | Admin dashboard page (basic, not actively maintained) | Browser | Manual | LEGACY |

### Data formats

#### Article file (`data/articles/{slug}.json`)
```json
{
  "id": "art-{timestamp}-{random}",
  "title_ar": "...",
  "excerpt": "...",
  "body": "<h2>...</h2><p>...</p>",
  "category": "ذكاء اصطناعي",
  "tags": "...",
  "source_link": "...",
  "source_name": "TechCrunch",
  "readTime": "5 دقائق",
  "created_at": "ISO timestamp",
  "techdose_link": "https://.../article.html?id=...",
  "quality_score": 0
}
```

#### Index entry (`data/articles/index.json`)
```json
{
  "id": "art-...",
  "title": "...",
  "excerpt": "...",
  "category": "...",
  "date": "ISO timestamp",
  "readTime": "...",
  "views": "0",
  "source": "...",
  "body": "...",
  "tags": [...],
  "techdose_link": "..."
}
```

#### Topic entry (`data/published_topics.json`)
```json
{
  "title": "...",
  "source": "TechCrunch",
  "timestamp": "ISO timestamp",
  "topic_fp": "normalized arabic text"
}
```

---

## 4. Workflow Logic

### Freshness filtering
- RSS pubDate must be within 24h of now
- Checked in Orchestrator v5

### Source priority
- TechCrunch → The Verge → Wired → Ars Technica
- Orchestrator iterates sources in order, returns first valid match
- Writer has hard-coded rejection for [blogspot, medium, seo, spam, affiliate, listicle]

### Dedup system (3 layers)
1. **Content hash** (`content_hashes.json`): Normalized title + content snippet → hash → checked in Orchestrator and S&P
2. **Topic memory** (`published_topics.json`): 72h window, semantic check via AI Reviewer
3. **Uniqueness** (AI Reviewer): similarity against last 20 articles, topic saturation check

### Reviewer scoring
- 7-dimension scoring via Groq AI
- All thresholds must be met: nw>85, rv>80, clarity>80, originality>75, curiosity>70, spam<15, ai<20
- Code-level threshold enforcement (fail-safe after AI response)

### Publish verification
- Article file written → GitHub SHA verified
- Index updated → article ID verified in index
- Telegram URL → HTTP 200 + title match + structure check

### Article generation rules (Writer AI)
- 700–1000 Arabic words
- 7-section structure
- No invented facts
- No AI-sounding phrases
- Must explain WHY, not just translate

---

## 5. AI System

The system uses two distinct AI roles, both powered by the same Groq model (`llama-3.3-70b-versatile`) but with different prompts, temperatures, and purposes.

### Role 1: Writer (Prepare Groq Payload → Groq Write Article)

Creates original long-form Arabic tech journalism from an RSS source.

- **Model**: `llama-3.3-70b-versatile` (Groq), temperature 0.7, max_tokens 3072
- **Persona**: Senior Arabic tech journalist — NOT a translator, NOT an SEO writer
- **Style**: Professional Arabic journalism — analytical, contextual, concise
- **Hard rules**: No translation, no SEO-style, no clickbait, no invented facts, 700–1000 Arabic words
- **Article structure** (7 sections): Headline → Short intro → What happened → Why this matters → Industry impact → Future implications → Final takeaway
- **Forbidden phrases**: `في عالم التكنولوجيا المتسارع`, `يُعد هذا تطورًا مهمًا`, `من الجدير بالذكر`
- **Title rules**: Natural and human, question-style preferred, avoid literal English translation
- **Pre-checks** (rejects weak source before writing): source too short (<200 chars), low-quality source name, spam patterns → returns `REJECT_ARTICLE`
- **Quality over quantity**: Can return nothing rather than a weak article

### Role 2: Reviewer (AI Reviewer)

Independent quality gate that reviews Writer output before publication. Has full authority to reject any article.

- **Model**: `llama-3.3-70b-versatile` (Groq), temperature 0.3, max_tokens 600
- **Role**: Independent auditor — not the same entity as Writer
- **Scoring** (7 dimensions, 0–100, all must pass):

  | Metric | Threshold | What it measures |
  |---|---|---|
  | Newsworthiness | >85 | Is this actually newsworthy today? |
  | Reader value | >80 | Will a real reader benefit from this? |
  | Clarity | >80 | Is the writing clear and well-structured? |
  | Originality | >75 | Is there a fresh angle, not generic filler? |
  | Reader curiosity | >70 | Would a real reader finish reading? |
  | Spam risk | <15 | Is this clickbait, keyword-stuffed, or spammy? |
   | AI genericness | <20 | Does it sound human-written (not machine-generated)? |

- **Calibration thresholds (TEMPORARY — v5.4.6 only)**: nw>70, rv>70, spam<25 — allows borderline articles to publish for data collection
- **Production thresholds (permanent)**: nw>85, rv>80, clarity>80, originality>75, curiosity>70, spam<15, ai<20

- **Fail-closed**: On any error during review → `decision: "REJECTED"` — no article published
- **Code-level enforcement**: Thresholds are enforced in code after AI returns scores (belt-and-suspenders)
- **Rejection rules** (14 hard rules in prompt): semantic duplicate within 72h, article older than 24h, blogspam source, listicle/top-10 structure, vague clickbait, mixed language characters, poor source credibility, <250 meaningful Arabic words, no news value, topic already saturated, boring summary, repetitive AI structure, SEO bait, poor Arabic quality
- **Duplicate prevention** (4 checks):
  1. **Semantic duplication** — same meaning even with different wording
  2. **Narrative duplication** — same story angle repeated
  3. **Company saturation** — same company dominating feed repeatedly
  4. **Topic saturation** — same trend repeated too frequently
- **Source intelligence**: Even high-authority sources (TechCrunch, The Verge) are rejected if the article is shallow or obvious
- **Daily cap**: Max 3 articles/day enforced against `published_topics.json`
- **Logging**: `REVIEW_APPROVED`, `ARTICLE_REJECTED_QUALITY`, `REVIEWER_ERROR` in `system.log`

**Core editorial policy**: Quality over quantity. It is better to publish nothing than to publish a weak, duplicate, or low-quality article.

---

## 6. Security Layer

### Credentials location
- **n8n instance**: Self-hosted on localhost:5678
- **Credentials stored**: Hard-coded in n8n Code nodes (base64-encoded in n8n's internal storage)
- **Secrets**: Tokens inline in `const` variables at top of each Code node

### Tokens used

| Token | Used by | Purpose |
|---|---|---|
| GitHub PAT | Orchestrator, Reviewer, S&P, Telegram | Read/write repo files |
| Groq API key | Prepare Groq Payload, AI Reviewer | LLM inference |
| Telegram bot token | Post to Telegram | Send messages |

### GitHub permissions
- Token scope: repo (full control)
- Public repo: `osamaelfeky567/techdosenews`
- Actions required: read/write content, create/update files

### Telegram integration
- Bot token belongs to `@TechDoseNews_bot`
- Chat ID: dedicated channel
- Messages formatted as HTML, link preview enabled

### Public vs private
- **Public**: GitHub Pages site, all article files, index
- **Private**: n8n instance (localhost only), tokens, credentials
- **Note**: Tokens are visible in n8n UI (local instance only)

---

## 7. Frontend Architecture

### Homepage (`index.html` + `script.js`)
1. Page loads → `script.js` fetches `data/articles/index.json`
2. Renders article cards (title, excerpt, category, date, read time, author)
3. Click on article → navigates to `article.html?id={id}`
4. Category filter buttons filter by the canonical 8-category list
5. Search function filters by title/excerpt

### Article page (`article.html`)
1. Reads `id` from URL query parameter
2. Fetches `data/articles/{slug}.json` (slug resolved from index.json)
3. Renders full article with structured HTML
4. Shows category, author, date, read time, tags
5. Shows Egypt impact section if present
6. Social sharing links

### Category system
- Frontend category filters match the 8 canonical pipeline categories exactly
- No category aliases, no name mapping, no legacy categories
- CSS classes defined for all 8: `cat-ai`, `cat-company`, `cat-phone`, `cat-software`, `cat-car`, `cat-security`, `cat-dev`, `cat-devices`
- Full synchronization between pipeline output and frontend rendering

### Data flow
- All data fetched client-side from GitHub raw URLs
- No server-side rendering
- Cache busting via timestamp parameter

### Analytics — GoatCounter
- **GoatCounter** (`gc.zgo.at`) is the ONLY analytics and view tracking system
- No internal analytics engine exists
- No custom view tracking database exists
- GoatCounter script loaded in both `index.html` and `article.html`
- The View Tracker n8n workflow exists but only updates lightweight counter fields in article JSON files (not used for analytics or decision-making)
- Previous "No analytics" limitation is now **RESOLVED**

### GitHub Pages behavior
- Legacy build type (not GitHub Actions)
- `.nojekyll` file in root prevents Jekyll processing
- Static files served directly
- Files over 1MB may fail to load
- CSP and security headers set by GitHub

### Article URLs
- `https://osamaelfeky567.github.io/techdosenews/article.html?id=art-{timestamp}-{random}`
- `techdose_link` stored in article JSON and index

---

## 8. Publication System

### Publish order (exact sequence)

```
1. Acquire workflow lock          ← prevents concurrent execution
2. Check content hash             ← prevents exact duplicate
3. Write article JSON file        ← actual publication
4. Verify article on GitHub       ← PUBLIC_URL_CHECK
5. Log ARTICLE_VERIFIED           ← confirmation
6. Update index.json              ← frontend visibility
7. Verify article in index        ← INDEX_UPDATED
8. Update content_hashes.json     ← dedup tracking
9. Update published_topics.json   ← topic memory
10. Update published_links.json   ← link archive
11. Log ARTICLE_PUBLISHED         ← final confirmation
12. Release workflow lock         ← allow next execution
```

**Why this order**:
- Lock first to prevent race conditions
- Write article before index (index references article)
- Verify after write (confirms GitHub API actually persisted)
- Update indexes last (all tracking systems see the same article)
- Release lock only after full completion

---

## 9. Current Limitations

### KNOWN LIMITATIONS

| Limitation | Impact | Workaround |
|---|---|---|
| **Groq free tier** — 100K TPD | ~66 executions/day max, 24h reset. Testing can exhaust quota | Monitor usage, upgrade to paid if needed |
| **GitHub Pages caching** — Up to 10min CDN cache | Frontend may show stale data | Cache busting via timestamp param |
| **No search engine** | No site search, no SEO indexing optimization | Manual SEO metadata |
| ~~**No analytics**~~ | **RESOLVED** — GoatCounter integrated | `gc.zgo.at` tracking on all pages |
| **No email/notification system** | Readers can't subscribe | Manual only |
| **No multi-language support** | Arabic only | Intentional |
| **No database** — GitHub is the database | 1MB file limit, API rate limits (5000/hr) | Keep files small, cap arrays |
| **No mobile app** | Web only | Responsive design |
| **n8n on localhost** | Not accessible externally, single point of failure | Manual backup |
| **Tokens in plain text** in n8n Code nodes | Exposed if n8n compromised | Local instance only |
| **No image generation** | Static placeholder images | Unsplash fallback |
| **No scheduled retry** on failure | Missed articles if any step fails | Manual re-trigger |
| **No AI model fallback** | If Groq is down, pipeline fails | Manual mode only |

---

## 10. Future Roadmap

### Planned improvements
- Paid LLM tier (remove TPD limit)
- Image generation (DALL-E / SD for article images)
- Email notification system
- SEO optimization (meta tags, sitemap)

### Postponed
- Multi-language support
- Mobile app
- User accounts / comments
- Newsletter

### Rejected
- Auto-posting to other social platforms (Twitter, LinkedIn)
- Content monetization / ads
- Reader contributions

### Scaling plans
- Move n8n to cloud VM (DigitalOcean / AWS) for 24/7 uptime
- Upgrade to Groq paid tier
- Add secondary AI provider fallback (Anthropic / OpenAI)
