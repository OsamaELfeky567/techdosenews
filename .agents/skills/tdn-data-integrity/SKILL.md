---
name: tdn-data-integrity
description: "Data integrity verification for Tech Dose News — compare files, detect drift, validate article counts"
---

# Data Integrity Skill

## Core Principle

**`data/articles/index.json` is the single source of truth.**

## Integrity Checks

### Check 1: No Duplicate IDs
```javascript
const idx = require('./data/articles/index.json');
const ids = idx.map(a => a.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log('Duplicate IDs:', dupes.length ? dupes : 'None');
```

### Check 2: Status Distribution
```javascript
const s = {};
idx.forEach(a => { const st = a.status || 'undefined'; s[st] = (s[st]||0)+1; });
console.log(s);
```

### Check 3: All Articles Have Required Fields
Verify every article has: `id`, `slug`, `title_ar`, `category`, `tags`, `image_url`, `date`, `canonicalUrl`
