---
name: tdn-rss-expansion
description: "RSS source expansion for Tech Dose News — add verified feeds, map categories, increase coverage"
---

# RSS Expansion Specialist Skill

## Current Feed Architecture

The n8n pipeline uses a **single Google News RSS source**:
```
https://news.google.com/rss/search?q=(OpenAI|Google AI|Gemini|ChatGPT|... )&hl=en-US&gl=US&ceid=US:en
```

This is English-only, US-only, tech-only. Limited coverage for Arabic content, cybersecurity, phones, and EV.

## Verified Working Feeds

### AI Category
- `https://news.google.com/rss/search?q=الذكاء+الاصطناعي&hl=ar&gl=SA&ceid=SA:ar` — Google News Arabic AI
- `https://venturebeat.com/category/ai/feed` — VentureBeat AI (no trailing slash)
- `https://the-decoder.com/feed/` — The Decoder

### Cybersecurity
- `https://feeds.feedburner.com/TheHackersNews` — The Hacker News
- `https://www.bleepingcomputer.com/feed/` — BleepingComputer
- `https://www.securityweek.com/feed/` — SecurityWeek (FeedBurner returns 403)

### Companies
- `https://techcrunch.com/feed/` — TechCrunch
- `https://www.wired.com/feed/business/rss` — Wired Business

### Phones
- `https://www.gsmarena.com/rss-news-reviews.php3` — GSMArena (.php3 not .php)
- `https://www.androidauthority.com/feed/` — Android Authority
- `https://9to5google.com/feed/` — 9to5Google

### Electric Vehicles
- `https://electrek.co/feed/` — Electrek
- `https://insideevs.com/feed/` — InsideEVs (/feed/ not /rss/)
- `https://cleantechnica.com/feed/` — CleanTechnica

### Arabic Regional
- `https://news.google.com/rss/search?q=تكنولوجيا&hl=ar&gl=SA&ceid=SA:ar` — Arabic Technology
- `https://news.google.com/rss/search?q=ذكاء+اصطناعي&hl=ar&gl=SA&ceid=SA:ar` — Arabic AI
- `https://news.google.com/rss/search?q=أمن+سيبراني&hl=ar&gl=SA&ceid=SA:ar` — Arabic Cybersecurity

### Regional
- `https://news.google.com/rss/search?q=تكنولوجيا&hl=ar&gl=GB&ceid=GB:ar` — Europe Tech (Arabic)
- `https://news.google.com/rss/search?q=تكنولوجيا&hl=ar&gl=SG&ceid=SG:ar` — Asia Tech (Arabic)

## Category Coverage Gaps

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| AI | 47 | 30-50 | ✅ On target |
| Companies | 11 | 15-25 | ⚠️ Needs 1-2 feeds |
| Cybersecurity | 4 | 15-25 | 🔴 Needs 3 feeds |
| Phones | 2 | 15-25 | 🔴 Critical — needs 3 feeds |
| EV | 3 | 15-25 | 🔴 Critical — needs 3 feeds |

## Feed Verification Tool

Use `Invoke-RestMethod` to verify a feed:
```powershell
$url = "https://example.com/feed/"
$resp = Invoke-RestMethod -Uri $url -Headers @{"User-Agent"="Mozilla/5.0"}
$resp.rss.channel.item | Select-Object -First 3 title
```
