---
name: tdn-gh-ops
description: "GitHub App operations for Tech Dose News — proxy, API, token management, and sync operations"
---

# GitHub App Operations Skill

## GitHub App Proxy

**Process:** `server/gh-proxy.mjs` — Node.js Express server on port 3001

**Authentication:**
- The proxy uses GitHub App installation tokens (JWT-based)
- Falls back to PAT when proxy is unavailable
- Proxy URL configured in admin panel settings

**PID check:**
```powershell
Get-Process -Id 14276 -ErrorAction SilentlyContinue  # or current PID
```

## API Endpoints Used

| Operation | Method | Path | Purpose |
|-----------|--------|------|---------|
| Read file | GET | `/repos/:owner/:repo/contents/:path` | Fetch data files |
| Write file | PUT | `/repos/:owner/:repo/contents/:path` | Save changes |
| Delete file | DELETE | `/repos/:owner/:repo/contents/:path` | Remove article files |

## Token Management

- PAT stored in browser `sessionStorage` (ephemeral)
- Token must have `repo` scope for private repos, `public_repo` for public
- Token must NOT have `workflow` scope to push workflow files (permission issue)
- n8n uses its own `GH_TOKEN` environment variable (separate from admin panel)

## Single Source of Truth

`data/articles/index.json` is the single source of truth — no other data file needed.

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Push rejected | Token lacks workflow scope | Exclude workflow files from commit |
| SHA mismatch | Concurrent write | Retry with retry logic + SHA refetch |
| Proxy not running | Process died | Start: `node server/gh-proxy.mjs` |
| Rate limit exceeded | Too many API calls | Wait 1 hour or use PAT |
