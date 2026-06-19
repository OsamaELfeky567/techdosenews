---
name: tdn-n8n-forensics
description: "n8n execution forensics for Tech Dose News — investigate execution logs, dedup tracking, and pipeline health"
---

# n8n Forensics Skill

## Data Sources

| Source | Location | Access Method |
|--------|----------|--------------|
| n8n Event Log | `C:\Users\Osama Elfeky\.n8n\n8nEventLog.log` | File read |
| n8n SQLite DB | `C:\Users\Osama Elfeky\.n8n\database.sqlite` (180MB) | Blocked (PID 25408 lock) |
| n8n Workflow | `backup_admin_final_lock/production_workflow.json` | File read |
| Published Topics | `data/published_topics.json` | File read |
| Content Hashes | `data/content_hashes.json` | File read |
| Published Links | `data/published_links.json` | File read |
| Article Index | `data/articles/index.json` | File read |
| Git Log | `git log --all --oneline --grep="Topic:"` | Git command |

## Execution Timeline Analysis

To reconstruct the execution timeline:
1. Read `n8nEventLog.log` — extract "Execution" lines with IDs, timestamps, durations
2. Cross-reference with `published_topics.json` timestamps (UTC)
3. Cross-reference with git commit timestamps (local +0300)
4. Identify: successful, empty, dedup-skipped, feed-exhausted executions

### Duration-Based Classification

| Duration | Meaning |
|----------|---------|
| ~15-17s | Full pipeline: RSS fetch → AI translation → GitHub write → article produced |
| ~1-4s | Dedup filtered or feed exhausted: all items stale/duplicate |
| ~0.6s | Cold start / transient: early exit (first run after activation) |
| >20s | Possible timeout or error |

## Dedup Logic (from Code node)

```javascript
// Arabic-aware content hash
function contentHash(str) {
  // Normalize Arabic: remove diacritics, normalize Alef variants
  // Hash: title + description[0:100]
}
```

**Known bug:** `published_links.json` is written but NEVER read during dedup. Only `contentHash()` is used. This means the same URL can be published under different titles (1 false positive detected).

## Feed Exhaustion Pattern

Google News RSS has a natural lull during US overnight hours (04:30-07:00 UTC). During this window, the pipeline returns ~1s executions as all items are duplicates or stale. Recovery is automatic when the US news cycle resumes.

## Investigation Checklist

1. Check event log for last execution ID and duration
2. Check published_topics for latest article timestamp
3. Check git log for latest Topic: commit
4. Check if n8n process is running: `Get-Process -Name "node" | ...`
5. Check if feed is exhausted: compare latest article time to current time
