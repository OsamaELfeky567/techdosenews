# TDN CATEGORY MIGRATION PLAN

**Date:** 2026-06-18  
**Status:** PLANNED  
**Priority:** High (after cleanup)

---

## 1. PROBLEM STATEMENT

The codebase has **3 independent category systems** that are out of sync:

| Source | Categories | Location | Status |
|--------|-----------|----------|--------|
| Admin CATEGORIES | 11 canonical | `admin/index.html:521-533` | ✅ Most complete, authoritative |
| `data/categories.json` | 7 legacy | `data/categories.json` | ⚠️ Missing: programming, space, science, startups, gaming, reviews. Has: egypt, electronics, phones (merge with mobile) |
| `script.js` CATEGORY_MAP | ~15 keys → ~6 display names | `script.js:59-75` | ⚠️ Incomplete mapping; display names mismatch admin |

**Impact:** Articles created/edited in admin use the 11-category system, but frontend (script.js) may not display all categories correctly and `data/categories.json` has stale data.

---

## 2. TARGET: SINGLE AUTHORITATIVE REGISTRY

The **admin's CATEGORIES array** is the canonical source:

| ID | Arabic Name | Color | Notes |
|----|-------------|-------|-------|
| `ai` | الذكاء الاصطناعي | `#8E44AD` | Merge with legacy `AI` |
| `cybersecurity` | أمن سيبراني | `#C0392B` | Merge with legacy `security`, `الأمن السيبراني` |
| `programming` | برمجة | `#2E86C1` | **New** — no legacy equivalent |
| `mobile` | موبايل | `#1B4F72` | Merge with legacy `phones`, `هواتف ذكية` |
| `hardware` | هاردوير | `#27AE60` | Merge with legacy `electronics`, `إلكترونيات` |
| `space` | فضاء | `#1A237E` | **New** — no legacy equivalent |
| `science` | علوم | `#00897B` | **New** — merge with legacy `science`→`ai` mapping |
| `business-tech` | شركات التقنية | `#F39C12` | Merge with legacy `companies`, `شركات`, `Big-Tech` |
| `startups` | شركات ناشئة | `#FF6F00` | **New** — split from `companies` |
| `gaming` | ألعاب | `#6A1B9A` | **New** — split from `mobile` |
| `reviews` | مراجعات | `#E65100` | **New** — no legacy equivalent |

**Legacy categories being replaced:**
- `egypt` → `ai` (fallback — or drop, no articles use it in admin)
- `electronics` → `hardware`
- `ev` → `business-tech` (or keep as alias for `business-tech`)
- `phones` → `mobile`
- `security` → `cybersecurity`

---

## 3. MIGRATION STEPS

### Step 1: Sync `data/categories.json` with admin registry

Replace the 7-entry file with the 11-entry canonical list, preserving keyword arrays:

```json
[
  {"id":"ai","name":"الذكاء الاصطناعي","keywords":["ai","artificial intelligence","llm","gpt","openai","deep learning","machine learning"]},
  {"id":"cybersecurity","name":"أمن سيبراني","keywords":["cybersecurity","security","vulnerability","hack","breach","malware","ransomware"]},
  {"id":"programming","name":"برمجة","keywords":["programming","coding","developer","software","api","github","dev"]},
  {"id":"mobile","name":"موبايل","keywords":["smartphone","iphone","galaxy","pixel","mobile","ios","android"]},
  {"id":"hardware","name":"هاردوير","keywords":["chip","processor","gpu","cpu","hardware","gadget","laptop","tablet"]},
  {"id":"space","name":"فضاء","keywords":["space","nasa","spacex","rocket","satellite","mars","moon","starship"]},
  {"id":"science","name":"علوم","keywords":["science","research","physics","biology","quantum","nasa","discovery"]},
  {"id":"business-tech","name":"شركات التقنية","keywords":["tech company","acquisition","ipo","funding","google","apple","microsoft","meta","amazon","nvidia"]},
  {"id":"startups","name":"شركات ناشئة","keywords":["startup","venture capital","funding","founder","seed","series a"]},
  {"id":"gaming","name":"ألعاب","keywords":["gaming","playstation","xbox","nintendo","game","esports","console"]},
  {"id":"reviews","name":"مراجعات","keywords":["review","unboxing","hands-on","benchmark","comparison","vs"]}
]
```

**Add EV keywords** to `business-tech`: `["ev","electric vehicle","self-driving","autonomous","tesla"]`

### Step 2: Update `script.js` CATEGORY_MAP

Rewrite to map all legacy keys to the 11 canonical IDs:

```javascript
const CATEGORY_MAP = {
  // Canonical IDs → Arabic names (mirrors admin registry)
  ai:'الذكاء الاصطناعي', cybersecurity:'أمن سيبراني',
  programming:'برمجة', mobile:'موبايل',
  hardware:'هاردوير', space:'فضاء',
  science:'علوم', 'business-tech':'شركات التقنية',
  startups:'شركات ناشئة', gaming:'ألعاب', reviews:'مراجعات',
  // Legacy keys → canonical Arabic names
  companies:'شركات التقنية', business:'شركات التقنية',
  bigtech:'شركات التقنية', BigTech:'شركات التقنية',
  'Big-Tech':'شركات التقنية', 'big-tech':'شركات التقنية',
  software:'برمجة', cloud:'شركات التقنية',
  security:'أمن سيبراني', Security:'أمن سيبراني',
  ev:'شركات التقنية', EV:'شركات التقنية', 'Electric Vehicles':'شركات التقنية',
  phones:'موبايل', consumer:'موبايل',
  electronics:'هاردوير', hardware:'هاردوير',
  gaming:'ألعاب', Gaming:'ألعاب',
  Science:'علوم', science:'علوم',
  AI:'الذكاء الاصطناعي', AI_ar:'الذكاء الاصطناعي',
  // Legacy Arabic name → canonical Arabic name
  'تكنولوجيا':'شركات التقنية', 'تقنية':'شركات التقنية',
  'شركات تقنية':'شركات التقنية', 'الأمن السيبراني':'أمن سيبراني',
  'تطوير':'برمجة',
  // Backward compat for articles with Arabic category stored in data
  'الذكاء الاصطناعي':'الذكاء الاصطناعي',
  'أمن سيبراني':'أمن سيبراني', 'برمجة':'برمجة',
  'موبايل':'موبايل', 'هاردوير':'هاردوير',
  'فضاء':'فضاء', 'علوم':'علوم',
  'شركات التقنية':'شركات التقنية', 'شركات ناشئة':'شركات ناشئة',
  'ألعاب':'ألعاب', 'مراجعات':'مراجعات'
};
```

### Step 3: Update `script.js` TAG_CATEGORY_MAP

Map tags to canonical IDs:

```javascript
const TAG_CATEGORY_MAP = {
  'تكنولوجيا':'business-tech', 'تقنية':'business-tech',
  'ذكاء اصطناعي':'ai', 'ai':'ai', 'AI':'ai',
  'أمن سيبراني':'cybersecurity', 'أمان':'cybersecurity',
  'security':'cybersecurity', 'Security':'cybersecurity',
  'cybersecurity':'cybersecurity',
  'هواتف':'mobile', 'mobile':'mobile', 'Mobile':'mobile',
  'أعمال':'business-tech', 'business':'business-tech',
  'Business':'business-tech',
  'شركات':'business-tech', 'startups':'startups',
  'Startups':'startups',
  'برمجيات':'programming', 'software':'programming',
  'برمجة':'programming',
  'سحابة':'business-tech', 'cloud':'business-tech',
  'عتاد':'hardware', 'hardware':'hardware',
  'سيارات':'business-tech', 'EV':'business-tech',
  'ev':'business-tech', 'سيارات كهربائية':'business-tech',
  'gaming':'gaming', 'Gaming':'gaming', 'ألعاب':'gaming',
  'science':'science', 'Science':'science', 'علوم':'science',
  'روبوتات':'ai', 'robotics':'ai', 'فضاء':'space',
  'bigtech':'business-tech', 'big-tech':'business-tech',
  'BigTech':'business-tech', 'Big-Tech':'business-tech',
  'أبحاث':'science', 'research':'science'
};
```

### Step 4: Migrate article categories in `data/articles/index.json`

For every article in `data/articles/index.json`, map legacy `category` values to canonical IDs:

```javascript
const legacyToCanonical = {
  // Old category keys → new canonical IDs
  'companies':'business-tech',
  'business':'business-tech',
  'bigtech':'business-tech',
  'BigTech':'business-tech',
  'big-tech':'business-tech',
  'Big-Tech':'business-tech',
  'security':'cybersecurity',
  'Security':'cybersecurity',
  'ev':'business-tech',
  'EV':'business-tech',
  'phones':'mobile',
  'electronics':'hardware',
  'egypt':'ai',        // fallback — no direct equivalent
  'AI':'ai',
  'Science':'science',
  'Gaming':'gaming',
  'gaming':'gaming',
  'Mobile':'mobile',
  'Hardware':'hardware',
  // Arabic categoryAr values → canonical IDs
  'التقنية':'ai',      // generic → ai fallback
  'عام':'ai',          // generic → ai fallback
  'شركات':'business-tech',
  'هواتف ذكية':'mobile',
  'سيارات كهربائية':'business-tech',
  'تطوير':'programming',
};
```

### Step 5: Add category colors to `admin_config.json`

Optionally, make category colors configurable via `admin_config.json` so frontend can read them dynamically:

```json
{
  "catColors": {
    "الذكاء الاصطناعي": "#8E44AD",
    "أمن سيبراني": "#C0392B",
    ...
  }
}
```

---

## 4. MIGRATION ORDER

| Order | Task | Files Affected | Risk |
|-------|------|---------------|------|
| 1 | Update `data/categories.json` | 1 file | Low — data only, no code change |
| 2 | Update `script.js` CATEGORY_MAP | 1 file | Medium — display names change on frontend |
| 3 | Update `script.js` TAG_CATEGORY_MAP | 1 file | Medium — category routing changes |
| 4 | Migrate articles in `data/articles/index.json` | 1 file | High — 333 articles, potential data corruption |
| 5 | Verify frontend rendering | Browser test | Medium — visual check |
| 6 | Verify admin category display | Browser test | Medium — visual check |
| 7 | Verify category.html filtering | Browser test | Medium — functional check |

---

## 5. ROLLBACK PLAN

If migration breaks category display:

1. Revert `script.js` CATEGORY_MAP and TAG_CATEGORY_MAP to current state
2. Restore `data/categories.json` from git
3. Restore `data/articles/index.json` from git (`git checkout -- data/articles/index.json`)
4. All changes are reversible via `git checkout` — no schema changes

---

## 6. VERIFICATION CHECKLIST

After migration:
- [ ] Frontend homepage displays articles with correct Arabic category names
- [ ] Category chips in sidebar show all 11 categories
- [ ] `category.html?cat=programming` loads programming articles
- [ ] `category.html?cat=space` loads space articles
- [ ] `category.html?cat=startups` loads startup articles
- [ ] Article page shows correct category badge and link
- [ ] Admin categories page shows 11 categories with correct colors
- [ ] `data/categories.json` has 11 entries matching admin registry
- [ ] 0 console errors in browser
- [ ] 0 404 network errors

---

*End of Report — Tech Dose News Category Migration Plan*
