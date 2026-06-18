# TDN Category Consistency Fix Report

**Date:** 2026-06-18  
**Branch:** `admin-finalization`  

---

## Summary

Fixed 6 pre-existing category consistency errors across 6 files. No article data was modified — only category infrastructure code was updated.

---

## Fixes Applied

### Fix 1: Hardcoded Nav Links (4 files)

Old incorrect links generated URLs with non-canonical IDs:

| File | Old Link | New Link |
|------|----------|----------|
| `index.html:65` | `category.html?cat=security` | `category.html?cat=cybersecurity` |
| `index.html:66` | `category.html?cat=mobile` | `category.html?cat=phones` |
| `category.html:49` | `category.html?cat=security` | `category.html?cat=cybersecurity` |
| `category.html:50` | `category.html?cat=mobile` | `category.html?cat=phones` |
| `article.html:49` | `category.html?cat=security` | `category.html?cat=cybersecurity` |
| `article.html:50` | `category.html?cat=mobile` | `category.html?cat=phones` |
| `contact.html:35` | `category.html?cat=security` | `category.html?cat=cybersecurity` |
| `contact.html:36` | `category.html?cat=mobile` | `category.html?cat=phones` |

**Root cause:** Original HTML was authored before the 5-category canonical model was finalized. The old keys `security` and `mobile` still existed as aliases in `CATEGORY_MAP` but were not the canonical IDs.

---

### Fix 2: script.js `mainCats` Keys (3 locations)

Three functions generated category navigation chips/footer links using `mobile` as the object key instead of canonical `phones`:

| Function | Line | Key Before | Key After |
|----------|------|------------|-----------|
| `renderCategories()` | 383 | `mobile:'هواتف ذكية'` | `phones:'هواتف ذكية'` |
| `renderFooterCats()` | 413 | `mobile:'هواتف ذكية'` | `phones:'هواتف ذكية'` |
| `initCategoryPage()` | 798 | `mobile:'هواتف ذكية'` | `phones:'هواتف ذكية'` |

**Impact:** Generated `<a href="category.html?cat=mobile">` URLs changed to `?cat=phones`, matching the canonical model. No functionality change — `category.html` resolves both keys via `getCategoryKey()`.

---

### Fix 3: admin `legacyMap` Inconsistencies

The admin panel's `legacyMap` (in `getCategoryIdFromArticle()`) mapped `تكنولوجيا` and `تقنية` to `ai`, while `script.js` `CATEGORY_MAP` mapped the same strings to `شركات`. Since 285/357 articles (80%) carry `category: "تكنولوجيا"`, this caused the admin to display these articles under AI while the website showed them under Companies.

**Old mappings (admin legacyMap):**

| Legacy Value | Old Map To | Issue |
|-------------|------------|-------|
| `تكنولوجيا` | `ai` | **CONTRADICTS** script.js → `companies` |
| `تقنية` | `ai` | **CONTRADICTS** script.js → `companies` |
| `Electric Vehicles` | (missing) | Fallthrough to `ai` (wrong) |
| `EV` | (missing) | Fallthrough to `ai` (wrong) |
| `AI` | (missing) | Fallthrough to `ai` (lucky, correct) |
| `الأمن السيبراني` | (missing) | Fallthrough to `ai` (wrong) |
| `Security` | (missing) | Fallthrough to `ai` (wrong) |
| `Mobile` | (missing) | Fallthrough to `ai` (wrong) |
| `cloud` | (missing) | Fallthrough to `ai` (wrong) |
| `Big-Tech` | (missing) | Fallthrough to `ai` (wrong) |
| *English-cased variants* | (missing) | Fallthrough to `ai` (wrong) |

**New mappings (admin legacyMap):**

| Legacy Value | New Map To | Matching script.js |
|-------------|------------|-------------------|
| `تكنولوجيا` | `companies` | ✅ `CATEGORY_MAP['تكنولوجيا']` → `شركات` |
| `تقنية` | `companies` | ✅ `CATEGORY_MAP['تقنية']` → `شركات` |
| `Electric Vehicles` | `ev` | ✅ `CATEGORY_MAP['Electric Vehicles']` → `سيارات كهربائية` |
| `EV` / `ev` | `ev` | ✅ |
| `AI` / `AI_ar` | `ai` | ✅ |
| `الأمن السيبراني` | `cybersecurity` | ✅ |
| `Security` / `security` | `cybersecurity` | ✅ |
| `Mobile` / `mobile` | `phones` | ✅ |
| `cloud` / `Cloud` | `companies` | ✅ |
| `Big-Tech` / `BigTech` | `companies` | ✅ |
| + 15 more entries | (all verified) | ✅ |

**Total legacyMap entries:** 20 old → 42 new (comprehensive coverage matching `CATEGORY_MAP` + `TAG_CATEGORY_MAP`).

---

### Fix 4: `saveCategoriesToGh()` Keywords Preservation

**Problem:** The function stripped `keywords` arrays when saving:
```javascript
// OLD (data loss):
const data = CATEGORIES.map(c => ({ id: c.id, name: c.name, color: c.color }));

// NEW (keywords preserved):
const data = CATEGORIES.map(c => ({ id: c.id, name: c.name, color: c.color, keywords: c.keywords || [] }));
```

**Also fixed:**
- `getDefaultCategories()` — added `keywords` arrays to all 5 canonical categories (prevents data loss if loadCategories() fails)
- `addCatBtn` handler — new categories now include `keywords: []`

---

## Verification Results

- **Runtime tests:** 21/21 PASS (0 console errors, 0 network errors)
- **JS syntax:** Both `admin/index.html` and `script.js` pass `node --check`
- **Article data:** 357 articles untouched — all use existing legacy category values
- **Backward compatibility:** All old category values still resolve via the expanded `legacyMap` and `CATEGORY_MAP`

---

## Affected Files

| File | Lines Changed | Change Description |
|------|--------------|-------------------|
| `admin/index.html` | 20 old → 42 new entries | `legacyMap` expanded and corrected |
| `admin/index.html` | 1 line | `saveCategoriesToGh()` keywords preserved |
| `admin/index.html` | 1 line | `addCatBtn` new categories include `keywords: []` |
| `admin/index.html` | 5 lines | `getDefaultCategories()` includes `keywords` |
| `script.js` | 3 lines | `mainCats` keys: `mobile` → `phones` |
| `index.html` | 2 lines | Nav links: `security` → `cybersecurity`, `mobile` → `phones` |
| `category.html` | 2 lines | Same nav link fix |
| `article.html` | 2 lines | Same nav link fix |
| `contact.html` | 2 lines | Same nav link fix |

**Total:** 6 files, ~50 lines changed.

---

## Remaining Known Issues (Not Blocking)

1. **357 articles use legacy category strings** (e.g., `"تكنولوجيا"`, `"AI"`, `"Companies"`) — all correctly map through `legacyMap`/`CATEGORY_MAP` but canonical IDs are not stored at source.
2. **`category.html` must handle URL params with both old and new keys** — `filterCategory()` in `script.js` resolves any key via `CATEGORY_MAP[cat]`, so old bookmarks to `?cat=security` or `?cat=mobile` still work.
3. **`TAG_CATEGORY_MAP` has no entry for `'سيارات كهربائية'` (Arabic EV)** — the 1 article with this category falls through to tag-based matching, which works because its tags include `'سيارات'` or `'EV'`.

---

*End of Report*
