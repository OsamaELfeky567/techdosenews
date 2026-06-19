# RSS SOURCE EXPANSION REPORT

**Date:** 2026-06-19  
**Status:** RESEARCH COMPLETE — Pending workflow update  
**Channels identified:** 18  
**Working feeds:** 17/18  

---

## Current Feed Architecture

**حاليًا:** مصدر واحد فقط:
```
Google News RSS (English, US, tech keywords)
https://news.google.com/rss/search?q=(OpenAI|Google AI|... )&hl=en-US&gl=US&ceid=US:en
```

**المشكلة:** 
- إنجليزي فقط
- أمريكي فقط
- AI/tech keywords فقط
- لا يغطي: الأمن السيبراني، الموبايلات، السيارات الكهربائية، المحتوى العربي

---

## Verified Feed Channels

### AI (ذكاء اصطناعي) — 3 مصادر

| المصدر | الرابط | الحالة | اللغة | التغطية |
|--------|--------|--------|-------|---------|
| Google News AI Arabic | `https://news.google.com/rss/search?q=الذكاء+الاصطناعي&hl=ar&gl=SA&ceid=SA:ar` | ✅ يعمل | عربي | 100 خبر |
| VentureBeat AI | `https://venturebeat.com/category/ai/feed` | ✅ يعمل | إنجليزي | 7-20 خبر |
| The Decoder | `https://the-decoder.com/feed/` | ✅ يعمل | إنجليزي | 10-15 خبر |

### Cybersecurity (أمن سيبراني) — 3 مصادر

| المصدر | الرابط | الحالة | اللغة | التغطية |
|--------|--------|--------|-------|---------|
| The Hacker News | `https://feeds.feedburner.com/TheHackersNews` | ✅ يعمل | إنجليزي | 50 خبر |
| BleepingComputer | `https://www.bleepingcomputer.com/feed/` | ✅ يعمل | إنجليزي | 15 خبر |
| SecurityWeek | `https://www.securityweek.com/feed/` | ✅ يعمل | إنجليزي | 10 خبر |

⚠️ **ملاحظة:** SecurityWeek عبر FeedBurner (`feeds.feedburner.com/Securityweek`) يعطي 403. استخدم الرابط المباشر.

### Companies (شركات) — 2 مصادر

| المصدر | الرابط | الحالة | اللغة | التغطية |
|--------|--------|--------|-------|---------|
| TechCrunch | `https://techcrunch.com/feed/` | ✅ يعمل | إنجليزي | 20 خبر |
| Wired Business | `https://www.wired.com/feed/business/rss` | ✅ يعمل | إنجليزي | 20 خبر |

❌ **The Verge Business:** لا يوجد RSS مخصص للـ Business. استخدم الـ main feed بدلاً منه.

### Phones (هواتف) — 3 مصادر

| المصدر | الرابط | الحالة | اللغة | التغطية |
|--------|--------|--------|-------|---------|
| GSMArena | `https://www.gsmarena.com/rss-news-reviews.php3` | ✅ يعمل | إنجليزي | 20 خبر |
| Android Authority | `https://www.androidauthority.com/feed/` | ✅ يعمل | إنجليزي | 80 خبر |
| 9to5Google | `https://9to5google.com/feed/` | ✅ يعمل | إنجليزي | 100 خبر |

⚠️ **ملاحظة:** GSMArena يستخدم `.php3` وليس `.php`

### Electric Vehicles (سيارات كهربائية) — 3 مصادر

| المصدر | الرابط | الحالة | اللغة | التغطية |
|--------|--------|--------|-------|---------|
| Electrek | `https://electrek.co/feed/` | ✅ يعمل | إنجليزي | 100 خبر |
| InsideEVs | `https://insideevs.com/feed/` | ✅ يعمل | إنجليزي | 20 خبر |
| CleanTechnica | `https://cleantechnica.com/feed/` | ✅ يعمل | إنجليزي | 45 خبر |

⚠️ **ملاحظة:** InsideEVs يستخدم `/feed/` وليس `/rss/`

### Arabic Regional (محتوى عربي) — 3 مصادر

| المصدر | الرابط | الحالة | اللغة | التغطية |
|--------|--------|--------|-------|---------|
| Google News Arabic Tech | `https://news.google.com/rss/search?q=تكنولوجيا&hl=ar&gl=SA&ceid=SA:ar` | ✅ يعمل | عربي | 100 خبر |
| Google News Arabic AI | `https://news.google.com/rss/search?q=ذكاء+اصطناعي&hl=ar&gl=SA&ceid=SA:ar` | ✅ يعمل | عربي | 100 خبر |
| Google News Arabic Security | `https://news.google.com/rss/search?q=أمن+سيبراني&hl=ar&gl=SA&ceid=SA:ar` | ✅ يعمل | عربي | 100 خبر |

### Regional (إقليمي) — 2 مصادر

| المصدر | الرابط | الحالة | اللغة | التغطية |
|--------|--------|--------|-------|---------|
| Google News Europe Tech | `https://news.google.com/rss/search?q=تكنولوجيا&hl=ar&gl=GB&ceid=GB:ar` | ✅ يعمل | عربي | 100 خبر |
| Google News Asia Tech | `https://news.google.com/rss/search?q=تكنولوجيا&hl=ar&gl=SG&ceid=SG:ar` | ✅ يعمل | عربي | 100 خبر |

---

## Category Mapping

| التيار | التصنيف الأساسي | الأولوية |
|--------|----------------|----------|
| المصدر الحالي (Google News EN) | ينتشر على كل التصنيفات | — |
| Google News Arabic AI | ai (ذكاء اصطناعي) | عالية |
| VentureBeat AI | ai | متوسطة |
| The Decoder | ai + companies | متوسطة |
| The Hacker News | cybersecurity | **حرجة** |
| BleepingComputer | cybersecurity | **حرجة** |
| SecurityWeek | cybersecurity | عالية |
| TechCrunch | companies | عالية |
| Wired Business | companies | متوسطة |
| GSMArena | phones | **حرجة** |
| Android Authority | phones | **حرجة** |
| 9to5Google | phones | **حرجة** |
| Electrek | ev | **حرجة** |
| InsideEVs | ev | **حرجة** |
| CleanTechnica | ev | **حرجة** |
| Google News Arabic Tech | متعدد (استراتيجي) | عالية |
| Google News Arabic AI | ai | عالية |
| Google News Arabic Security | cybersecurity | عالية |
| Google News Europe Tech | متعدد | متوسطة |
| Google News Asia Tech | متعدد | منخفضة |

---

## Expected Coverage Increase

| الفئة | الحالي | المتوقع بعد الإضافة | النمو |
|-------|--------|-------------------|-------|
| AI | 47/شهر | 80-100/شهر | +70-110% |
| Companies | 11/شهر | 30-50/شهر | +170-350% |
| Cybersecurity | 4/شهر | 40-60/شهر | **+900-1400%** |
| Phones | 2/شهر | 40-60/شهر | **+1900-2900%** |
| EV | 3/شهر | 30-50/شهر | **+900-1500%** |
| Arabic Content | غير مباشر | مباشر ومنتظم | استراتيجي |

---

## Implementation Strategy

### المرحلة 1 — المصادر الحرجة (فوري)
```
cybersecurity → The Hacker News, BleepingComputer, SecurityWeek
phones → GSMArena, Android Authority, 9to5Google
ev → Electrek, InsideEVs, CleanTechnica
```

### المرحلة 2 — المصادر العربية (أيام)
```
Google News Arabic AI → يضاعف المحتوى العربي
Google News Arabic Tech → يضمن تدفق الأخبار أثناء فترات الجفاف الأمريكي
Google News Arabic Security → يملأ فجوة الأمن السيبراني العربي
```

### المرحلة 3 — المصادر الإقليمية (أسبوع)
```
Google News Europe Tech → تنوع جغرافي
Google News Asia Tech → تغطية آسيوية
```

---

## Feed Exhaustion Analysis

**سبب جفاف التغذية الحالي:**
- مصدر واحد (Google News US)
- ساعات الليل الأمريكية (04:30-07:00 UTC) = لا أخبار جديدة
- كل 30 دقيقة يعيد نفس النتائج

**الحل:** المصادر المتعددة تكسر هذا النمط:
- المصادر العربية نشطة في الصباح الباكر بتوقيت السعودية
- المصادر الأوروبية نشطة في فترة الظهيرة
- المصادر الآسيوية تغطي فترات مختلفة تمامًا

---

## RSS Coverage Intelligence Script

A tool to analyze category coverage and recommend feeds:

**Location:** `scripts/rss-coverage-intelligence.js` (next step to create)

**Usage:**
```bash
node scripts/rss-coverage-intelligence.js
```

**Output example:**
```
📊 RSS Coverage Intelligence — Tech Dose News
=============================================
AI:         43 articles in 7 days — ✅ Strong
Companies:  29 articles in 7 days — ✅ Good
Cybersec:   11 articles in 7 days — ⚠️ Needs boost
Phones:      7 articles in 7 days — 🔴 Critical
EV:          2 articles in 7 days — 🔴 Critical

📡 Recommended feeds for weak categories:
  Cybersecurity → The Hacker News, BleepingComputer, SecurityWeek
  Phones → GSMArena, Android Authority, 9to5Google
  EV → Electrek, InsideEVs, CleanTechnica
```
