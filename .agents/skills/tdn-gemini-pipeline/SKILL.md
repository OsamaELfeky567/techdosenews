---
name: tdn-gemini-pipeline
description: "Gemini image generation pipeline for Tech Dose News — isolated system, no production impact"
---

# Gemini Image Pipeline Skill

## Status

**ISOLATED** — completely separate from production workflow

**Location:** `D:\Projects\Open Code\gemini-pipeline/`

## Files

| File | Purpose |
|------|---------|
| `gemini-pipeline/generate-image.js` | Main pipeline — fetches article, generates image, uploads |
| `gemini-pipeline/test-article.json` | Sample article for testing |
| `gemini-pipeline/preview.html` | Preview page for generated images |

## Pipeline Flow

```
Read article → Extract title + category → Build Gemini prompt
  → Call Gemini API (image generation) → Save image
  → Upload to GitHub → Update article with image URL
```

## Test Results (June 19)

| Stage | Status | Notes |
|-------|--------|-------|
| Article fetch | PASS | Reads from test-article.json |
| Category mapping | PASS | Maps to image query |
| Gemini API call | SKIP | Needs GEMINI_API_KEY |
| Image save | SKIP | Depends on API call |
| Upload to GitHub | SKIP | Depends on image |
| Rollback test | PASS | Handles failures gracefully |

## Requirements to Complete

- `GEMINI_API_KEY` environment variable
- OR alternative image provider (DALL-E, Stable Diffusion)
- The pipeline does NOT touch production n8n workflow
- The pipeline does NOT write to production `data/articles/`

## Rollback Behavior

- If Gemini API fails → pipeline exits cleanly with error message
- If image upload fails → no change to article
- If article update fails → uploaded image becomes orphan (manual cleanup needed)

## Safety Rules

1. NEVER modify `production_workflow.json`
2. NEVER write to production article files
3. NEVER run against production `index.json`
4. Always test with `test-article.json` first
5. Report failures, don't silently retry
