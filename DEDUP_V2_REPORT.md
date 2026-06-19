# DEDUP V2 REPORT

**Date:** 2026-06-19  
**Status:** ANALYSIS COMPLETE  
**Priority:** HIGH  

---

## Current Dedup Logic (V1)

### Location
n8n Code node — `production_workflow.json` (Code: "TDN Lite v2 Pipeline")

### Algorithm

```javascript
function contentHash(str) {
  // 1. Arabic normalization: remove tashkeel, normalize Alef variants (أ إ آ → ا),
  //    normalize Teh Marbuta (ة → ه), remove non-alphanumeric
  // 2. Concatenate: title + description.substring(0, 100)
  // 3. Simple string hash
}
```

### Storage
`data/content_hashes.json` — Array of hash strings, capped at 10,000

### Execution Flow
```
Fetch RSS → Parse items
For each item:
  → Hash = contentHash(item.title + item.description[0:100])
  → If hash EXISTS in content_hashes.json → SKIP
  → If hash NOT in content_hashes.json → Process (AI translate, publish, add hash)
```

---

## Current Problems

### PROBLEM 1: published_links.json is DEAD CODE

| الملف | يكتب؟ | يقرأ؟ |
|-------|-------|-------|
| `content_hashes.json` | ✅ نعم | ✅ نعم |
| `published_links.json` | ✅ نعم | ❌ **لا** |

**التأثير:** نفس رابط المصدر يمكن نشره بعناوين مختلفة ← تكرار

**مثال حقيقي:**
```
Execution 1795: "HSBC توسع شراكة البنوك الذكية مع Google Cloud" ← نفس الرابط
Execution 1798: "إتش إس بي سي وغوغل أيه آي..." ← نفس الرابط، عنوان مختلف
```
المقالتان لهما نفس المصدر ولكن عناوين مختلفة ← الـ hash مختلف ← لا يتم اكتشاف التكرار.

### PROBLEM 2: Hash على title + description فقط

الـ hash لا يشمل:
- ❌ رابط المصدر (`source_link`)
- ❌ معرف المقال (`id`)
- ❌ التاريخ

**التأثير:** لو Groq أنتج عنوانين مختلفين لنفس الخبر (شائع مع الـ LLM)، المقال سينشر مرتين.

### PROBLEM 3: الـ hash غير مقيد بالرابط

حاليًا لو نفس الخبر من مصدرين مختلفين، سينشر مرتين وهذا مقبول.
لكن لو نفس المصدر بالضبط (نفس URL) بعنوانين مختلفين، هذا خطأ.

---

## False Positive Analysis

| السيناريو | الحالي (V1) | الصحيح |
|-----------|------------|--------|
| نفس العنوان + نفس الوصف | ✅ يمنع | ✅ يمنع |
| نفس الرابط + عنوان مختلف | ❌ لا يمنع | ✅ يجب أن يمنع |
| رابط مختلف + نفس الموضوع | ✅ يسمح (مقبول) | ✅ يسمح (مقبول) |
| Groq ينتج عنوانًا مختلفًا لنفس الخبر | ❌ لا يمنع | ✅ يجب أن يمنع |

**الإجمالي:** False Positive Rate الحالي = 1 من 367 (0.27%)

---

## New Dedup V2 Design

### Three-Layer Architecture

```
طبقة 1 — URL Check (جديدة)
  → أسرع: مجرد مقارنة source_link
  → المخزن: published_links.json
  → إذا وُجد → SKIP فوري

طبقة 2 — Hash Check (موجودة)
  → contentHash(title + description[0:100])
  → المخزن: content_hashes.json
  → إذا وُجد → SKIP

طبقة 3 — Semantic Check (مستقبلية)
  → مقارنة title بعد تطبيع Arabic
  → إذا أكثر من 70% تشابه → SKIP
```

### Priority Flow

```
RSS Item arrives
  ↓
[URL Check] → source_link موجود في published_links.json؟
  ├── نعم → SKIP 🚫
  └── لا → [Hash Check]
              ↓
         contentHash موجود في content_hashes.json؟
          ├── نعم → SKIP 🚫
          └── لا → PROCESS ✅ (AI translate, publish, add to both)
```

### Storage Updates

| الملف | قبل | بعد |
|-------|-----|-----|
| `content_hashes.json` | يُكتب ويُقرأ | يُكتب ويُقرأ (نفسه) |
| `published_links.json` | يُكتب فقط | **يُكتب ويُقرأ** (جديد) |

---

## False Negative Reduction

| السيناريو | V1 | V2 |
|-----------|----|----|
| نفس الرابط + عنوان مختلف | ❌ مسموح | ✅ ممنوع |
| نفس الرابط + Groq variation | ❌ مسموح | ✅ ممنوع |
| خراب Groq في العنوان | ❌ مسموح | ✅ ممنوع |
| خبر واحد من مصدرين | ✅ مسموح (صحيح) | ✅ مسموح (صحيح) |
| رابط مقطوع/ناقص | ✅ مسموح (صحيح) | ✅ مسموح (صحيح) |

**Estimated improvement:** False positive reduction from 1:367 to ~0:367
**URL collision risk:** Negligible (same source_link = same story)

---

## Implementation Requirements

### Code Node Changes

```javascript
// V2 Dedup — Three-Layer
async function isDuplicate(item) {
  // Layer 1: URL check
  if (item.source_link && publishedLinks.includes(item.source_link)) {
    stats.all_duplicates++;  // Track as URL duplicate
    return true;
  }
  
  // Layer 2: Hash check (existing)
  const hash = contentHash(item.title + (item.description || '').substring(0, 100));
  if (contentHashes.includes(hash)) {
    stats.all_duplicates++;
    return true;
  }
  
  // Not a duplicate
  return false;
}
```

### published_links.json Format Change

**باقي كما هو** — مصفوفة من strings (الروابط):

```json
[
  "https://techcrunch.com/2026/06/19/example-1",
  "https://venturebeat.com/2026/06/19/example-2",
  ...
]
```

### Hash Store Size

زيادة طفيفة فقط — كل رابط + hash = زوج واحد.
الحد الأقصى 10,000 زوج (مثل V1).

---

## Risk Assessment

| الخطر | الاحتمال | التأثير | التعامل |
|-------|---------|---------|---------|
| URL مكرر يمنع خبر مختلف | منخفض جدًا | منخفض | نادرًا ما يحدث (subdomain مختلف = URL مختلف) |
| published_links.json به خطأ | منخفض | مرتفع | Rollback في GitHub PUT |
| زيادة وقت المعالجة | منخفض | منخفض | مقارنة URL أسرع من hash |

**الخلاصة:** V2 آمن للتطبيق ولا يحمل مخاطر تذكر.

---

## Current V1 Scores

| المقياس | القيمة |
|---------|--------|
| Total articles | 367 |
| False negatives (URL dupes) | 1 |
| False positives | 0 |
| Dedup coverage | 99.7% |
| published_links.json usage | 0% (DEAD CODE) |
