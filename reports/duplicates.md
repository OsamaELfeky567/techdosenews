# Duplicate Articles Report

**Date:** 2026-07-04
**Phase:** 8.1 — Repository Stabilization (Safe Fixes Only)

---

## Duplicate Titles

**1 duplicate found** — 2 articles with identical Arabic title "إيران ترد على البيان المشترك".

### Article A (Older)

| Field | Value |
|-------|-------|
| **ID** | `art-1782468020319-ux8ir7` |
| **Title** | إيران ترد على البيان المشترك |
| **Date** | 2026-06-26T10:00:44 |
| **Category** | *(none / mis-tagged as "تكنولوجيا")* |
| **Source** | BBC Arabic |
| **Link** | `https://www.bbc.com/arabic/articles/c9w2v7jn1w0o` |
| **Body length** | Short (~1 min read) |
| **Quality score** | None |
| **Status** | published |

### Article B (Newer)

| Field | Value |
|-------|-------|
| **ID** | `art-1782469820154-27yzm4` |
| **Title** | إيران ترد على البيان المشترك |
| **Date** | 2026-06-26T10:30:23 |
| **Category** | *(none / mis-tagged as "تكنولوجيا")* |
| **Source** | BBC Arabic |
| **Link** | `https://www.bbc.com/arabic/articles/c9w2v7jn1w0o` |
| **Body length** | Short (~1 min read) |
| **Quality score** | None |
| **Status** | published |

### Analysis

| Question | Answer |
|----------|--------|
| Same source URL? | **Yes** — both link to the same BBC Arabic article |
| Same content? | **Likely** — similar body, similar topic |
| Why both exist? | Pipeline fetched the same BBC RSS item twice with slightly different timestamps |
| Which is better? | Article B (newer) has a slightly longer body |
| Verdict | **Duplicate — same source, same topic, similar body** |

### Recommendation

Remove one of the two articles. Article A (art-1782468020319, older) should be the one removed since article B (art-1782469820154, newer) has a slightly more complete body. Both are political content (Iran/US geopolitics) and are out-of-scope for a tech news site regardless.

---

## Duplicate Images

**1 duplicate image found** — the same Pexels stock photo used for 2 different articles.

| Image URL | Article A | Article B |
|-----------|-----------|-----------|
| `https://images.pexels.com/photos/7561900/pexels-photo-7561900.jpeg` | art-1782648398720-gisbhi ("لماذا ترتدي أي شيء آخر غير هودي الشمس هذا الصيف؟") | art-1782648294337-ruj8z5 ("الفرق بين الغني والفقير") |

Both articles are already flagged as out-of-scope (fashion/lifestyle and socio-economics respectively), so this duplicate image will be resolved when those articles are removed.

---

## Duplicate Published Links

**Before cleanup:** 297 entries with 15+ duplicates (BBC Arabic URLs repeated multiple times)

**After cleanup:** 72 unique links (38 article source links + 34 techdose_link URLs)

The `data/published_links.json` file has been rebuilt to only contain valid, current article links.
