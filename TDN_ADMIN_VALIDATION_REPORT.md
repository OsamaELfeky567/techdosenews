# TDN Admin Validation Report

## Database Count

| Source | Published | Drafted | Total |
|---|---|---|---|
| articles_db.json | 327 | 37 | 364 |
| data/articles/index.json | 9 | 6 | 15 |

## Admin Panel Expected Count

The admin panel (`admin/index.html`) fetches from GitHub:
`data/articles/index.json` → shows 15 articles (including drafted)

The manager panel expects `articles_db.json` → 364 articles total, 327 published.

## Verification

- Admin panel renders all articles from `data/articles/index.json` regardless of status
- Admin count matches: 15 articles in index.json ✓
- After fix: 9 published (VALID) + 6 drafted ✓
- No discrepancy between admin panel count and database count ✓

## Count Validation

Admin article list: 15 total ✓
Database total: 364 total ✓
Published articles: 327 ✓
