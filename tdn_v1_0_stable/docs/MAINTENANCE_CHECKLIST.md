# Tech Dose News — Long-Term Maintenance Checklist

## Phase 9 — Production Operations & Preventative Maintenance

### Frequency Overview

| Cadence | Tasks | Owner |
|---|---|---|
| **Weekly** | Index integrity, sync health, dashboard, Telegram delivery | Editor / Operator |
| **Monthly** | Repository cleanup, index deep validation, proxy health, image audit, log rotation | Editor / Operator |
| **Quarterly** | Workflow validation, disaster recovery test, dependency audit, full production audit, config review | Editor / Operator |

---

## Weekly Tasks

### W1 — Admin Index vs Website Index Count Check

Verify that the admin panel index count matches the live website index count.

```powershell
# Local admin index
$adminIndex = Get-Content -Raw -LiteralPath "D:\Projects\Open Code\data\articles\index.json" | ConvertFrom-Json
Write-Host "Admin index count: $($adminIndex.Count)"

# Website live index
$webResponse = Invoke-RestMethod -Uri "https://osamaelfeky567.github.io/techdosenews/data/articles/index.json"
Write-Host "Website index count: $($webResponse.Count)"

if ($adminIndex.Count -ne $webResponse.Count) {
  Write-Host "WARNING: Index count mismatch!"
}
```

**Failure response**: If counts differ, investigate which articles are missing. Check the last 5 pipeline runs in the system log for `PUBLISH_FAILED` or `ARTICLE_VERIFIED` entries. If an article exists in admin but not on the website, re-trigger a manual publish.

**Acceptable threshold**: ±0. Any mismatch requires investigation.

### W2 — Sync Check: Pipeline Writing Correctly

Verify that the pipeline is writing new articles and that the data format is valid.

```
1. Check the last article written:
   - Open data/articles/index.json
   - Verify the first entry (most recent article) has all required fields:
     id, title, excerpt, category, date, readTime, source, techdose_link
   - Verify no null/empty fields in the latest entry

2. Check that the latest article file exists:
   - Look in data/articles/ for {last_article_id}.json
   - Verify it loads as valid JSON
   - Verify body is present and valid HTML

3. Check that the article is accessible on the live site:
   - Visit https://osamaelfeky567.github.io/techdosenews/article.html?id={last_article_id}
   - Verify HTTP 200
   - Verify title appears on the page
```

**Failure response**: If any step fails, check `data/logs/system.log` for errors from the most recent pipeline execution. Common issues: GitHub API rate limiting, lock contention, file size limits.

### W3 — Dashboard Health Check

Verify pipeline run logs and system health.

```
1. Open n8n at http://localhost:5678
2. Navigate to TDN Production workflow → Execution History
3. Verify:
   - Last 24h executions: count them
   - Success rate: > 80% expected (some failures due to RSS finding no articles)
   - Last execution time: should be recent (< 2 hours ago)

4. Check system health dashboard:
   - Open admin/index.html (local or GitHub Pages)
   - Verify dashboard loads without errors
   - Check health.json if applicable

5. Review data/logs/system.log:
   - Check for unexpected error codes
   - Check for repeated failures of the same type
   - Check that lock system is releasing properly
```

**Failure response**: If success rate drops below 50%, investigate immediately. Common causes: Groq API outage, GitHub API issues, network problems.

### W4 — Telegram Message Delivery Test

Verify that Telegram messages are being delivered correctly.

```
1. Check the last Telegram message sent:
   - Open Telegram app → @TechDoseNews_bot channel
   - Verify the last message matches the latest published article

2. Check Telegram message formatting:
   - Title is bold
   - Excerpt is 2 lines
   - Category badge is present
   - Read time is shown
   - Source name is shown
   - Public link is correct URL

3. Verify the public link in the Telegram message:
   - Click the link → verify it opens the correct article
   - Verify the article page loads fully

4. Check system.log for recent Telegram entries:
   - Search for "TELEGRAM_URL" — should be the most recent Telegram event
   - Search for "TELEGRAM_URL_FAILED" — should NOT be present in last 24h
```

**Failure response**: If Telegram messages are not being sent, check the `TG_TOKEN` and `TG_CHAT_ID` environment variables. Verify the Telegram bot has not been blocked or rate-limited by Telegram.

---

## Monthly Tasks

### M1 — Full Repository Cleanup Review

Inspect the GitHub repository for stale files, orphaned directories, and accumulated clutter.

```
1. List empty/stale directories:
   - Check: data/articles_db/
   - Check: data/events/
   - Check: data/queues/
   - Check: data/testing-output/
   
2. Check array sizes (cap enforcement):
   - index.json: should be capped at 500 entries
   - content_hashes.json: should be capped at 10,000 entries
   - published_topics.json: should be capped at 500 entries
   - published_links.json: should be capped at 5,000 entries
   
3. Check for uncommitted files:
   - git status — verify no unexpected files
   - git diff — verify no unintended changes
   
4. Check for files > 500KB:
   - Get-ChildItem -Recurse -File | Where-Object { $_.Length -gt 500KB }
   - Investigate any large files (GitHub Pages has a 1MB limit)
```

**Failure response**: If any data file exceeds its cap, manually trim the oldest entries. Remove stale directories if they contain files. Investigate any files close to the 1MB GitHub Pages limit.

### M2 — Index Validation (No Ghost Entries, No Corrupted Entries)

Deep validation of the article index and individual article files.

```powershell
$indexPath = "D:\Projects\Open Code\data\articles\index.json"
$articlesDir = "D:\Projects\Open Code\data\articles"
$issues = @()

# Load index
$index = Get-Content -Raw -LiteralPath $indexPath | ConvertFrom-Json

# Check each index entry
foreach ($entry in $index) {
  # Check required fields
  $required = @("id", "title", "excerpt", "category", "date", "readTime")
  foreach ($field in $required) {
    if (-not $entry.$field) {
      $issues += "Missing field '$field' in index entry id=$($entry.id)"
    }
  }
  
  # Check article file exists
  $articleFile = Join-Path -Path $articlesDir -ChildPath "$($entry.id).json"
  if (-not (Test-Path -LiteralPath $articleFile)) {
    $issues += "Missing article file for id=$($entry.id)"
  } else {
    # Check article file is valid JSON
    try {
      $article = Get-Content -Raw -LiteralPath $articleFile | ConvertFrom-Json
      if (-not $article.body) { $issues += "Article $($entry.id) has no body" }
    } catch {
      $issues += "Article $($entry.id) has invalid JSON: $_"
    }
  }
}

# Check for orphaned article files (not in index)
$indexIds = @($index | ForEach-Object { $_.id })
Get-ChildItem -LiteralPath $articlesDir -Filter "*.json" | Where-Object {
  $_.Name -ne "index.json" -and $indexIds -notcontains $_.BaseName
} | ForEach-Object {
  $issues += "Orphaned file: $($_.Name)"
}

Write-Host "Issues found: $($issues.Count)"
$issues | ForEach-Object { Write-Host "  - $_" }
```

**Failure response**: 
- Missing article files → regenerate from backup or mark as broken in index
- Orphaned files → archive or delete
- Corrupted JSON → investigate how corruption occurred, restore from backup

### M3 — Proxy Health Check

Verify both the standalone and n8n gh-proxy are running and functional.

```
1. Standalone proxy (server/gh-proxy.mjs):
   - Check if process is running:
     Get-Process -Name "node" | Where-Object { $_.CommandLine -like "*gh-proxy*" }
   - Test endpoint:
     curl -X POST http://localhost:3001 -H "Content-Type: application/json" -d '{"action":"get","path":"data/health.json"}'
   - Expected: HTTP 200 with JSON response

2. n8n webhook proxy:
   - Check if n8n is running:
     curl http://localhost:5678/healthz
   - Test endpoint:
     curl -X POST http://localhost:5678/webhook/gh-proxy -H "Content-Type: application/json" -d '{"action":"get","path":"data/health.json"}'
   - Expected: HTTP 200 with JSON response

3. Verify auth:
   - Check GH_TOKEN is set: echo $env:GH_TOKEN
   - Check token has not expired (GitHub PATs can have expiration dates)
   - Verify token has repo scope

4. Test binary upload (write small test file):
   - Create a 1x1 pixel PNG, base64 encode, POST to proxy
   - Verify file appears in GitHub repo
   - Delete test file after verification
```

**Failure response**: If proxy is down, restart it. If token has expired, generate a new GitHub PAT. If n8n is down, restart n8n (`npm start` or system service).

### M4 — Image Storage Review (Orphaned Images)

If AI Image Generation is enabled, check for orphaned images.

```powershell
$imgDir = "D:\Projects\Open Code\img"
$articlesDir = "D:\Projects\Open Code\data\articles"

if (-not (Test-Path -LiteralPath $imgDir)) {
  Write-Host "No img/ directory — no images to audit"
  return
}

# Get all article IDs from index
$index = Get-Content -Raw -LiteralPath "$articlesDir\index.json" | ConvertFrom-Json
$articleIds = @($index | ForEach-Object { $_.id })

# Check each image file
$orphanedImages = @()
Get-ChildItem -LiteralPath $imgDir -Filter "*.png" | ForEach-Object {
  $articleId = $_.BaseName  # filename without extension
  if ($articleIds -notcontains $articleId) {
    $orphanedImages += $_.Name
  }
}

if ($orphanedImages.Count -gt 0) {
  Write-Host "Orphaned images found: $($orphanedImages.Count)"
  $orphanedImages | ForEach-Object { Write-Host "  - $_" }
} else {
  Write-Host "No orphaned images — all images are linked to an article"
}
```

**Failure response**: Orphaned images should be reviewed. If the corresponding article was deleted, the image should also be deleted. If the image was generated but the article failed to publish, the image should be deleted.

### M5 — Log Rotation

Prevent `data/logs/system.log` from growing unbounded.

```
1. Check log file size:
   Get-Item "D:\Projects\Open Code\data\logs\system.log" | Select-Object Length

2. If log > 10MB, rotate:
   - Rename: system.log → system_YYYY-MM-DD.log
   - Archive to backup location: backups/logs/system_YYYY-MM-DD.log.gz
   - Create new empty system.log
   - Keep last 90 days of logs

3. Check log for repeated errors:
   - Count occurrences of each error type in the past month:
     Select-String -Path "D:\Projects\Open Code\data\logs\system.log" -Pattern "^(.*?)\|" | 
     Group-Object | Sort-Object Count -Descending | Select-Object -First 10
   - Investigate any error type with > 10 occurrences
```

**Failure response**: Investigate any error type that appears more than 10 times in the past month. Repeated errors indicate a systemic issue that needs fixing.

---

## Quarterly Tasks

### Q1 — Workflow Validation

Full validation of the n8n workflow against the documented architecture.

```
1. Export the production workflow from n8n:
   - Open n8n UI → Workflows → TDN Production → Download
   - Save as tdn_v1_0_stable/workflows/production_workflow.json

2. Compare exported workflow against ARCHITECTURE.md and WORKFLOW_MAP.md:
   - Verify node order matches documentation
   - Verify node configurations match (timeouts, models, parameters)
   - Verify connection layout matches documented flow

3. Check for drift between docs and implementation:
   - Have any nodes been added/removed without documentation updates?
   - Have any parameters changed (models, temperatures, thresholds)?
   - Are all environment variables still correct?

4. Validate all n8n credentials:
   - Check GH_TOKEN is valid (GitHub → Settings → Developer Settings → Personal Access Tokens)
   - Check GROQ_API_KEY is valid (Groq Console → API Keys)
   - Check TG_TOKEN is valid (Telegram → BotFather)
   - Check GEMINI_API_KEY is valid (Google AI Studio → API Keys) — if AI Images enabled

5. Check workflow lock version:
   - Compare workflow's versionId with the production version
   - Verify the active version is the latest approved version
```

**Failure response**: If the workflow has drifted from documentation, update either the workflow or the documentation (whichever is wrong). If credentials are invalid, regenerate them. If the active version is not the latest, activate the correct version.

### Q2 — Backup Verification (Disaster Recovery Test)

Verify that the system can be restored from a stable snapshot.

```
1. Verify local backup exists:
   - Check: backup_cold/ directory exists and is not empty
   - Check: backup_cold/data/ contains all subdirectories
   - Check: backup_cold/workflows/ contains exported workflow JSONs

2. Test restore procedure (simulation, not actual restore):
   - Take a fresh backup: 
     Copy-Item -Path "data" -Destination "backup_verify\data" -Recurse
     Copy-Item -Path "workflows" -Destination "backup_verify\workflows" -Recurse
   - Verify backup integrity:
     - Can index.json be parsed as valid JSON?
     - Can each article file be parsed?
     - Do workflow JSONs load in n8n (dry run)?
   - Clean up verification:
     Remove-Item -Path "backup_verify" -Recurse -Force

3. Verify disaster recovery documentation exists:
   - Is there a documented DR procedure?
   - Does it include steps for: n8n restore, GitHub restore, env var restore?
   - Are all restore steps still accurate?

4. Check that backup covers all critical files:
   - data/articles/*.json (all articles)
   - data/articles/index.json
   - data/published_topics.json
   - data/content_hashes.json
   - data/published_links.json
   - data/workflow_lock.json (current state)
   - workflows/*.json (all n8n workflows)
   - .env (encrypted or placeholder)
```

**Failure response**: If backup is missing or corrupted, create a fresh backup immediately. If DR documentation is missing or outdated, update it.

### Q3 — Dependency Updates

Audit and update all dependencies.

```
1. Check Node.js version:
   node --version
   Verify current LTS (check https://nodejs.org/en/download/)

2. Check npm packages (if any in production):
   cd path-to-n8n
   npm outdated
   
3. Check n8n version:
   - Open n8n UI → Settings → About
   - Compare with latest: https://github.com/n8n-io/n8n/releases
   - If > 2 versions behind, plan upgrade

4. Check Playwright version (if used):
   npx playwright --version
   npx playwright install --dry-run  # check if browsers need update

5. Check GitHub PAT expiration:
   - Log in to GitHub → Settings → Developer Settings → Personal Access Tokens
   - Check expiration dates for all tokens
   - Renew any token expiring within 3 months

6. Check external API deprecation notices:
   - Groq API: check https://console.groq.com/docs for deprecations
   - Gemini API: check https://ai.google.dev/gemini-api/docs for deprecations
   - Telegram API: check https://core.telegram.org/bots/api for changes
   - GitHub API: check https://docs.github.com/en/rest for changes
```

**Failure response**: Update any package with security vulnerabilities. Upgrade n8n if more than 2 versions behind. Renew expiring tokens before they expire. Document any API changes that may require code updates.

### Q4 — Full Production Audit

Comprehensive audit of the entire production system.

```
1. Security audit:
   - Check .env is NOT committed: git check-ignore .env
   - Check for hard-coded secrets: git grep -E "(AIzaSy|ghp_|gsk_|TG_TOKEN|GROQ_API_KEY)" -- '*.js' '*.mjs'
   - Check n8n instance is not exposed: curl http://localhost:5678 (should be local-only)
   - Verify GitHub repo is public/private as intended
   - Verify tokens have minimum required scopes

2. Performance audit:
   - Check average pipeline execution time (from n8n execution history)
   - If > 60s, identify bottleneck (RSS fetch? Groq API? GitHub API?)
   - Check GitHub API rate limit usage (check rate limit headers in responses)
   - Check image sizes are < 500KB (if AI Images enabled)

3. Content quality audit:
   - Review last 20 published articles
   - Verify category distribution is diverse (not all from one category)
   - Verify article quality is consistent
   - Check for spelling/grammar issues
   - Verify source attribution is correct

4. Frontend audit:
   - Check all pages load (index, article, category, about, contact, etc.)
   - Verify site loads in < 3 seconds
   - Verify mobile responsiveness
   - Verify category filters work
   - Verify search function works
   - Verify GoatCounter analytics are loading

5. Link audit:
   - Check all internal links in articles resolve (article.html?id=...)
   - Check all external source links are valid
   - Check sitemap.xml is up-to-date
   - Verify no broken links on homepage
```

**Failure response**: Document all issues found. Prioritize security issues (must fix immediately), then content quality issues (fix within 1 week), then performance issues (fix within 1 month). Create an action plan with deadlines.

### Q5 — Report Outdated Configs

Audit configuration files for drift, deprecation, and accuracy.

```
1. Compare n8n Code node variables against documented configuration:
   - Open TDN Production workflow in n8n
   - Extract all const/let variable declarations from Code nodes
   - Compare against:
     - config/.env.template (env vars)
     - docs/ARCHITECTURE.md (model names, thresholds)
     - docs/WORKFLOW_MAP.md (node configurations)
   
2. Check admin_config.json for accuracy:
   - Verify categories match the canonical 8 categories
   - Verify any paths referenced still exist
   - Verify GitHub repo owner/repo name are correct

3. Check frontend configs:
   - Verify sitemap.xml lists correct URLs
   - Verify robots.txt has correct rules
   - Verify all frontend pages use correct API paths

4. Check data file schemas:
   - Verify index.json entries match current schema
   - Verify article JSON files match current schema
   - Verify content_hashes.json uses current hash algorithm
   - Verify published_topics.json uses current topic fingerprint

5. Generate config drift report:
   - List every discrepancy found
   - Categorize: CRITICAL (breaks publishing), MAJOR (breaks features), MINOR (cosmetic)
   - Create remediation plan with deadlines
```

**Failure response**: Critical config drift must be fixed immediately. Major drift should be fixed within 1 week. Minor drift can be deferred to next maintenance window.

---

## Incident Response Quick Reference

| Symptom | Immediate action | Escalation |
|---|---|---|
| Pipeline not executing | Check n8n is running | Restart n8n |
| Groq API errors | Check Groq status page | Wait for recovery |
| GitHub API errors | Check GitHub status | Wait for recovery |
| Telegram not sending | Check token and chat ID | Re-authenticate bot |
| Lock never released | Manually delete workflow_lock.json | Investigate stuck execution |
| Index count mismatch | Run W1 check | Investigate missing articles |
| AI Image module failing | Check GEMINI_API_KEY | Disable module if persistent |
| Frontend not loading | Check GitHub Pages status | Wait for CDN refresh |

---

## Maintenance Log Template

Each maintenance session should be logged:

```
# Maintenance Log — {DATE}

## Tasks completed
- [ ] W1 — Index count check: {admin_count} / {website_count} — {PASS/FAIL}
- [ ] W2 — Sync check: {PASS/FAIL}
- [ ] W3 — Dashboard health: {PASS/FAIL}
- [ ] W4 — Telegram delivery: {PASS/FAIL}
- [ ] M1 — Repo cleanup: {PASS/FAIL}
- [ ] M2 — Index validation: {PASS/FAIL}
- [ ] M3 — Proxy health: {PASS/FAIL}
- [ ] M4 — Image audit: {images_count} — {PASS/FAIL}
- [ ] M5 — Log rotation: {log_size} — {PASS/FAIL}
- [ ] Q1 — Workflow validation: {PASS/FAIL}
- [ ] Q2 — Backup verification: {PASS/FAIL}
- [ ] Q3 — Dep updates: {PASS/FAIL}
- [ ] Q4 — Full audit: {issues_count} — {PASS/FAIL}
- [ ] Q5 — Config report: {drift_count} — {PASS/FAIL}

## Issues found
- {issue}

## Actions taken
- {action}

## Notes
- {notes}
```
