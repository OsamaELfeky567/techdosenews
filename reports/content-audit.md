# Content Audit — Phase 8A

**Date:** 2026-07-04
**Source:** `data/articles/index.json` (GitHub remote)

---

## Summary

| Metric | Value |
|--------|-------|
| Total Articles | 37 |
| Published | 37 |
| Draft | 0 |
| Archived | 0 |
| Hidden | 0 |
| Duplicate IDs | 0 |
| Duplicate Slugs | 0 |
| Duplicate Titles | 1 ("إيران ترد على البيان المشترك" ×2) |
| Average Word Count | 221.3 |
| Average Reading Time | 1.1 min |

---

## Issues Found

### 1. Duplicate Titles
- `art-1782469820154-27yzm4` — "إيران ترد على البيان المشترك"
- `art-1782468020319-ux8ir7` — "إيران ترد على البيان المشترك"

### 2. Empty Slugs (Missing seo_slug)
_14 articles have empty slugs — all from the June 26-28 batch:_

| ID | Title | Date |
|----|-------|------|
| art-1782662429368-k8h9dj | لماذا يعتقد وول ستريت أن شركة ميكرون الأمريكية... | 2026-06-28 |
| art-1782648398720-gisbhi | لماذا ترتدي أي شيء آخر غير هودي الشمس... | 2026-06-28 |
| art-1782648294337-ruj8z5 | الفرق بين الغني والفقير | 2026-06-28 |
| art-1782648275087-nshiyw | سيارة كهربائية فاخرة | 2026-06-28 |
| art-1782648262971-on44bq | نست تهدف إلى إصلاح جهاز التحكم في درجة الحرارة | 2026-06-28 |
| art-1782648250303-nr3tyc | دفع رقمي ذكاء اصطناعي | 2026-06-28 |
| art-1782648237835-oc01ih | جوجل تحد من استخدام ميتا لذكاء اصطناعي جيميني | 2026-06-28 |
| art-1782648200129-q10hz6 | سوريا وحزب الله | 2026-06-28 |
| art-1782475220805-jtvj6o | تطبيق في كوريا الجنوبية لحماية النساء من الملاحقة... | 2026-06-26 |
| art-1782473438169-ql6t3n | أدوات ذكاء اصطناعي فريدة | 2026-06-26 |
| art-1782473420219-v9qp6m | إيران تصف البيان المشترك... | 2026-06-26 |
| art-1782460824114-7151re | شركة باين تعلن عن شراكة مع جوجل كلاود | 2026-06-26 |
| art-1782459991856-2j80y7 | البيت الأبيض يطلب من OpenAI إبطاء إطلاق نموذجها الجديد | 2026-06-26 |
| art-1782446425138-d5gebv | جوجل تطور أدوات ذكاء اصطناعي | 2026-06-26 |

### 3. Very Thin Articles (< 100 words)

| ID | Title | Words |
|----|-------|-------|
| art-1782473420219-v9qp6m | إيران تصف البيان المشترك... | 27 |
| art-1782444620332-l0yi0q | الأمم المتحدة تعلق إجلاء البحارة... | 29 |
| art-1782475220805-jtvj6o | تطبيق في كوريا الجنوبية... | 33 |
| art-1782662429368-k8h9dj | لماذا يعتقد وول ستريت... | 53 |
| art-1782829609967-gl611i | 6 مميزات مفيدة في iOS 27... | 59 |
| art-1782648398720-gisbhi | لماذا ترتدي أي شيء آخر... | 67 |
| art-1782648294337-ruj8z5 | الفرق بين الغني والفقير | 77 |

### 4. Placeholder Tags
- `art-1783074620829-roxois` — Tags: `["تاغ ذو صلة", "تاغ ثاني", "تاغ ثالث"]`

### 5. Non-Tech Articles (category = null, non-tech content)
_These appear to be RSS scraps that slipped through:_

| ID | Title | Source | Category |
|----|-------|--------|----------|
| art-1782648294337-ruj8z5 | الفرق بين الغني والفقير | WIRED | null |
| art-1782648275087-nshiyw | سيارة كهربائية فاخرة | Ars Technica | null |
| art-1782648262971-on44bq | نست تهدف إلى إصلاح جهاز التحكم في درجة الحرارة | The Verge | null |
| art-1782648200129-q10hz6 | سوريا وحزب الله | BBC Arabic | null |
| art-1782473420219-v9qp6m | إيران تصف البيان المشترك... | BBC Arabic | null |
| art-1782469820154-27yzm4 | إيران ترد على البيان المشترك | BBC Arabic | null |
| art-1782468020319-ux8ir7 | إيران ترد على البيان المشترك | BBC Arabic | null |
| art-1782459970826-swtw2h | دعوة الأمم المتحدة لاعتماد نظام تحقق نووي... | BBC Arabic | null |
| art-1782444620332-l0yi0q | الأمم المتحدة تعلق إجلاء البحارة... | BBC Arabic | null |

### 6. Missing SEO Metadata (old articles)
14 articles from June 26-28 have `seo_title`, `meta_description`, `focus_keyword`, and `canonical` all null.

### 7. Image Sources
- 22 articles use `arabhardware.net` images (RSS enclosure)
- 10+ articles use generic `pexels.com` stock photos
- 1 article uses `images.unsplash.com`
- No articles use official GitHub-persisted images

### 8. Missing Internal Links
- 9 articles have 0 internal links (all old batch)
- 0 articles have internalLinksCount > 6

### 9. Single-Paragraph Articles
- 20 articles have `bodyParagraphs === 1` (text not split by `\n\n`)
- These are likely old-format articles where body was stored differently

---

## Per-Article Inventory

_(see attached JSON data — 37 articles analyzed individually)_
