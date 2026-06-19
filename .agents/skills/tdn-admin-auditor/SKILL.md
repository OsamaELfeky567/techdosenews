---
name: tdn-admin-auditor
description: "Admin panel auditor for Tech Dose News — audit functions, verify counters, check error handling"
---

# Admin Panel Auditor Skill

## Admin Panel Architecture

The admin panel (`admin/index.html`) is a 2575-line single-file application with:

- **Dashboard**: Stats, insights, analytics KPIs, charts
- **Articles**: Search/filter table with CRUD operations
- **Editor**: Create/edit articles with image upload, tags, categories
- **Categories**: Manage 5 canonical categories + colors
- **Themes**: Color pickers, site info, advanced settings
- **Settings**: GitHub token, webhooks, analytics integrations, SEO
- **Workflow**: n8n webhook trigger

## Critical Functions

| Function | Line | Purpose |
|----------|------|---------|
| `loadDb()` | ~1251 | Loads `articles_db.json` |
| `loadIndex()` | ~1258 | Loads `data/articles/index.json` |
| `renderDashboard()` | ~1506 | Calculates and displays stats |
| `renderArticles()` | ~1674 | Renders article table with search/filter |
| `saveArticle()` | ~1863 | Creates/updates articles with GitHub sync |
| `deleteArticle()` | ~2021 | Deletes with rollback |
| `editArticle()` | ~2089 | Opens editor with article data |
| `afterLogin()` | ~2256 | Init: load data, rebuild if stale, populate settings |

## Audit Checklist

### Dashboard Counters
- `statTotal` = `DB.length` (articles_db.json count)
- `statPublished` = `INDEX.length` filtered (exclude draft)
- `statToday` = articles created today
- Verify these match between reloads

### Article Operations
- [ ] Create article → appears in articles list
- [ ] Edit article → changes persist after reload
- [ ] Delete article → removed from both DB and INDEX
- [ ] Delete with rollback → restore on failure

### Error Handling
- [ ] Each GitHub write has retry logic (2 retries)
- [ ] Each GitHub write has pre-fetched SHA
- [ ] Delete has full rollback (originalDB, originalINDEX)
- [ ] Empty states handled in dashboard and articles

### Known Issues
- `published_links.json` never read for dedup
- Bulk actions MISSING
- Scheduled publishing PARTIAL (no date picker)
- Analytics fields PRESENT but real data requires GoatCounter/GA4
