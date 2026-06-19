---
name: tdn-data-integrity
description: "Data integrity verification for Tech Dose News — compare files, detect drift, validate article counts"
---

# Data Integrity Skill

## Core Principle

**index.json is the source of truth. Everything else is derived.**

## Integrity Checks

### Check 1: File Counts Match
```javascript
const idx = require('./data/articles/index.json');
const db = require('./articles_db.json');
console.log('Match:', idx.length === db.length);
```

### Check 2: No Duplicate IDs
```javascript
const ids = idx.map(a => a.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log('Duplicate IDs:', dupes.length ? dupes : 'None');
```

### Check 3: Status Distribution
```javascript
const s = {};
idx.forEach(a => { const st = a.status || 'undefined'; s[st] = (s[st]||0)+1; });
console.log(s);
```

### Check 4: Articles Missing from DB
```javascript
const missing = idx.filter(i => !db.some(d => String(d.id) === String(i.id)));
console.log('Articles in INDEX but not DB:', missing.length);
```

### Check 5: Orphans (DB articles not in INDEX)
```javascript
const orphans = db.filter(d => !idx.some(i => String(i.id) === String(d.id)));
console.log('Articles in DB but not INDEX:', orphans.length);
```

## Sync Protocol

When a mismatch is detected:

1. **Identify root cause** — n8n push without DB sync? Admin edit without INDEX sync?
2. **Run sync:** `node scripts/sync_articles.js`
3. **Verify:** All 5 checks above must pass
4. **Commit:** `git add articles_db.json && git commit -m "Sync DB with INDEX"`
5. **Deploy:** `git push origin main`

## Historical Mismatch Data

| Date | INDEX | DB | Delta | Root Cause |
|------|-------|----|-------|------------|
| June 19 (pre-sync) | 367 | 355 | +12 | n8n published 12 articles, DB never synced |
| June 19 (post-sync) | 367 | 367 | 0 | Fixed by sync_articles.js |

## Dashboard Counter Verification

The dashboard shows:
- **إجمالي المقالات** = `DB.length` (articles_db.json)
- **منشور على الموقع** = `INDEX.filter(a => a.status !== 'draft').length` (index.json, excluding drafts)
- **اليوم** = articles with `created_at` >= today midnight

Cross-reference with actual file counts to detect caching issues.
