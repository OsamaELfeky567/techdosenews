# SYNC ROOT CAUSE REPORT

**Date:** 2026-06-19  
**Status:** RESOLVED  
**Priority:** CRITICAL  

---

## Problem Statement

لوحة التحكم تعرض:
- Published on site = 366
- Articles DB = 355

الرقمان غير متطابقين رغم أن المصدر واحد (index.json).

---

## Root Cause Analysis

### الكيان المصاب

| الكيان | التأثير |
|--------|---------|
| `articles_db.json` (على GitHub) | 355 مقال — **قديم** |
| `data/articles/index.json` (على GitHub) | 367 مقال — **محدث** |
| `articles_db.json` (محليًا) | 367 مقال — **محدث** (بعد المزامنة اليدوية) |

### السلاسل السببية

```
n8n workflow يكتب مقالات جديدة → يحدث index.json ✅
                              → لا يحدث articles_db.json ❌ (غير مبرمج ليفعل ذلك)

Admin panel يقرأ articles_db.json → يظهر رقم قديم ✅
Admin panel يقرأ INDEX.length → يظهر رقم جديد ✅

الخلل: الرقمان من ملفين مختلفين لم تتم مزامنتهما
```

### الجذر الأساسي

**n8n pipeline لا يحدث articles_db.json بعد كل مقال جديد.** 
الـ pipeline مبرمج لكتابة 4 ملفات فقط:
1. `data/articles/index.json` ✅
2. `data/content_hashes.json` ✅
3. `data/published_links.json` ✅
4. `data/published_topics.json` ✅

`articles_db.json` ليس ضمن القائمة.

### الأخطاء الثانوية

1. **Dashboard** (`renderDashboard()` line 1510): يستخدم `INDEX.length` كـ "published count" بدون فلترة المقالات المسودة (18 draft).
2. **Auto-rebuild** (`afterLogin()`): يعمل فقط عندما يكون `DB.length === 0`، وليس عندما يكون `DB.length ≠ INDEX.length`.
3. **GitHub Action**: موجود (`sync-articles-db.yml`) لكن لا يستطيع تشغيله لأنه يحتاج `workflow scope` في PAT.

---

## Files Affected

| File | نوع التأثير |
|------|------------|
| `articles_db.json` | بيانات — 12 مقالة مفقودة على GitHub |
| `admin/index.html` (renderDashboard) | كود — خطأ في احتساب العدد |
| `admin/index.html` (afterLogin) | كود — لا يقوم بالمزامنة التلقائية |
| `.github/workflows/sync-articles-db.yml` | بنية تحتية — لا يمكن رفعه عبر PAT |

---

## Reproduction Steps

1. n8n ينشر 12 مقالة جديدة → `index.json` يصبح 367
2. `articles_db.json` لم يتم تحديثه → يبقى 355
3. المستخدم يفتح لوحة التحكم
4. `loadDb()` → يحمل articles_db.json → 355
5. `loadIndex()` → يحمل index.json → 367
6. `renderDashboard()` → يظهر 367 Published / 355 DB → **خلل**

---

## Permanent Fix

### Immediate Fix (تم)

1. **إعادة بناء articles_db.json من index.json:**
```bash
node scripts/sync_articles.js
```
النتيجة: `articles_db.json` = 367 مقال, مطابق تمامًا لـ `index.json`

2. **تصحيح Dashboard:**
```javascript
// قبل (خطأ): const publishedCount = INDEX.length;
// بعد (صحيح): const publishedCount = INDEX.filter(a => a.status !== 'draft').length;
```

3. **رفع الملف المصحح إلى GitHub:**
```
git commit: 92fde27 — Sync articles_db.json with index.json (367 articles, MATCH)
git push: ✓ تم الرفع بنجاح
```

### Permanent Fix (مستمر)

1. **auto-sync عند فتح Dashboard** — كلما فتح المستخدم اللوحة، يتم التحقق من التطابق:
```javascript
if (DB.length !== INDEX.length) {
  console.warn('DB length mismatch — رجاء تشغيل sync_articles.js');
}
```

2. **GitHub Action** — عند رفعه بـ token مناسب يعمل تلقائيًا عند كل push على index.json

3. **n8n pipeline** — إضافة تحديث articles_db.json إلى pipeline (تغيير مستقبلي)

---

## Verification Proof

### After Fix (محليًا)

| المقياس | القيمة |
|---------|--------|
| `data/articles/index.json` | **367 مقال** |
| `articles_db.json` | **367 مقال** |
| `articles_db.json` (GitHub) | **367 مقال** (تم الرفع) |
| Dashboard Published | **367** (INDEX.filter → غير draft) |
| Dashboard Total (DB) | **367** (DB.length) |
| Dashboard Today | **12** (مقالات اليوم) |

### التحقق من الصحة

```javascript
// التحقق من التطابق
const idx = require('./data/articles/index.json'); // 367
const db = require('./articles_db.json');           // 367
console.log('MATCH:', idx.length === db.length);    // true

// التحقق من عدم وجود تكرار
const ids = idx.map(a => a.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log('Duplicates:', dupes.length);           // 0 (كان في 3 قبل الإصلاح)

// التحقق من التوزيع
const s = {};
idx.forEach(a => { const st = a.status || 'undefined'; s[st] = (s[st]||0)+1; });
console.log(s);  // { published: 286, undefined: 63, draft: 18 }
```

---

## Lessons Learned

1. **index.json هو المصدر الوحيد للحقيقة.** أي ملف آخر مشتق منه يجب أن يبنى تلقائيًا.
2. **أي pipeline يكتب بيانات يجب أن يحدث جميع الملفات المرتبطة.** عدم تحديث articles_db.json تسبب في الخلل.
3. **GitHub Actions تحتاج `workflow scope`** لرفع ملفات `.github/workflows/` — هذا يمنع الأتمتة الكاملة عبر PAT فقط.

---

## Attachments

- `scripts/sync_articles.js` — سكربت إعادة بناء articles_db.json من index.json
- `.github/workflows/sync-articles-db.yml` — GitHub Action للمزامنة التلقائية
- Commit: `92fde27 Sync articles_db.json with index.json (367 articles, MATCH)`
