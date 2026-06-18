# Tech Dose News — AI Module Isolation Plan

## Phase 7 — Ensuring AI Is Optional, Replaceable, and Non-Blocking

### 1. Isolation Principle

The AI Image Generation module must be **completely optional**. The publishing pipeline must:

- Function identically whether AI is enabled or disabled
- Have zero knowledge of the AI module's internal workings
- Treat the AI module as an **integration contract**, not coupled code
- Be fully testable with AI disabled

```
┌─────────────────────────────────────────────────────────────┐
│                    Core Pipeline                            │
│  (Does NOT know AI exists. Does NOT import AI module.)      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Staging & Publish                                   │   │
│  │                                                     │   │
│  │  if (config.aiImagesEnabled) {                      │   │
│  │    result = await aiImageModule.generateAndAttach()  │   │
│  │    // NEVER check result — proceed regardless        │   │
│  │  }                                                   │   │
│  │                                                     │   │
│  │  writeArticle(article)  ← article may have imageUrl │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │
         │ calls via interface only
         ▼
┌─────────────────────────────────────────────────────────────┐
│              AI Image Module (self-contained)               │
│                                                             │
│  - Can be deleted without affecting the pipeline            │
│  - Can be replaced with DALL-E, Stable Diffusion, etc.      │
│  - Can be disabled with one environment variable            │
│  - Never throws — always returns gracefully                 │
│  - All failures are handled internally                      │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Feature Flag

#### Environment variable

```
# In .env, config, or n8n Code node constants:
AI_IMAGES_ENABLED=false    # default: DISABLED
```

**Rules**:
- Default value is `false` — AI images are opt-in, not opt-out
- The flag is read ONCE at pipeline start (not per-article)
- The flag lives alongside other configuration (not in the AI module itself)

#### Where the flag is checked

The flag is checked in exactly **one place**: the Staging & Publish node, immediately before the AI image hook point.

```
Staging & Publish v5:
  ...
  // AI Image Hook (only if enabled)
  if (config.AI_IMAGES_ENABLED === true) {
    const imgResult = await aiImageModule.generateAndAttachImage(article);
    // intentionally ignore imgResult — article publishes regardless
  }
  // continue with publish...
```

**No other node in the pipeline checks or cares about this flag.** The Orchestrator, Writer, Reviewer, Validate, and Telegram nodes are completely unaware of AI images.

---

### 3. Module Interface (the Contract)

The pipeline interacts with the AI module through a **narrow, stable interface**:

```typescript
// file: ai-image-module.js

/**
 * @param {Object} article - The article object being published
 * @param {string} article.id - Unique article ID
 * @param {string} article.title_ar - Arabic title
 * @param {string} article.body - HTML body content
 * @param {string} article.excerpt - Article excerpt
 * @returns {Promise<{imageUrl: string|null, success: boolean}>}
 *   Always resolves (never throws). On any failure, returns {imageUrl: null, success: false}.
 */
async function generateAndAttachImage(article) {
  // Step 1: Check if API key is configured
  // Step 2: Generate prompt from article
  // Step 3: Call Gemini API
  // Step 4: Process image data
  // Step 5: Upload via gh-proxy
  // Step 6: Update article.image_url
  
  // Every step wrapped in try/catch
  // On any error: log, return {imageUrl: null, success: false}
}
```

#### What the module EXPORTS

| Export | Type | Purpose |
|---|---|---|
| `generateAndAttachImage` | `Function` | Main entry point — generates and attaches image to article |
| `name` | `string` | Module name: `"ai-image-gemini"` |
| `enabled` | `boolean` | Whether module is configured (API key present) |

#### What the module does NOT export

- No internal config
- No prompt templates
- No API credentials
- No error details

#### Contract guarantees

| Guarantee | Description |
|---|---|
| Never throws | All errors caught and logged internally |
| Never blocks | Returns within timeout or resolves with null |
| No side effects on failure | On any failure, no files written, no indexes changed |
| Idempotent on retry | Re-running produces a new image (no stale state) |
| Log-only on failure | Errors go to `system.log`, never to pipeline error handling |

---

### 4. Integration Point

The integration between pipeline and AI module is a **single code block** in Staging & Publish:

```javascript
// === Staging & Publish v5 — AI Image Hook ===
// This is the ONLY integration point between the pipeline and AI Image module.
// If the module is disabled, missing, or fails — publishing is unaffected.

const AI_IMAGES_ENABLED = process.env.AI_IMAGES_ENABLED === 'true';

async function publishArticle(article) {
  // 1. Acquire lock
  // 2. Check content hash
  
  // 3. AI Image Hook (if enabled)
  if (AI_IMAGES_ENABLED) {
    try {
      const { generateAndAttachImage } = require('./ai-image-module.js');
      await generateAndAttachImage(article);
    } catch (e) {
      // Safety net — even if module throws (should never happen),
      // we catch it and continue
      console.log(`AI_IMAGE_MODULE_ERROR | ${e.message}`);
    }
  }
  
  // 4. Write article JSON
  // 5. Verify article on GitHub
  // 6. Update indexes
  // 7. Release lock
  
  // Note: article.image_url may be set by the hook, or may be undefined
  // Both cases are valid.
}
```

---

### 5. What Happens When AI Is Disabled

```
AI_IMAGES_ENABLED=false

Execution flow:
  Schedule Trigger → Orchestrator → Writer → Reviewer → Validate
    → Staging & Publish
        → Acquire lock
        → Check content hash
        → [AI Image Hook: SKIPPED — flag is false]
        → Write article JSON (no image_url field)
        → Verify on GitHub
        → Update indexes
        → Release lock
    → Post to Telegram

Result: Article published WITHOUT image. No AI code runs. No AI logs.
Zero overhead. Identical to current behavior.
```

---

### 6. What Happens When AI Is Enabled

```
AI_IMAGES_ENABLED=true

Execution flow:
  ...same as above through Validate...
    → Staging & Publish
        → Acquire lock
        → Check content hash
        → [AI Image Hook: RUNNING]
            → Prompt Generator (try/catch)
            → Gemini API call (try/catch with retry + timeout)
            → Image processing (try/catch)
            → Upload to GitHub via proxy (try/catch)
            → Attach image_url to article object
            → [Either succeeds with imageUrl or fails with null]
            → Module returns {imageUrl, success}
            → Pipeline continues (ignores return value)
        → Write article JSON (WITH image_url if generated)
        → Verify on GitHub
        → Update indexes
        → Release lock
    → Post to Telegram

Result: Article published WITH or WITHOUT image depending on AI success.
Pipeline is completely unaffected by AI outcome.
```

---

### 7. Replacement / Swap Strategy

If the team decides to replace Gemini with a different provider (DALL-E, Stable Diffusion, Midjourney API, etc.):

1. Create a new module file: `ai-image-dalle.js`
2. Implement the same interface:
   ```javascript
   async function generateAndAttachImage(article) {
     // DALL-E specific implementation
   }
   module.exports = { generateAndAttachImage, name: "ai-image-dalle" };
   ```
3. Update the single import line in Staging & Publish:
   ```javascript
   // Before:
   const { generateAndAttachImage } = require('./ai-image-gemini.js');
   // After:
   const { generateAndAttachImage } = require('./ai-image-dalle.js');
   ```

**No other changes are needed.** The pipeline, the hook point, the error handling, the article schema, and the frontend remain identical.

---

### 8. File Structure

```
tdn_v1_0_stable/
└── modules/
    └── ai-image/
        ├── index.js              # Module entry — exports generateAndAttachImage
        ├── prompt-generator.js   # Builds image prompt from article text
        ├── gemini-client.js      # Gemini API wrapper with retry/timeout
        ├── image-processor.js    # Decode, validate, resize image
        ├── uploader.js           # Upload to GitHub via gh-proxy
        └── README.md             # Module documentation (optional)
```

The module is entirely self-contained within `modules/ai-image/`. It depends on:
- Node.js built-ins (`https`, `buffer`, `fs`)
- The existing gh-proxy (running externally)
- Environment variables (read at module init)

It does NOT depend on any pipeline code, any n8n internals, or any other module.

---

### 9. Verification Checklist

| Test | Expected Result |
|---|---|
| `AI_IMAGES_ENABLED=false` | Article publishes, no AI code runs, no logs |
| `AI_IMAGES_ENABLED=true` + API key valid | Article publishes with image if all succeeds |
| `AI_IMAGES_ENABLED=true` + API key invalid | Article publishes without image, error logged |
| `AI_IMAGES_ENABLED=true` + no network | Article publishes without image, error logged |
| `AI_IMAGES_ENABLED=true` + module file missing | Article publishes, error logged (caught by try/catch) |
| `AI_IMAGES_ENABLED=true` + gh-proxy down | Article publishes without image, error logged |
| Module file deleted entirely | Pipeline still runs with `AI_IMAGES_ENABLED=false` |
| Module swapped to DALL-E | Pipeline still runs, images come from new provider |

---

### 10. Config Reference

```env
# .env or n8n Code node constants

# Feature flag — set to true to enable AI image generation
AI_IMAGES_ENABLED=false

# Gemini API key (only needed if AI_IMAGES_ENABLED=true)
GEMINI_API_KEY=

# Optional: gh-proxy URL (defaults are set in module if omitted)
GH_PROXY_URL=http://localhost:3001

# Optional: n8n gh-proxy webhook URL (alternative to standalone proxy)
N8N_GH_PROXY_URL=http://localhost:5678/webhook/gh-proxy
```

Only `AI_IMAGES_ENABLED` is required for the feature flag. All other variables have defaults or are only read when the module is enabled.
