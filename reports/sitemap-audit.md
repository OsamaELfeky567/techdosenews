# Sitemap Audit — Phase 8A

**Date:** 2026-07-04

---

## Sources Compared

| Source | URL Count |
|--------|-----------|
| `data/articles/index.json` | 37 articles |
| `sitemap.xml` | 18 URLs (10 static + 8 article) |
| `rss.xml` | 11 articles |
| Live (GitHub Pages) | N/A |

---

## Missing from Sitemap (29 articles not in sitemap.xml)

_Only 8 of 37 articles are in sitemap.xml. The following are MISSING:_

| # | Article Title | Date |
|---|--------------|------|
| 1 | ثغرة آيفون تفضح بريدك الإلكتروني المخفي | 2026-07-03 |
| 2 | تسريبات: أداء شريحة Kirin 2026 Pro الجديدة | 2026-06-30 |
| 3 | تحديث iOS 26.5.2: آبل تحذر من 25 ثغرة | 2026-06-30 |
| 4 | هاتف iPhone Ultra القابل للطي | 2026-06-30 |
| 5 | تطبيق OpenClaw يصل إلى هواتف آيفون وأندرويد | 2026-06-30 |
| 6 | حجز اسم المستخدم في واتساب | 2026-06-30 |
| 7 | OpenAI سرقت مهندس نظارات آبل | 2026-06-30 |
| 8 | DLSS في يونيو | 2026-06-30 |
| 9 | آبل تتخلى عن رقاقة M6 Pro/Max | 2026-06-30 |
| 10 | دعوى قضائية ضد سامسونغ | 2026-06-30 |
| 11 | سوني في مأزق: PS6 | 2026-06-30 |
| 12 | PlayStation 6: تجربة لعب متنقلة | 2026-06-30 |
| 13 | 6 مميزات مفيدة في iOS 27 | 2026-06-30 |
| 14 | Xiaomi 18 Pro Max | 2026-06-30 |
| 15 | Valve تُجبر dbrand على سحب غطاء الحماية | 2026-06-30 |
| 16 | لماذا يعتقد وول ستريت أن ميكرون هي النڤيديا التالية | 2026-06-28 |
| 17 | لماذا ترتدي أي شيء آخر غير هودي الشمس | 2026-06-28 |
| 18 | الفرق بين الغني والفقير | 2026-06-28 |
| 19 | سيارة كهربائية فاخرة | 2026-06-28 |
| 20 | نست تهدف إلى إصلاح جهاز التحكم في درجة الحرارة | 2026-06-28 |
| 21 | دفع رقمي ذكاء اصطناعي | 2026-06-28 |
| 22 | جوجل تحد من استخدام ميتا لذكاء اصطناعي جيميني | 2026-06-28 |
| 23 | سوريا وحزب الله | 2026-06-28 |
| 24 | تطبيق في كوريا الجنوبية | 2026-06-26 |
| 25 | أدوات ذكاء اصطناعي فريدة | 2026-06-26 |
| 26 | إيران تصف البيان المشترك | 2026-06-26 |
| 27 | إيران ترد على البيان المشترك (×2) | 2026-06-26 |
| 28 | شركة باين تعلن عن شراكة مع جوجل كلاود | 2026-06-26 |
| 29 | البيت الأبيض يطلب من OpenAI | 2026-06-26 |

**Total missing: 29 out of 37 articles** (78% not in sitemap)

---

## Missing from RSS (26 articles not in rss.xml)

_Only 11 of 37 articles are in RSS. Same list as above minus the 11 that ARE in RSS._

**Articles in RSS:** All 11 are from the June 26 batch (the oldest articles).

---

## Sitemap Has These Static Pages:
- `/` (homepage)
- `/about.html`
- `/contact.html`
- `/privacy.html`
- `/terms.html`
- `/disclaimer.html`
- `/editorial-policy.html`

---

## Issues

1. **sitemap.xml is severely outdated** — only contains 8 of 37 articles. Last updated 2026-06-26.
2. **rss.xml is also outdated** — only contains 11 of 37 articles.
3. **No articles from June 28 - July 3 appear in sitemap or RSS.**
4. **The CI/CD workflow** (`auto-publish.yml`) is supposed to regenerate sitemap and RSS on push to `data/articles/index.json`, but it's clearly not running or failing silently.
5. **No canonical URLs** on any articles (canonical field is null for all).
