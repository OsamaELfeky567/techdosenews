---
name: tdn-master
description: "Master skill for Tech Dose News — orchestrates all sub-skills, defines standard operating procedures"
---

# Tech Dose News Master Skill

## SOP: Standard Operating Procedure

Every Tech Dose News task MUST follow this sequence:

### Step 1: Architecture Review
Load `tdn-architecture` skill. Understand the data flow and which components are involved.

### Step 2: Root Cause Analysis
Before any fix, determine root cause. Never fix symptoms.
- Use `tdn-n8n-forensics` for pipeline issues
- Use `tdn-admin-auditor` for dashboard issues
- Use `tdn-data-integrity` for sync issues

### Step 3: Safety Check
Load `tdn-production-safety`. Verify:
- No published articles will be deleted
- Production workflow is READ ONLY
- Data is backed up before changes

### Step 4: Implementation
- One change at a time
- Test after each change
- Fix root causes, not symptoms

### Step 5: Data Integrity Verification
Run ALL checks from `tdn-data-integrity`:
- [ ] File counts match
- [ ] No duplicate IDs
- [ ] Status distribution correct
- [ ] No articles missing from DB

### Step 6: Report Generation
For audits and investigations, create structured `.md` reports.

### Step 7: Commit
- Logical commits per phase
- Clear commit messages
- Push all changes

## Skill Dependencies

| Task Type | Required Skills |
|-----------|----------------|
| Dashboard investigation | tdn-admin-auditor, tdn-data-integrity |
| Pipeline debugging | tdn-n8n-forensics, tdn-dedup-intelligence |
| Adding RSS sources | tdn-rss-expansion |
| Fixing dedup | tdn-dedup-intelligence, tdn-n8n-forensics |
| Data sync | tdn-data-integrity, tdn-gh-ops |
| Image generation | tdn-gemini-pipeline |
| Production deployment | tdn-production-safety, tdn-gh-ops |
| Any task | tdn-architecture (always first) |

## Communication Rules

1. **Always report article counts** before and after changes
2. **Always verify index.json == articles_db.json** before completing a task
3. **Always mention risk level** when proposing changes
4. **Never assume** — verify by reading files and checking GitHub API
5. **Document everything** in reports

## Quick Reference

```powershell
# Verify data integrity
node -e "const i=require('./data/articles/index.json'); const d=require('./articles_db.json'); console.log('INDEX:', i.length, 'DB:', d.length, 'MATCH:', i.length===d.length)"

# Rebuild DB
node scripts/sync_articles.js

# Check pipeline status
Get-Process -Name "node" | Where-Object { $_.CommandLine -match "n8n" }
```
