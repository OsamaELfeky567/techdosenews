# TD-Arabi working rules (owner standing rules, do not change without the owner)

## Images
1. Article hero image priority: (1) the source's own image (RSS media / og:image) > (2) a free, licensed Pexels photo that is relevant to the topic > (3) the branded card, as the LAST resort only (nothing usable or nothing relevant).
2. Gaming/GTA articles search Pexels with "video game" prepended. If the photo found is clearly irrelevant, set `hero_card: true` on the article to use the card.
3. The branded card never carries a source caption.
4. Caption always matches the real image: source image -> "الصورة من موقع المصدر: <source>"; Pexels -> "الصورة: Pexels"; card -> no caption.
5. Social previews (og:image, twitter:image, Telegram/Facebook) use news/<slug>/og-v2.jpg: the article real image as background under a light (about 16%) brand tint with the title, logo and category; the plain branded card only when the article has no real image. Never a bare raw copy of the source image.

## Trending topics
- GTA 6 is a tracked topic (boost, bypasses the tech filter). Gaming is a standing category ("ألعاب") with GameSpot and VGC feeds, gated to gaming keywords.
- Verification: rely only on the source text. Rumors, player claims and unconfirmed leaks are written as unconfirmed claims, never as fact; no invented dates or features. Official sources (Rockstar) and credible outlets only.
- Daily volume: BASE_PER_DAY 15, quality gate always on (MIN_WORDS 280, no Markdown leaks).

## Posting
- Publish to our own Telegram channel (t.me/td_arabi) and Facebook page (tdarabi) only. Never post in channels or groups that are not ours. No betting, politics or religion content.
- Bot promo on the site stays off until the owner says yes.
