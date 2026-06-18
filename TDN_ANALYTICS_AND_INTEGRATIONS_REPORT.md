# TDN Analytics & Integrations Readiness Report

**Phase:** E+ — Integrations & Analytics Readiness  
**Goal:** Prepare admin panel for future domain migration and production integrations.  
**Principle:** All integrations configurable from Settings. No code changes needed after purchasing the domain.

---

## 1. Supported Analytics Integrations

| Integration | Fields | Purpose |
|-------------|--------|---------|
| Google Analytics 4 | `ga4MeasurementId` | Track visitors, behavior, popular pages |
| Google Search Console | `searchConsoleMetaTag`, `searchConsolePropertyUrl` | Monitor search performance, verify ownership |
| Microsoft Clarity | `clarityProjectId` | Session recording, heatmaps |
| GoatCounter | `goatcounterEndpoint` | Lightweight privacy-first analytics |
| Plausible | `plausibleDomain` | Open-source privacy analytics |
| Umami | `umamiWebsiteId`, `umamiScriptUrl` | Self-hosted analytics |

## 2. Supported Notification Integrations

| Integration | Fields | Purpose |
|-------------|--------|---------|
| Telegram Bot | `telegramBotToken`, `telegramChannelId`, `telegram_channel`, `telegram_redirect`, `telegram_mode` | Auto-post new articles to channel |
| Discord | `discordWebhook` | Post notifications to Discord server |
| Slack | `slackWebhook` | Post notifications to Slack workspace |
| Email | `emailNotification` | Email alerts for new publications |

## 3. SEO & Domain Readiness Fields

| Field | Use Case |
|-------|----------|
| `siteUrl` | Final site URL after domain purchase |
| `canonicalDomain` | Primary domain (no www) — prevents duplicate content |
| `robotsUrl` | robots.txt full URL — guides crawlers |
| `sitemapUrl` | sitemap.xml full URL — accelerates indexing |
| `googleVerification` | Google Search Console ownership proof |
| `bingVerification` | Bing Webmaster Tools ownership proof |
| `yandexVerification` | Yandex Webmaster ownership proof |

**Domain migration = update these 7 fields in Settings → save. Done.**

## 4. Configuration Storage

All values stored in `admin_config.json` (serialized via `saveConfigToGh()`).

```
// admin_config.json structure (new fields only)
{
  // Analytics
  "ga4MeasurementId": "G-XXXXXXXXXX",
  "searchConsoleMetaTag": "abcdef...",
  "searchConsolePropertyUrl": "https://example.com",
  "clarityProjectId": "abcdef1234",
  "goatcounterEndpoint": "https://tdn.goatcounter.com",
  "plausibleDomain": "techdosenews.com",
  "umamiWebsiteId": "uuid-here",
  "umamiScriptUrl": "https://analytics.example.com/script.js",

  // Notifications
  "telegramBotToken": "123456:ABC-DEF",
  "telegramChannelId": "@channel",
  "discordWebhook": "https://discord.com/api/webhooks/...",
  "slackWebhook": "https://hooks.slack.com/services/...",
  "emailNotification": "admin@example.com",

  // SEO & Domain
  "siteUrl": "https://techdosenews.com",
  "canonicalDomain": "techdosenews.com",
  "robotsUrl": "https://techdosenews.com/robots.txt",
  "sitemapUrl": "https://techdosenews.com/sitemap.xml",
  "googleVerification": "google-xxx",
  "bingVerification": "bing-xxx",
  "yandexVerification": "yandex-xxx"
}
```

All new fields have defaults in `DEFAULT_CONFIG` (empty string). Existing configs auto-merge via `{ ...DEFAULT_CONFIG, ...j.data }`.

## 5. Dashboard Widgets

### KPI Cards (6 cards)
- Total Articles, Published, Drafts, Scheduled, Total Visits, Last 28 Days Visits

### Articles Overview (Pie Chart — SVG)
- Published (green), Drafts (gold), Scheduled (purple)

### Content Growth (Bar Chart)
- Articles published per month (last 6 months)

### Traffic Analytics (2 Placeholder Widgets)
- Last 7 Days | Last 28 Days
- Shows provider name when analytics tool is configured
- Shows "بيانات الزيارات الحقيقية ستظهر بعد تفعيل أداة التحليلات" when no provider is set

## 6. Tracking Abstraction Layer

```js
getAnalyticsProvider() → { name, endpoint/label } | null
```

**Priority order:** GoatCounter → GA4 → Plausible → Umami  
**Provider check:** Only returns non-null when a field is populated.  
**Fallback:** If all empty, `renderAnalyticsDashboard()` shows the placeholder message.

## 7. Settings UI Organization

Settings are now organized into 4 collapsible sections:
1. **الإعدادات الأساسية** (GitHub Token, Webhook, Proxy, Password)
2. **تحليلات المواقع** (GA4, GSC, Clarity, GoatCounter, Plausible, Umami)
3. **الإشعارات والتكامل الخارجي** (Telegram, Discord, Slack, Email)
4. **تحسين محركات البحث والاستعداد للنقل** (Site URL, Canonical, robots, sitemap, verifications)

Every field includes inline help text with:
- Setup instructions (in Arabic)
- Example value
- Integration purpose

## 8. Files Modified

| File | Change |
|------|--------|
| `admin/index.html` | CSS, HTML, JS: config, settings UI, dashboard widgets, abstraction layer |
| `admin_config.json` | Re-saved with new field defaults on first save |

## 9. Commit

```
FEATURE: analytics dashboard and integrations readiness
```
