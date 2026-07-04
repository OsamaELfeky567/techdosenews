# Admin Configuration Audit Report

**Date:** 2026-07-04
**Phase:** 8.2 — Admin Configuration Recovery

---

## 1. Configuration Architecture

### Single Source of Truth

```
admin_config.json (GitHub repository)
       ↓
  loadConfig() — fetches from RAW_URL + admin_config.json?t=<timestamp>
       ↓                         ↕
  localStorage (admin_config_cache) — persistent cache across sessions
       ↓
  CONFIG (runtime JavaScript object)
       ↓
  Settings page → saveSettings() → Object.assign(CONFIG, fields)
       ↓
  localStorage cache update + GitHub PUT
       ↓
  ghPut('admin_config.json') → GitHub Commit → GitHub Push → Users
```

### Merge Priority (highest wins)
1. **GitHub `admin_config.json`** — source of truth
2. **localStorage `admin_config_cache`** — fallback if GitHub fetch fails
3. **Hardcoded DEFAULTS** — minimal bootstrapping values

### Before vs After

| Aspect | Before (Phase 8.1) | After (Phase 8.2) |
|--------|-------------------|-------------------|
| Token storage | `sessionStorage` (lost on tab close) | `localStorage` (persistent) |
| Auth persistence | `sessionStorage` (lost on tab close) | `localStorage` (persistent) |
| Config fetch failure | `CONFIG = {}` (total loss) | Falls back to localStorage cache |
| Config merge | Complete replace (line 406) | Deep merge: defaults + cache + GitHub |
| GitHub owner/repo | Hardcoded `const` | Config-driven with hardcoded fallback |
| Branch | Hardcoded `'main'` | `CONFIG.ghBranch || 'main'` |
| ghGet auth | Unauthenticated (rate limited) | Uses token when available |
| Settings form fields | 10 fields | 14 fields (added ghOwner, ghRepo, ghBranch) |
| Token clearing | Stale token remained in sessionStorage | Proper clear on empty token |
| Cache on save | None | Updates localStorage + GitHub |
| Config health check | None | New `config_health.md` report |

---

## 2. Loaded Values

| Field | Source | Value |
|-------|--------|-------|
| `siteUrl` | GitHub config | `https://td-arabi.com` |
| `siteName` | GitHub config | `TD بالعربي` |
| `siteDesc` | GitHub config | `منصة إخبارية...` |
| `ghToken` | GitHub config | (present, hidden) |
| `ghOwner` | Config + fallback | `osamaelfeky567` |
| `ghRepo` | Config + fallback | `techdosenews` |
| `ghBranch` | Config + fallback | `main` |
| `telegramBotToken` | GitHub config | (empty) |
| `telegramChannelId` | GitHub config | (empty) |
| `passwordHash` | GitHub config | (present, hidden) |
| `pexelsApiKey` | GitHub config | (present, hidden) |

---

## 3. Missing Values (Optional)

The following fields exist in `admin_config.json` but are not exposed in the Settings UI:

| Field | Where Used |
|-------|-----------|
| `pexelsApiKey` | Image search (not in settings form) |
| `telegram_channel` | Public Telegram link (script.js) |
| `telegram_redirect` | Telegram redirect URL |
| `telegram_mode` | Telegram mode (direct/redirect) |
| `webhookUrl` | n8n webhook |
| `ghProxyUrl` | GitHub proxy |
| `ga4MeasurementId` | Google Analytics |
| `colors` | Site color scheme |
| `customCss` | Custom styles |
| `customJs` | Custom scripts |

These values are preserved through the merge (not lost on save), but cannot be edited via the Settings form. They must be edited directly in `admin_config.json` or via future settings expansion.

---

## 4. Validation Result

| Check | Status |
|-------|--------|
| CONFIG loaded on startup | ✅ Yes |
| GitHub token available | ✅ Yes (from localStorage cache) |
| localStorage cache populated | ✅ Yes |
| Site URL configured | ✅ `https://td-arabi.com` |
| Repository owner | ✅ `osamaelfeky567` |
| Repository name | ✅ `techdosenews` |
| GH_API dynamically generated | ✅ Yes |
| RAW_URL dynamically generated | ✅ Yes |
| Branch configurable | ✅ `ghBranch || 'main'` |
| Token persists across refresh | ✅ localStorage (not sessionStorage) |
| Auth persists across refresh | ✅ localStorage |
| Config survives fetch failure | ✅ Falls back to localStorage cache |

**Status: 🟢 GREEN** — All required values present and functional.

---

## 5. Credential Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN STARTUP                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────┐                                 │
│  │ Hardcoded DEFAULTS       │                                 │
│  │ siteUrl, ghOwner, ghRepo │                                 │
│  └──────────┬──────────────┘                                 │
│             │ merge                                          │
│             ▼                                                │
│  ┌─────────────────────────┐    ┌─────────────────────────┐  │
│  │ localStorage cache       │◄───│ Previous session saved   │  │
│  │ admin_config_cache       │    │ (if exists)              │  │
│  └──────────┬──────────────┘    └─────────────────────────┘  │
│             │ merge                                          │
│             ▼                                                │
│  ┌─────────────────────────┐                                 │
│  │ GitHub admin_config.json │ ←────── fetch RAW_URL + path   │
│  │ (source of truth)        │       (authenticated with      │
│  └──────────┬──────────────┘        token if available)      │
│             │ merge                                          │
│             ▼                                                │
│  ┌─────────────────────────┐                                 │
│  │      CONFIG {}           │ ←────── used everywhere        │
│  └─────────────────────────┘                                 │
│             │                                                │
│         persist to                                            │
│    localStorage + sessionStorage (gh_token)                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SAVE SETTINGS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────┐                                 │
│  │ Settings form fields     │                                 │
│  └──────────┬──────────────┘                                 │
│             │                                                │
│             ▼                                                │
│  Object.assign(CONFIG, fields)                                │
│             │                                                │
│         ┌───┴───┐                                            │
│         ▼       ▼                                            │
│  ┌──────────┐  ┌──────────────────────┐                      │
│  │ localStorage │  ghPut(admin_config.json) │                 │
│  │ cache update │  → GitHub Commit         │                 │
│  └──────────┘  │  → GitHub Push           │                 │
│                └──────────────────────┘                      │
│                                                              │
│  If token cleared: remove from localStorage                  │
│  If password changed: hash + save                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     SAVE ARTICLE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  saveArticle()                                               │
│       │                                                     │
│       ▼                                                     │
│  Build article object with CONFIG.siteUrl for techdose_link  │
│       │                                                     │
│       ▼                                                     │
│  ghPut('data/articles/index.json')                           │
│       │                                                     │
│       ▼                                                     │
│  Uses: CONFIG.ghToken / localStorage gh_token                │
│        CONFIG.ghBranch || 'main'                             │
│        GH_API (from CONFIG.ghOwner/ghRepo)                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. End-to-End Verification

| Step | Description | Status |
|------|-------------|--------|
| 1 | Open Admin → `loadConfig()` fetches from GitHub | ✅ |
| 2 | Falls back to localStorage if fetch fails | ✅ |
| 3 | Settings page fills from CONFIG automatically | ✅ |
| 4 | Edit settings → Save → localStorage + GitHub updated | ✅ |
| 5 | Empty token → localStorage `gh_token` removed | ✅ |
| 6 | Edit article → `saveArticle()` reads CONFIG for URL | ✅ |
| 7 | Save article → `ghPut()` uses token + branch + API from CONFIG | ✅ |
| 8 | GitHub Commit + Push | ✅ (delegated to GitHub API) |
| 9 | GitHub Pages auto-deploys | ✅ (GitHub Actions) |
| 10 | Refresh Admin → token persisted (localStorage) | ✅ |
| 11 | New tab → config loads from GitHub + localStorage fallback | ✅ |

**No manual credential entry should ever be required after first save.**

---

## 7. Runtime Configuration Snapshot

| Variable | Type | Source | Value |
|----------|------|--------|-------|
| `GH_OWNER` | `let` (dynamic) | `CONFIG.ghOwner` | `osamaelfeky567` |
| `GH_REPO` | `let` (dynamic) | `CONFIG.ghRepo` | `techdosenews` |
| `GH_API` | `let` (dynamic) | Derived from owner/repo | `https://api.github.com/repos/osamaelfeky567/techdosenews` |
| `RAW_URL` | `let` (dynamic) | Derived from owner/repo | `https://raw.githubusercontent.com/osamaelfeky567/techdosenews/main` |
| `CONFIG` | `let` (object) | GitHub + cache + defaults | Full configuration object |
| `localStorage.gh_token` | string | Set from CONFIG.ghToken | (present) |
| `localStorage.admin_config_cache` | string | Set on load + save | Full config JSON |
| `localStorage.tdn_admin_token` | string | Set on login | `authenticated` |
