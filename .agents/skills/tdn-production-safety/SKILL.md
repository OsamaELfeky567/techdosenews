---
name: tdn-production-safety
description: "Production safety rules for Tech Dose News — prevent data loss, avoid breaking changes, protect live content"
---

# Production Safety Skill

## Golden Rules

1. **Never delete published articles** without confirmation dialog + rollback
2. **Never modify n8n workflow** (READ ONLY — `/backup_admin_final_lock/production_workflow.json`)
3. **Always fetch latest SHA before GitHub PUT** — race conditions cause silent data loss
4. **Always backup before batch operations** — save original state for rollback
5. **Never push to main without testing** — verify article creation, editing, and deletion

## Guardrails

### Before any write operation:
- [ ] Fetch latest SHA from GitHub API
- [ ] Save pre-operation state in memory
- [ ] Implement 2-retry with exponential backoff on failure

### Before any bulk operation:
- [ ] Show confirmation dialog with item count
- [ ] Save full DB + INDEX snapshots
- [ ] Execute each item individually with rollback support
- [ ] Log every success/failure

### Before any migration:
- [ ] Create tagged backup branch
- [ ] Verify migration produces same article count
- [ ] Test on a single article first

### Before deployment:
- [ ] Verify index.json loads correctly
- [ ] Test article view on site
- [ ] Check no duplicate article IDs exist

## Emergency Rollback

If a push causes issues:
```
git revert <commit-hash>
git push origin main
```

For data corruption in index.json:
- Restore from local backup or git history

## NEVER DO

- `git push --force` on main
- Delete files in `data/articles/` without verifying they're not in index.json
- Modify the production n8n workflow JSON
- Store credentials in code (use n8n credential store or env vars)
