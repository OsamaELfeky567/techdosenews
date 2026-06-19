---
name: tdn-architecture
description: "Tech Dose News architecture overview — data flow, component roles, dependency map, and integration boundaries"
---

# Tech Dose News Architecture Skill

## System Overview

Tech Dose News (techdosenews) is a GitHub Pages-hosted Arabic AI/tech news aggregator. The system has three main subsystems:

```
Google News RSS → n8n (Groq AI translation) → GitHub API → GitHub Pages (static site)
                                                          → Telegram notifications
Admin Panel (browser) → GitHub API → GitHub Repo (data files) → GitHub Pages
```

## Key Files

| File | Role |
|------|------|
| `data/articles/index.json` | **SOURCE OF TRUTH** — all 367+ published articles |
| `articles_db.json` | Dashboard DB — rebuilt from index.json via sync_articles.js |
| `data/published_topics.json` | n8n tracking — 12+ published article titles |
| `data/content_hashes.json` | n8n dedup — title+description hashes |
| `data/published_links.json` | n8n tracking — written but not read for dedup |
| `admin/index.html` | Single-file admin panel (2575 lines) |
| `script.js` | Frontend rendering, category mapping |
| `server/gh-proxy.mjs` | GitHub App proxy (port 3001) |
| `backup_admin_final_lock/production_workflow.json` | n8n workflow code |

## Data Flow

```
n8n (30-min schedule)
  → Fetch Google News RSS (English, US-centric)
  → Filter: freshness (24h) + tech keywords (~90 whitelist)
  → Dedup: contentHash(title + description[0:100])
  → Translate: Groq LLM (Llama 3.3 70B) → Arabic
  → Write to GitHub: index.json + 4 tracking files
  → Telegram notification

Admin Panel (browser, GitHub Token auth)
  → Load: articles_db.json + index.json via GitHub API
  → Edit: saveArticle() writes to both files
  → Delete: deleteArticle() with rollback
  → Sync: requires manual sync_articles.js to rebuild DB

Site (GitHub Pages)
  → Load: index.json → render all articles
  → Categories: 5 canonical + legacy map for backward compat
```

## Canonical Categories

- `ai` — الذكاء الاصطناعي (AI)
- `cybersecurity` — أمن سيبراني (Cybersecurity)
- `companies` — شركات (Companies)
- `phones` — هواتف ذكية (Phones/Mobile)
- `ev` — سيارات كهربائية (Electric Vehicles)

## Critical Rules

- **index.json is always the source of truth** — never delete or overwrite
- **articles_db.json is a derived file** — always rebuildable from index.json
- **n8n workflow is production-locked** — READ ONLY, never modify
- **Admin panel is MAINTENANCE MODE** — no new features, only bug fixes unless explicitly requested
- **Gemini pipeline is isolated** — never touch production files
