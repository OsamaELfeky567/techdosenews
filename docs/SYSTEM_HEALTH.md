# Tech Dose News — System Health

## Current Mode

**v5.4.7 — Implementation Sync Mode (docs deployed → n8n pipeline code)**

---

## Production Summary

| System | Status | Version |
|---|---|---|
| RSS ingestion | ✅ Active (freshness prefer <12h) | v5.4.7 |
| Writer AI | ✅ Active (sharp magazine tone) | v5.4.7 |
| Reviewer AI | ✅ CALIBRATION_MODE=true | v5.4.7 |
| Validate & Score | ✅ Active | v5.4.7 |
| Publish (S&P) | ✅ Active (+EXECUTION_SUMMARY) | v5.4.7 |
| Telegram publishing | ✅ Active (5-point verify) | v5.4.7 |
| Dedup (4 layers + saturation control) | ✅ Active | v5.4.7 |
| GitHub Pages site | ✅ Live | v5.4.7 |
| Frontend | ✅ Active | v5.4.7 |
| Lock system | ✅ Active | v5.4.7 |
| n8n instance | ✅ Running | localhost:5678 |
| Groq API | ✅ Connected | llama-3.3-70b-versatile |
| GoatCounter | ✅ Active | `gc.zgo.at` |
| View Tracker workflow | ⚠️ Active but limited | Only updates counter fields |

## Current Metrics

| Metric | Value | Notes |
|---|---|---|
| **Total articles in index** | 0 | Index cleaned — calibration mode should produce first data |
| **Publishes/day** | 0 | Calibration mode active — first publishes expected |
| **Rejection rate** | ~85% | Target: reduce to 50–75% via calibration |
| **Average execution time** | ~15–30s | RSS fetch + 2 Groq calls (Writer + Reviewer) |
| **Lock status** | Unlocked | Last execution released lock |
| **Calibration thresholds** | nw>70, rv>70, spam<25 | Temporary — deployed via deploy_v547.js |
| **Topic saturation window** | 72h | Same entity within 72h → auto reject |
| **Deploy method** | deploy_v547.js | Surgical patches to 5 Code nodes via n8n API |
| **Queues** | Removed (v5.2) | No queue-based processing exists |

## Active Risks

### HIGH

| Risk | Impact | Mitigation |
|---|---|---|
| **Groq free tier quota** (100K TPD) | Pipeline stops if quota exhausted; ~66 executions/day max | Monitor usage; upgrade to paid if production use increases |
| **AI output unpredictability** | Writer may produce low-quality or factually incorrect articles | Reviewer gate + fail-closed on low score; no article published unless all 7 thresholds pass |
| **No automated tests** | Pipeline logic changes must be manually verified | Manual testing only — no regression suite |
| **n8n on localhost** | System unavailable if laptop is off, loses power, or network changes | Only runs during active sessions; no cloud backup |
| **GitHub API rate limit** (5000/hr) | S&P publish fails if rate-limited | Keep operations minimal; cap all array sizes |

### MEDIUM

| Risk | Impact | Mitigation |
|---|---|---|
| **GitHub Pages CDN cache** (up to 10min) | Stale content served after publish | Cache-busting timestamp parameter in script.js |
| **1MB GitHub file limit** | Large articles may fail silently | Keep articles <500KB |
| **No monitoring/alerting** | Failures go unnoticed until manual check | Manual system.log inspection |
| **No backup of n8n workflow** | Workflow lost if n8n instance resets | Export workflow JSON recommended |
| **frontend monolith** (`script.js`) | All frontend logic in single JS file; hard to modify safely | No current mitigation |

### LOW

| Risk | Impact | Mitigation |
|---|---|---|
| **Tokens hard-coded in Code nodes** | If n8n is exposed, tokens compromised | Local instance only — no public access |
| **No AI model fallback** | If Groq is down, entire pipeline fails | Manual mode only |
| **No retry on failure** | Single failed step = missed execution window | Must re-trigger manually |

## Technical Debt

| Item | Status | Notes |
|---|---|---|
| **Stale GitHub data directories** | 🟡 Not cleaned | `data/articles_db/`, `data/events/`, `data/queues/`, `data/testing-output/` — remnants from earlier systems, empty but present |
| **health.json** | 🟡 Unused | Written but never read by any node |
| **categories.json** | 🟡 Unused | Legacy — categories defined inline in Code nodes |
| **quality_config.json** | 🟡 Unused | Legacy — quality config moved to Code node variables |
| **Duplicate GH_TOKEN** | 🟡 4 copies | Orchestrator, Reviewer, S&P, Telegram each store their own copy |
| **Duplicate slug function** | 🟡 Duplicated | S&P uses inline `slug()`, Parse Article uses separate `makeId()` |
| **No automated tests** | 🔴 No test suite | Pipeline logic has zero automated tests |
| **Local dev scripts** | 🟡 50+ files in workspace root | Cleanup deferred — not in production repo |
| **Legacy admin page** | 🟡 Present but unmaintained | `admin/` directory in GitHub repo |

## Architecture Notes

- Architecture is intentionally **simplified**: 9-node linear pipeline, no queues, no event system, no rollback engine
- **Quality > Freshness > Quantity**: Hard publish rules enforced at every node
- **Current mode**: CALIBRATION_MODE=true — deployed via `deploy_v547.js` — calibration thresholds (nw>70, rv>70, spam<25) for data collection
- **Deploy strategy**: Surgical string patches to existing Code nodes, not full rewrites. 5 nodes modified: Orchestrator, Writer, Reviewer, Telegram, S&P
- **Fail-closed**: Every verification step (review, URL, index, Telegram) blocks publication on failure
- **Duplicate prevention** (4 layers + saturation): content hash, semantic, narrative, company/topic saturation, 72h topic window
- **Source-weighted trust**: TechCrunch, The Verge, Wired, Ars Technica = HIGH base trust
- **Reviewer is editor-in-chief**: Final authority, fail-closed, human-like editorial balance guidance
- **Telegram safety**: 5-point pre-send verification (public existence, index slug, body length, title match, HTTP 200)
- **Pipeline philosophy**: Find ONE excellent article → Write → Review → Publish → Stop
- All stale/deprecated architecture (queues, state machine, archive pipeline, partition DB, observability systems) has been removed from documentation and is no longer part of production
- **Only 2 active n8n workflows**: Full Pipeline + View Tracker — all others deactivated
