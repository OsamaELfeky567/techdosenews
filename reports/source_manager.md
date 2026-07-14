# Source Manager - Admin Guide

**Date:** 2026-07-14
**Phase:** 11C

## Overview

The Source Manager is the Admin panel interface for managing RSS news sources. All operations write directly to `data/rss_sources.json` via GitHub API. No manual file editing required.

## Features

### CRUD Operations
- **Add Source** — New source form with all metadata fields
- **Edit Source** — Modify existing source settings
- **Delete Source** — Remove source with confirmation
- **Duplicate Source** — Clone source with `_copy` suffix
- **Clone Source** — Clone with empty ID for rapid creation

### Status Controls
- **Enable/Disable** — Toggle source activity
- **Test Source** — Validate RSS feed URL (HTTP 200, XML valid, items present, recent updates)

### Source Schema
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Display name |
| url | string | RSS feed URL |
| language | string | ar/en |
| country | string | ISO country code |
| tier | int | 1 (primary), 2 (secondary), 3 (backup) |
| priority | int | Static priority (1-100) |
| dynamic_priority | int | Auto-calculated daily |
| enabled | bool | Active source flag |
| trust_score | int | 1-100 credibility score |
| category | string | Content category |
| logo | string | Logo URL |
| description | string | Source description |
| created_at | ISO date | Creation timestamp |
| updated_at | ISO date | Last update timestamp |
| last_success | ISO date | Last successful fetch |
| last_failure | ISO date | Last failed fetch |
| last_fetch | ISO date | Last fetch attempt |

## Pipeline Integration

- Pipeline reads `data/rss_sources.json` at startup
- Sorts enabled sources by `dynamic_priority`
- Falls back to `DEFAULT_SOURCES` if file unreachable
- Ignores disabled sources
- Pipeline adds `lang` field (mapped from `language`) for backward compatibility

## Auto Management

- **Ranking**: Dynamic priority recalculated daily based on trust_score, publish_rate, average_quality, duplicate_rate, failure_rate
- **Health**: GREEN/YELLOW/RED classification based on consecutive failures, failure rate, duplicate rate, publish rate
- **Disable**: Auto-disabled after 5 consecutive failures or 7 days without valid article
- **Recovery**: Disabled sources retested every 24h; auto-reenabled if healthy
