# Source Health Report

**Date:** 2026-07-14
**Phase:** 11C

## Health Classification

Each source is classified as:

| Status | Meaning | Conditions |
|--------|---------|------------|
| GREEN | Healthy source | <3 consecutive failures, failure rate <80%, last success <3 days ago |
| YELLOW | Needs monitoring | ≥1 consecutive failure, failure rate >40%, duplicate rate >50%, publish rate <5% |
| RED | Temporarily unhealthy | ≥3 consecutive failures, failure rate >80%, last success >3 days ago |
| DISABLED | Manually or auto-disabled | enabled=false |

## Auto Disable Rules

- **5 consecutive RSS failures** → auto disable
- **7 days without valid article** → auto disable

## Auto Recovery Rules

- **Every 24 hours**: test all disabled sources
- If RSS feed responds with valid items → auto re-enable

## Health History

- Daily health snapshots stored per source (max 90 days)
- 7-day health trend used for RED classification (>4 RED days = RED)
