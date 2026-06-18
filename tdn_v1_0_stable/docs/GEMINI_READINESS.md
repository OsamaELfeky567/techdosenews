# Tech Dose News — Gemini Readiness & Operational Design

## Phase 8 — Production Readiness for Gemini Image Generation

### 1. API Key Storage

#### Environment variable

The Gemini API key is stored in a **single environment variable**:

```
GEMINI_API_KEY=AIzaSy...
```

This variable is:
- Stored in `.env` file (never committed)
- Read by the AI Image Module at init time
- Used as `?key={GEMINI_API_KEY}` query parameter in API requests

#### Where the key lives

| Location | Contains key? | Committed? | Notes |
|---|---|---|---|
| `.env` (local) | Yes | NO (in `.gitignore`) | Source of truth for local dev |
| `config/.env.template` | No (placeholder) | Yes | Template with placeholder |
| n8n Code node constants | Yes (as `const GEMINI_API_KEY = process.env.GEMINI_API_KEY`) | No (n8n internal) | Key read from env, never hard-coded |
| Runtime memory | Yes (temporary) | N/A | Exists only during pipeline execution |
| Log files | NEVER | N/A | Keys are redacted from all log output |

#### Validation rules

```javascript
function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === '' || key === 'YOUR_GEMINI_API_KEY') {
    return null;  // Not configured — module will disable gracefully
  }
  if (!key.startsWith('AIzaSy')) {
    console.log('GEMINI_KEY_INVALID_FORMAT');
    return null;
  }
  return key;
}
```

If no valid API key is present, the module logs `AI_IMAGE_GEMINI_NO_KEY` and skips image generation **without error**. The pipeline continues normally.

---

### 2. Quota Monitoring

#### Gemini API Free Tier Limits

| Limit | Value | Reset |
|---|---|---|
| Requests per minute (RPM) | 60 | Rolling 60s |
| Requests per day (RPD) | 1,500 | Daily (midnight PT) |
| Tokens per minute (TPM) | 1,000,000 | Rolling 60s |
| Images per day | 1,500 (same as RPD) | Daily |

#### Usage tracking mechanism

A lightweight counter file at `data/ai_image_usage.json` tracks daily usage:

```json
{
  "date": "2026-06-17",
  "images_generated": 3,
  "images_failed": 1,
  "total_requests": 4,
  "quota_exceeded": false
}
```

#### Quota check flow

```
Before each Gemini API call:
  1. Read data/ai_image_usage.json
  2. If date != today → reset counter
  3. If images_generated >= 1450 (90% of daily limit) → skip, log AI_IMAGE_QUOTA_NEARING_LIMIT
  4. If quota_exceeded == true → skip (already hit limit today)
  5. Proceed with API call

After each Gemini API call:
  1. Increment total_requests
  2. If success → increment images_generated
  3. If failure → increment images_failed
  4. If 429 (Too Many Requests) → set quota_exceeded = true
  5. Write updated counter to data/ai_image_usage.json
```

#### What happens at quota limit

| Quota state | Behavior |
|---|---|
| **Under 90%** | Normal operation |
| **90–99% used** | Warning log, still attempt generation |
| **100% used** | Skip generation, log `AI_IMAGE_QUOTA_EXCEEDED`, set flag for rest of day |
| **429 response** | Immediately set `quota_exceeded = true`, no retry for rest of day |

At **no point** does quota exhaustion affect article publishing. The module simply skips image generation.

---

### 3. Retry Strategy

#### Retry logic for Gemini API calls

```
Attempt 1: Send request with 30s timeout
  ├── Success (200) → process image
  ├── 429 (Rate limited) → wait 60s, retry
  ├── 5xx (Server error) → exponential backoff, retry
  ├── 4xx (Client error, not 429) → NO retry, log error
  └── Timeout → NO retry (timeout means model is too slow)

Retry attempts: Max 3 total (1 initial + 2 retries)
Backoff: 1s → 2s → 4s (exponential, not random jitter)
```

#### Pseudocode

```javascript
async function callGeminiWithRetry(payload, maxRetries = 2) {
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 30000
      });
      
      if (response.status === 200) {
        return await response.json();
      }
      
      if (response.status === 429) {
        // Rate limited — wait and retry
        const waitTime = (attempt + 1) * 60 * 1000; // 60s, 120s
        console.log(`AI_IMAGE_RATE_LIMITED | attempt=${attempt + 1} | waiting=${waitTime}ms`);
        await sleep(waitTime);
        lastError = `RATE_LIMITED (attempt ${attempt + 1})`;
        continue;
      }
      
      if (response.status >= 500) {
        // Server error — exponential backoff
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await sleep(waitTime);
        lastError = `SERVER_ERROR ${response.status} (attempt ${attempt + 1})`;
        continue;
      }
      
      // 4xx client error (not 429) — no retry
      return null;
      
    } catch (err) {
      lastError = err.message;
      if (attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }
  
  console.log(`AI_IMAGE_GEMINI_RETRY_EXHAUSTED | error=${lastError}`);
  return null;
}
```

#### What failures are retried

| Response | Retry? | Backoff | Max attempts |
|---|---|---|---|
| 200 Success | No | — | 1 |
| 429 Rate Limited | Yes | 60s, 120s | 3 |
| 500+ Server Error | Yes | 1s, 2s, 4s | 3 |
| 400 Bad Request | No | — | 1 |
| 401 Unauthorized | No | — | 1 |
| 403 Forbidden | No | — | 1 |
| Timeout (30s) | No | — | 1 |

---

### 4. Timeout Handling

#### Request timeout

| Parameter | Value | Rationale |
|---|---|---|
| **Total request timeout** | 30 seconds | Gemini 2.0 Flash is fast — 30s is generous |
| **Connection timeout** | 10 seconds | Network issues should fail fast |
| **Response timeout** | 20 seconds | Model should generate within 20s |
| **Module-level deadline** | 60 seconds | Total time budget for entire AI Image step |

#### Deadline-based cancellation

The entire AI Image step has a **60-second hard deadline** from the moment it starts:

```javascript
async function generateAndAttachImage(article) {
  const deadline = Date.now() + 60000; // 60 seconds total
  
  // Step 1: Prompt generation (should take < 100ms)
  const prompt = generatePrompt(article);
  
  // Step 2: Gemini API call (30s timeout per attempt, max 3 attempts)
  // But we must respect the overall 60s deadline
  const remainingTime = deadline - Date.now();
  if (remainingTime < 10000) {
    console.log('AI_IMAGE_DEADLINE_APPROACHING — skipping');
    return { imageUrl: null, success: false };
  }
  
  const imageData = await callGeminiWithRetry(prompt, 2, Math.min(remainingTime, 30000));
  // ... rest of steps with time checks
}
```

#### What happens on timeout

| Scenario | Behavior | Log |
|---|---|---|
| Connection timeout (10s) | Return null, no retry | `AI_IMAGE_GEMINI_TIMEOUT` |
| Response timeout (20s) | Return null, no retry | `AI_IMAGE_GEMINI_TIMEOUT` |
| Module deadline (60s) | Abort all remaining steps, return null | `AI_IMAGE_MODULE_DEADLINE` |

---

### 5. Fallback Behavior — Detailed Scenarios

#### Scenario Matrix

| Scenario | Root cause | Detection | Action | Article result | Logged as |
|---|---|---|---|---|---|
| **No API key** | Missing env var | Module init | Skip module entirely | Published without image | `AI_IMAGE_GEMINI_NO_KEY` |
| **Invalid API key** | Wrong key format | Format check | Skip module | Published without image | `AI_IMAGE_GEMINI_NO_KEY` |
| **Auth failure** | Revoked/expired key | 401 from API | Skip for this execution | Published without image | `AI_IMAGE_GEMINI_AUTH_FAILED` |
| **Daily quota exhausted** | >1,500 images/day | Counter check or 429 | Skip for rest of day | Published without image | `AI_IMAGE_QUOTA_EXCEEDED` |
| **Rate limited (429)** | Too fast | 429 response | Retry with backoff (up to 3×) | Published without image or with image | `AI_IMAGE_RATE_LIMITED` |
| **API server error** | Gemini outage | 500+ response | Retry with backoff (up to 3×) | Published without image | `AI_IMAGE_GEMINI_SERVER_ERROR` |
| **Request timeout** | Slow model / network | 30s timeout | No retry, skip | Published without image | `AI_IMAGE_GEMINI_TIMEOUT` |
| **Invalid response** | Missing image data | Response parsing | Skip | Published without image | `AI_IMAGE_GEMINI_RESPONSE_INVALID` |
| **Empty response** | Model returned nothing | Response parsing | Skip | Published without image | `AI_IMAGE_GEMINI_EMPTY_RESPONSE` |
| **Generated image >1MB** | Too large for GitHub | Size check | Skip (do not upload) | Published without image | `AI_IMAGE_TOO_LARGE` |
| **gh-proxy unreachable** | Proxy server down | Connection refused | Skip upload | Published without image | `AI_IMAGE_PROXY_UNREACHABLE` |
| **GitHub upload fails** | API error from proxy | Non-200 response | Skip | Published without image | `AI_IMAGE_UPLOAD_FAILED` |
| **Everything succeeds** | All steps pass | All checks pass | Image attached | Published WITH image | `AI_IMAGE_GENERATED` |

#### Fallback visual

```
Article Publishing
    │
    ├── AI Image Module enabled? ──NO──→ Publish WITHOUT image
    │
    ▼ YES
    │
    ├── API key valid? ──NO──→ Publish WITHOUT image
    │
    ▼ YES
    │
    ├── Daily quota available? ──NO──→ Publish WITHOUT image
    │
    ▼ YES
    │
    ├── Prompt generated? ──NO──→ Publish WITHOUT image
    │
    ▼ YES
    │
    ├── Gemini returns image? ──NO──→ Publish WITHOUT image (after retries)
    │
    ▼ YES
    │
    ├── Image valid + ≤1MB? ──NO──→ Publish WITHOUT image
    │
    ▼ YES
    │
    ├── Upload to GitHub succeeds? ──NO──→ Publish WITHOUT image
    │
    ▼ YES
    │
    └──→ Publish WITH image
```

---

### 6. Cost Estimation

#### Gemini 2.0 Flash Experimental Pricing

| Metric | Free Tier | Paid Tier |
|---|---|---|
| **Image generation** | Free (1,500 images/day) | Pay-as-you-go |
| **Input tokens** | Free | $0.075 / 1M tokens |
| **Output tokens** | Free | $0.30 / 1M tokens |
| **Rate limit (free)** | 60 RPM, 1,500 RPD | 2,000 RPM |

#### Daily cost estimate (paid tier)

| Usage level | Images/day | Input tokens | Output tokens | Est. daily cost | Est. monthly cost |
|---|---|---|---|---|---|
| **Minimum** (3/day, current cap) | 3 | ~300 | ~4,000 | ~$0.0001 | ~$0.003 |
| **Moderate** (30/day) | 30 | ~3,000 | ~40,000 | ~$0.001 | ~$0.03 |
| **Heavy** (300/day) | 300 | ~30,000 | ~400,000 | ~$0.01 | ~$0.30 |
| **Maximum** (1,500/day) | 1,500 | ~150,000 | ~2,000,000 | ~$0.05 | ~$1.50 |

#### Key assumptions

- Average prompt: ~100 tokens (English, concise)
- Average response: ~1,300 tokens (base64-encoded 1024×1024 PNG)
- Current pipeline limit: **max 3 articles/day** → **max 3 images/day**
- At 3 images/day, even paid tier costs are **negligible** (< $0.01/month)
- Free tier (1,500 images/day) is **500× our daily max** — unlikely to be exceeded

**Recommendation**: Use free tier. Monitor usage. If exceeding 1,000 images/month, evaluate paid tier.

---

### 7. Security

#### Secrets in code: NEVER

| Practice | Allowed? | Notes |
|---|---|---|
| API key in `.env` | Yes | Never committed |
| API key in n8n Code node as `process.env.X` | Yes | Read from environment at runtime |
| API key hard-coded in source code | **NO** | Blocked by review |
| API key in log files | **NO** | Redacted before logging |
| API key in error messages | **NO** | Substituted with `[REDACTED]` |
| API key in GitHub commit | **NO** | .env in .gitignore |

#### Key redaction in logs

```javascript
function redactKey(str) {
  return str.replace(/AIzaSy[a-zA-Z0-9_-]{35}/g, 'AIzaSy[REDACTED]');
}
```

All log messages pass through this function before being written to `system.log`.

#### Request security

- Gemini API is called via HTTPS (TLS 1.2+)
- API key is sent as query parameter (`?key=...`), not in request body
- No persistent connection — each request is independent
- No image data is stored locally (processed in memory, uploaded directly)

#### Environment variable validation

```javascript
// At module init
const GEMINI_API_KEY = (function validateAndGetKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'YOUR_GEMINI_API_KEY' || key.startsWith('AIzaSy') === false) {
    console.log('AI_IMAGE_GEMINI_NO_KEY | AI Image Generation disabled');
    return null;
  }
  return key;
})();
```

---

### 8. Secret Management

#### Where secrets are stored

| Secret | Source | Storage | Rotation |
|---|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio | `.env` file | Manual (revoke in Google Cloud Console) |
| `GH_TOKEN` | GitHub | `.env` file | Manual (revoke in GitHub Settings) |
| `TG_TOKEN` | BotFather | `.env` file | Manual (revoke in BotFather) |
| `GROQ_API_KEY` | Groq Console | `.env` file | Manual (revoke in Groq Console) |

#### Secret management procedure

```
Initial setup:
  1. Generate API key at https://aistudio.google.com/app/apikey
  2. Add to .env: GEMINI_API_KEY=AIzaSy...
  3. Verify it works: run readiness validation

Key rotation (if compromised):
  1. Go to Google AI Studio → API Keys
  2. Revoke compromised key
  3. Generate new key
  4. Update .env with new key
  5. Verify new key works

Key lifecycle:
  - Key is valid until revoked
  - No expiration dates on Gemini API keys
  - Monitor for unauthorized usage in Google Cloud Console
  - Rotate every 6 months as best practice
```

#### .env file management

```bash
# .gitignore must contain:
.env
.env.local
*.env

# .env.template (committed) must contain ONLY placeholders:
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
AI_IMAGES_ENABLED=false
```

---

### 9. Readiness Checklist

Before enabling AI Image Generation in production, verify:

| # | Check | How to verify |
|---|---|---|
| 1 | `.env` has valid `GEMINI_API_KEY` | `echo $env:GEMINI_API_KEY` |
| 2 | `.gitignore` excludes `.env` | `git check-ignore .env` |
| 3 | `config/.env.template` has placeholder only | Visually inspect |
| 4 | API key is valid | `curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$env:GEMINI_API_KEY"` |
| 5 | Daily quota tracking file is writable | `touch data/ai_image_usage.json` |
| 6 | gh-proxy is running | `curl http://localhost:3001` |
| 7 | `img/` directory exists in repo | `git ls-files img/` |
| 8 | `AI_IMAGES_ENABLED=false` (rollback safety) | Check .env |
| 9 | Module can be disabled mid-execution | Test with flag toggle |
| 10 | No secrets in code | `git grep "AIzaSy" -- '*.js'` |
