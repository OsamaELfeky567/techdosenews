# TDN Sitemap Domain Migration Report

## Root Cause

The sitemap generation scripts at `backup_cleanup_final/old_cleanup_20260616/root_audit_scripts/gen_sitemap.js` and `gen_sitemap_remote.js` hardcoded `https://osamaelfeky567.github.io/techdosenews` as the base URL. The `admin_config.json` had `siteUrl` and `canonicalDomain` empty (`""`), causing the admin panel and all HTML frontend files to fall back to the GitHub Pages URL.

All 13 production files (HTML, JS, config) contained hardcoded `https://osamaelfeky567.github.io/techdosenews` references across canonical links, structured data (JSON-LD), Open Graph tags, hreflang alternates, Twitter card meta, and JavaScript-generated article schemas.

## Files Modified

| File | Change |
|------|--------|
| `admin_config.json` | Set `siteUrl` and `canonicalDomain` to `https://td-arabi.com` |
| `sitemap.xml` | **Regenerated** — all 393 URLs now use `https://td-arabi.com` |
| `gen_sitemap.js` | Replaced hardcoded `https://osamaelfeky567.github.io/techdosenews` → `https://td-arabi.com` |
| `gen_sitemap_remote.js` | Same replacement |
| `index.html` | Bulk replace of all `github.io` URLs in canonical, og:url, JSON-LD, hreflang, twitter:image |
| `article.html` | Same |
| `category.html` | Same |
| `about.html` | Same |
| `contact.html` | Same |
| `terms.html` | Same |
| `privacy.html` | Same |
| `disclaimer.html` | Same |
| `editorial-policy.html` | Same |
| `404.html` | Same |
| `dashboard.html` | Same |
| `script.js` | 3 occurrences: `og:url` setter, `NewsArticle` schema URL, and publisher logo URL |
| `admin/index.html` | `getSiteUrl()` fallback, 2 preview `link:` lines |

**Not modified** (per rules):
- `production_workflow.json` — contains n8n pipeline code with `FRONTEND_URL` constant
- `articles_db.json` — contains article data with `source_link` pointing to old domain
- `backup_*` directories — preserved for rollback

## URLs Checked

| Check | Result |
|-------|--------|
| `https://td-arabi.com/sitemap.xml` | ✅ 393 `td-arabi.com` URLs, **0** `github.io` URLs |
| `https://td-arabi.com/robots.txt` | ✅ Points to `https://td-arabi.com/sitemap.xml` |
| `https://td-arabi.com/` (canonical) | ✅ `https://td-arabi.com/` |
| `https://td-arabi.com/article.html` (canonical) | ✅ `https://td-arabi.com/article.html` |
| `https://td-arabi.com/category.html` (canonical) | ✅ `https://td-arabi.com/category.html` |
| Static pages (about, contact, terms, privacy, disclaimer, editorial-policy, 404) | ✅ All canonical → `td-arabi.com` |
| `dashboard.html` (JSON-LD WebSite.url) | ✅ `https://td-arabi.com` |
| `index.html` (JSON-LD Organization.url + WebSite.url) | ✅ `https://td-arabi.com` |
| `article.html` (JSON-LD Organization.url) | ✅ `https://td-arabi.com` |
| `script.js` (dynamic og:url + NewsArticle schema) | ✅ 0 `github.io` references |

## Validation Results

- **Sitemap**: 100% clean — 393 `<loc>` URLs all use `https://td-arabi.com`
- **Canonical URLs**: All 11 production HTML files use `https://td-arabi.com/...`
- **Structured data**: All JSON-LD blocks (Organization, WebSite, NewsArticle) use `https://td-arabi.com`
- **Open Graph**: All `og:url` and `og:image` use `https://td-arabi.com`
- **hreflang**: All `alternate` links use `https://td-arabi.com`
- **Twitter cards**: All `twitter:image` use `https://td-arabi.com`
- **robots.txt**: Already correct (`https://td-arabi.com/sitemap.xml`)
- **Residual `github.io`**: Only in `articles_db.json` (article source data) and `production_workflow.json` (n8n pipeline code) — excluded by constraints

## Category URL Removal

### Context

As part of the Tags Only Architecture migration, category pages (`category.html?cat=ai`, `cat=companies`, `cat=security`, `cat=mobile`, `cat=ev`) are being phased out and should not be submitted to search engines or IndexNow.

### Fix

Removed the 5 category `<url>` entries from the static section of both:
- `backup_cleanup_final/old_cleanup_20260616/root_audit_scripts/gen_sitemap.js`
- `backup_cleanup_final/old_cleanup_20260616/root_audit_scripts/gen_sitemap_remote.js`

### Validation

| Check | Result |
|-------|--------|
| `grep category.html sitemap.xml` | **0 matches** ✅ |
| Article count | 381 (unchanged) ✅ |
| Static pages (/, about, contact, privacy, terms, disclaimer, editorial-policy) | All 7 present ✅ |
| `news:news` entries | 762 (381 articles × 2 for open/close tags) ✅ |
| XML declaration | `<?xml version="1.0" encoding="UTF-8"?>` ✅ |
| Closing tag | `</urlset>` ✅ |
| robots.txt | `Sitemap: https://td-arabi.com/sitemap.xml` ✅ |

## Commits

```
fix(seo): migrate sitemap URLs to td-arabi.com
refactor(seo): remove category URLs from sitemap
```
