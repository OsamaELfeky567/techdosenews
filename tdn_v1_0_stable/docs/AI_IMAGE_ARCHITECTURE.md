# Tech Dose News — AI Image Generation Architecture

## Phase 6 — Gemini AI Image Module

### 1. Executive Summary

| Field | Value |
|---|---|
| **Phase** | 6 — AI Image Architecture |
| **Module** | AI Image Generation (Gemini 2.0 Flash Experimental) |
| **Status** | Design / Not Implemented |
| **Isolation** | FULL — article publishing NEVER depends on AI Image |
| **Integration** | Adapter pattern via module interface |
| **Storage** | GitHub repo `img/` directory via existing gh-proxy |
| **Model** | `gemini-2.0-flash-exp` (image generation) |

### Core design principles

1. **Publishing NEVER depends on AI Image**. The module is a decoration layer, not a gate.
2. **If ANY step fails → article still publishes** without an image.
3. **The module is self-contained**. It does not modify pipeline logic, only article data.
4. **The pipeline does not call the module**. Instead, the module hooks into a well-defined extension point after validation but before publish.

---

### 2. Architecture Diagram

```
                            ┌──────────────────────────────────────────┐
                            │          Existing Pipeline               │
                            │  (unchanged, no awareness of AI Image)   │
                            │                                          │
    Schedule ──→ Orchestrator ──→ Writer ──→ Reviewer ──→ Validate ───┤
                                                                    │
                                                                    ▼
                              ┌──────────────────────────────────────────┐
                              │     Staging & Publish v5                │
                              │  ┌──────────────────────────────────┐   │
                              │  │ 1. Acquire lock                  │   │
                              │  │ 2. Check content hash            │   │
                              │  │ 3. ┌─────────────────────────┐   │   │
                              │  │    │ AI Image Hook (if       │   │   │
                              │  │    │ enabled) → generate &   │   │   │
                              │  │    │ attach image            │   │   │
                              │  │    │ ⚠ NEVER blocks publish  │   │   │
                              │  │    └─────────────────────────┘   │   │
                              │  │ 4. Write article JSON file       │   │
                              │  │ 5. Verify article on GitHub      │   │
                              │  │ 6. Update indexes                 │   │
                              │  │ 7. Release lock                   │   │
                              │  └──────────────────────────────────┘   │
                              └──────────────────────────────────────────┘
                                                                    │
                                                                    ▼
                                                          Post to Telegram


                            ┌──────────────────────────────────────────┐
                            │        AI Image Module (isolated)        │
                            │                                          │
                            │  ┌─────────────┐                         │
                            │  │ Prompt Gen  │ ← Article title + body  │
                            │  └──────┬──────┘                         │
                            │         ↓                                │
                            │  ┌─────────────┐                         │
                            │  │ Gemini API   │ ← POST with prompt     │
                            │  └──────┬──────┘                         │
                            │         ↓                                │
                            │  ┌─────────────┐                         │
                            │  │ Image       │ ← base64 decode         │
                            │  │ Processing  │                         │
                            │  └──────┬──────┘                         │
                            │         ↓                                │
                            │  ┌─────────────┐                         │
                            │  │ Upload via  │ ← PUT to gh-proxy       │
                            │  │ gh-proxy    │   → GitHub img/{id}.png │
                            │  └──────┬──────┘                         │
                            │         ↓                                │
                            │  ┌─────────────┐                         │
                            │  │ Attach to   │ ← Add imageUrl to       │
                            │  │ Article     │   article JSON          │
                            │  └─────────────┘                         │
                            └──────────────────────────────────────────┘
```

### 3. Data Flow (Step by Step)

#### Step 1: Prompt Generator

**Input**: Article object `{ title_ar, excerpt, body, category, tags }`
**Process**: Extract key topics, entities, and themes. Build a structured English prompt for Gemini image generation.
**Output**: `{ prompt: string, negativePrompt?: string }`

Prompt template:
```
Generate a modern tech news illustration for the following Arabic article.

Title: {title_ar}
Category: {category}
Key topics extracted: {keywords}

Style: Clean, professional tech news illustration. Flat design or photorealistic.
No text in the image. No people faces. Suitable as article cover image.
Aspect ratio: 16:9. Mood: professional, modern, tech-focused.
```

**Failure mode**: Prompt generation fails (e.g., article has no body) → skip image generation entirely. Log `AI_IMAGE_PROMPT_FAILED`. Article publishes without image.

#### Step 2: Gemini API Call

**Endpoint**: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={API_KEY}`

**Request payload**:
```json
{
  "contents": [{
    "parts": [{
      "text": "Generate a modern tech news illustration... (prompt from Step 1)"
    }]
  }],
  "generationConfig": {
    "temperature": 0.4,
    "topK": 32,
    "topP": 1,
    "maxOutputTokens": 4096
  }
}
```

**Response** (success):
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "inlineData": {
          "mimeType": "image/png",
          "data": "base64-encoded-image-data..."
        }
      }]
    }
  }]
}
```

**Failure modes**:
- API timeout → skip, log `AI_IMAGE_GEMINI_TIMEOUT`
- API returns error → skip, log `AI_IMAGE_GEMINI_ERROR`
- API quota exhausted → skip, log `AI_IMAGE_QUOTA_EXCEEDED`
- Response missing image data → skip, log `AI_IMAGE_GEMINI_RESPONSE_INVALID`

#### Step 3: Image Processing

**Input**: Base64-encoded image string from Gemini response
**Process**:
1. Decode base64 to binary buffer
2. Validate image format (PNG/JPEG expected)
3. Validate file size (max 1MB for GitHub compatibility)
4. Generate filename: `img/{article-id}.png`

**Failure modes**:
- Base64 decode fails → skip, log `AI_IMAGE_DECODE_FAILED`
- Image too large (>1MB) → skip, log `AI_IMAGE_TOO_LARGE`
- Invalid image format → skip, log `AI_IMAGE_FORMAT_INVALID`

#### Step 4: Upload via gh-proxy

Two possible proxy targets:
1. **Standalone proxy** (`server/gh-proxy.mjs` on port 3001) — POST `http://localhost:3001` with `action: "put-binary"`
2. **n8n proxy** (webhook endpoint) — POST `http://localhost:5678/webhook/gh-proxy` with `action: "put-binary"`

**Request** (to either proxy):
```json
{
  "action": "put-binary",
  "path": "img/{article-id}.png",
  "content": "<base64-image-data>",
  "message": "AI-generated image for article {article-id}"
}
```

**Failure modes**:
- Proxy unreachable (server down) → skip, log `AI_IMAGE_PROXY_UNREACHABLE`
- GitHub API error → skip, log `AI_IMAGE_UPLOAD_FAILED`
- File too large for GitHub → skip, log `AI_IMAGE_SIZE_EXCEEDED`

#### Step 5: Attach to Article

**Process**: Update the article JSON object to include the image URL:
```json
{
  ...existingArticleFields,
  "image_url": "https://osamaelfeky567.github.io/techdosenews/img/{article-id}.png"
}
```

This field is added to the article JSON **before** it is written to GitHub in the Staging & Publish step.

**Failure mode**: This step cannot fail in a way that blocks publishing. If the image_url field is missing or invalid, the article still publishes (the field is simply omitted).

#### Step 6: Publish

**Process**: The article JSON (now with optional `image_url` field) is written to `data/articles/{slug}.json` and the index is updated as normal.

**Frontend behavior**: The article template checks for `image_url` in the JSON. If present, it renders the image as the article hero. If absent, it shows a fallback placeholder (existing behavior, unchanged).

---

### 4. Module Interface

```typescript
// ai-image-module.d.ts — Type definition for the module interface

interface AIImageModule {
  /** Whether the module is enabled (feature flag) */
  enabled: boolean;

  /**
   * Generate and attach an image to the article.
   * This function NEVER throws. On any failure, it returns
   * { imageUrl: null } and logs the error.
   *
   * @param article - The article object with title, body, etc.
   * @returns The image URL or null, plus a status flag
   */
  generateAndAttachImage(
    article: Article
  ): Promise<{ imageUrl: string | null; success: boolean }>;
}

interface Article {
  id: string;
  title_ar: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  source_name: string;
  source_link: string;
  readTime: string;
  image_url?: string;  // Added by this module
}
```

---

### 5. API Contracts

#### Gemini 2.0 Flash Experimental

| Property | Value |
|---|---|
| **Endpoint** | `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent` |
| **Auth** | `?key={GEMINI_API_KEY}` query parameter |
| **Model** | `gemini-2.0-flash-exp` |
| **Max output** | 4096 tokens |
| **Temperature** | 0.4 (low for consistency) |
| **Timeout** | 30 seconds (hard) |
| **Image format** | PNG (base64 inline in response) |
| **Rate limits** | See GEMINI_READINESS.md |

#### gh-proxy (GitHub Upload)

| Property | Value |
|---|---|
| **Endpoint** | `POST http://localhost:3001` (standalone) or `POST http://localhost:5678/webhook/gh-proxy` (n8n) |
| **Action** | `put-binary` |
| **Path** | `img/{article-id}.png` |
| **Content** | Base64-encoded PNG |
| **Max payload** | < 1MB (GitHub Pages limit) |

#### Article JSON (updated schema)

```json
{
  "id": "art-1712345678-abc123",
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
  "quality_score": 0,
  "image_url": "https://osamaelfeky567.github.io/techdosenews/img/art-1712345678-abc123.png"
}
```

The `image_url` field is OPTIONAL. Frontend must handle its absence gracefully.

---

### 6. Error Handling Strategy

#### Isolation guarantee

```
┌────────────────────────────────────────────────────────────┐
│                    AI Image Module                         │
│                                                            │
│  Step 1: Prompt Generation ──── failure ──→ log ──→ null  │
│  Step 2: Gemini API Call  ──── failure ──→ log ──→ null   │
│  Step 3: Image Processing ──── failure ──→ log ──→ null    │
│  Step 4: Upload via Proxy ──── failure ──→ log ──→ null   │
│  Step 5: Attach to Article ─── success → imageUrl          │
│                              ─ failure → null (log only)   │
│                                                            │
│  RESULT:                                                    │
│  - imageUrl != null → article published WITH image         │
│  - imageUrl == null → article published WITHOUT image      │
│  - Publisher NEVER sees a failure from this module         │
└────────────────────────────────────────────────────────────┘
```

#### Error codes and logging

| Error Code | Step | Severity | Logged |
|---|---|---|---|
| `AI_IMAGE_MODULE_DISABLED` | Entry | Info | No (expected) |
| `AI_IMAGE_PROMPT_FAILED` | 1 | Warning | Yes |
| `AI_IMAGE_GEMINI_TIMEOUT` | 2 | Warning | Yes |
| `AI_IMAGE_GEMINI_ERROR` | 2 | Warning | Yes |
| `AI_IMAGE_QUOTA_EXCEEDED` | 2 | Info | Yes |
| `AI_IMAGE_GEMINI_RESPONSE_INVALID` | 2 | Warning | Yes |
| `AI_IMAGE_DECODE_FAILED` | 3 | Warning | Yes |
| `AI_IMAGE_TOO_LARGE` | 3 | Warning | Yes |
| `AI_IMAGE_FORMAT_INVALID` | 3 | Warning | Yes |
| `AI_IMAGE_PROXY_UNREACHABLE` | 4 | Warning | Yes |
| `AI_IMAGE_UPLOAD_FAILED` | 4 | Warning | Yes |
| `AI_IMAGE_ATTACH_FAILED` | 5 | Warning | Yes |
| `AI_IMAGE_GENERATED` | All | Info | Yes |

#### Fallback behavior

| Scenario | Article publishes? | Image included? | User impact |
|---|---|---|---|
| Module disabled (`AI_IMAGES_ENABLED=false`) | Yes | No (placeholder) | None |
| Prompt generation fails | Yes | No (placeholder) | None |
| Gemini API returns error | Yes | No (placeholder) | None |
| Gemini API quota exhausted | Yes | No (placeholder) | None |
| Gemini API times out | Yes | No (placeholder) | None |
| Gemini returns invalid image data | Yes | No (placeholder) | None |
| Image >1MB after generation | Yes | No (placeholder) | None |
| gh-proxy unreachable | Yes | No (placeholder) | None |
| GitHub upload fails | Yes | No (placeholder) | None |
| Everything succeeds | Yes | Yes (generated image) | Enhanced article |

---

### 7. Logging Format

All AI Image module logs follow the convention:

```
AI_IMAGE_GENERATED | article={id} | image_url={url} | size={bytes}
AI_IMAGE_GEMINI_TIMEOUT | article={id} | error={message}
AI_IMAGE_GEMINI_ERROR | article={id} | status={code} | error={message}
AI_IMAGE_QUOTA_EXCEEDED | article={id}
AI_IMAGE_UPLOAD_FAILED | article={id} | path={path} | error={message}
AI_IMAGE_PROXY_UNREACHABLE | article={id} | error={message}
```

Logs go to `data/logs/system.log` (same as all other pipeline logs).

---

### 8. File Storage

| Path | Purpose | Created by |
|---|---|---|
| `img/{article-id}.png` | Generated article image | AI Image Module → gh-proxy → GitHub |
| `data/articles/{slug}.json` | Article JSON with optional `image_url` | Staging & Publish |

Images are stored in the root `img/` directory of the GitHub Pages repo. This directory already exists (empty) and is served by GitHub Pages.

---

### 9. Dependencies

| Dependency | Purpose | Status |
|---|---|---|
| `gemini-2.0-flash-exp` | Image generation model | External API |
| `GEMINI_API_KEY` | Auth for Gemini API | Environment variable |
| gh-proxy (standalone or n8n) | GitHub upload proxy | Existing (`server/gh-proxy.mjs`) |
| `node:https` or `fetch` | HTTP calls to Gemini API | Node.js built-in |
| Base64 decode (Buffer.from) | Image data processing | Node.js built-in |

The module uses ZERO additional npm packages. All functionality uses Node.js built-ins and existing infrastructure.

---

### 10. Frontend Integration

The frontend (`article.html` + `script.js`) must be updated to:

1. Check for `article.image_url` in the JSON
2. If present, render `<img src="${article.image_url}" alt="${article.title_ar}">` as the hero image
3. If absent, show existing fallback behavior (no image or placeholder)

This change is MINIMAL and backward-compatible. The frontend already handles all article fields conditionally.

---

### 11. Testing

| Test | Type | What it verifies |
|---|---|---|
| Module disabled | Integration | Article publishes without image call |
| Gemini API failure | Integration | Article publishes, error logged |
| Gemini API timeout | Integration | Article publishes within 30s |
| Image too large | Integration | Article publishes, image skipped |
| Upload failure | Integration | Article publishes, error logged |
| Full success | Integration | Article publishes with valid image URL |
| Frontend with image | E2E | Article page renders image correctly |
| Frontend without image | E2E | Article page renders without errors |
