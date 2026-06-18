# PROJECT GOVERNANCE — Tech Dose News

**Enforced:** 2026-06-18  
**Scope:** All code changes to this repository  
**Violation Severity:** P0 (blocks deployment)

---

## RULE 1 — UTF-8 ONLY

Every text file in this repository MUST be UTF-8 **without BOM**.

- **Verify:** `node -e "const fs=require('fs');const b=fs.readFileSync('FILE');process.exit(b[0]===0xEF&&b[1]===0xBB&&b[2]===0xBF?1:0)"`
- **Fix PowerShell:** Use `[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))`
- **Fix Node.js:** `fs.writeFileSync(path, content, 'utf-8')`
- **Reject:** Any file with BOM, Windows-1256, or Latin-1 encoding.

---

## RULE 2 — NEVER USE POWERSHELL REDIRECTS FOR HTML

PowerShell's `>` operator and `Set-Content` convert output through the console code page, corrupting non-ASCII characters.

- **Banned:** `Set-Content`, `Out-File`, `>`, `>>` for any `.html`, `.js`, `.css`, `.json`, `.md` file
- **Allowed:** `[System.IO.File]::WriteAllText(...)` with explicit UTF-8 encoding
- **Allowed:** Node.js `fs.writeFileSync(path, content, 'utf-8')`

---

## RULE 3 — NODE.JS FILE WRITES ONLY

All scripted file operations must use Node.js, not PowerShell cmdlets.

| Operation | Command |
|-----------|---------|
| Read file | `fs.readFileSync(path, 'utf-8')` |
| Write file | `fs.writeFileSync(path, content, 'utf-8')` |
| Read git blob | `execSync('git cat-file -p <hash>', {encoding:'buffer'}).toString('utf-8')` |

---

## RULE 4 — RUNTIME TESTING MANDATORY

Before committing any change to admin/index.html, script.js, or any frontend HTML file:

```
node --check <file>               # Syntax validation
```

For admin/index.html specifically, extract the JS block and validate:

```
node -e "require('fs').readFileSync('admin/index.html','utf-8').match(/<script>([\s\S]*?)<\/script>/g).forEach(s=>require('child_process').execSync('node --check -',{input:s.replace(/<\/?script>/g,'')}))"
```

---

## RULE 5 — NO PUSH BEFORE CONSOLE VALIDATION

Before `git push`, verify:

```
git diff --stat                    # Understand what's changing
git diff --check                   # Check for whitespace errors
```

- Zero diff warnings
- No binary files unexpectedly added
- No .pem, .key, .env files in the diff

---

## RULE 6 — NO PUSH WITH JS ERRORS

A commit is BLOCKED if JavaScript validation fails:

- `node --check <file>` must produce `0` exit code
- Open the admin panel in a browser and verify 0 console errors
- Verify 0 network errors (404/500)

---

## RULE 7 — NO HARDCODED TELEGRAM URLS

- **Never** write `href="https://t.me/..."` directly in HTML
- All Telegram URLs must be injected by `loadTelegramConfig()` in `script.js`
- HTML elements must use `href="#"` or `id="telegramBtn"`
- The `admin_config.json` keys `telegram_channel`, `telegram_redirect`, `telegram_mode` are the single source of truth

---

## RULE 8 — NO PAT AUTHENTICATION

- **Banned:** `ghp_*`, `gho_*`, `github_pat_*` tokens in any source file, config file, or commit message
- **Banned:** PAT-based auth in server code, proxy code, or admin code
- **Required:** GitHub App authentication only (App ID 4083931, Installation ID 141059355)
- **Secret:** Private key stored outside repository at `C:\Users\Osama Elfeky\AppData\Local\Temp\opencode\td-admin-panel.private-key.pem.bak`

---

## RULE 9 — admin_config.json IS SINGLE SOURCE OF TRUTH

- Site name, description, Telegram config, social links, colors, custom CSS/JS
- **Never** hardcode these values in HTML or JS
- Admin panel reads from and writes to `admin_config.json` via GitHub API
- Frontend loads via `fetch()` at runtime

---

## RULE 10 — data/articles/index.json IS ARTICLE SINGLE SOURCE OF TRUTH

- All article data must be in `data/articles/index.json`
- Individual article JSONs in `data/articles/*.json` are **pipeline artifacts only**
- The n8n pipeline must rebuild `index.json` directly (it already does via inline JS)
- **Never** delete `index.json` — it is the production article database
- **Never** modify `index.json` without validating JSON syntax

---

## RULE 11 — PROTECTED FILES REQUIRE BACKUP BEFORE EDIT

The following 10 files require:
1. Backup: `cp FILE FILE.bak.$(date +%Y%m%d)`
2. Diff review: `git diff FILE`
3. Syntax validation: `node --check` or HTML validator
4. Runtime test: browser check with 0 console/network errors
5. Commit message explaining the change

**Protected files:**
1. `index.html`
2. `article.html`
3. `contact.html`
4. `script.js`
5. `style.css`
6. `admin/index.html`
7. `admin_config.json`
8. `data/articles/index.json`
9. `server/gh-proxy.mjs`
10. `production_workflow.json`

---

## RULE 12 — CATEGORIES MUST BE CENTRALIZED

- The **admin CATEGORIES array** (`admin/index.html:521-533`) is the single source of truth for categories
- `data/categories.json` must match the admin registry
- `script.js` CATEGORY_MAP must map all legacy keys to admin canonical IDs
- Any new category must be added to ALL THREE locations simultaneously

---

## RULE 13 — NO FORCE PUSH TO MAIN

- `git push --force` is **banned** on the `main` branch
- If rebase is needed: `git pull --rebase origin main`
- If remote has diverged: inspect both sides, merge, never force
- Exception: only if no other collaborator has pulled the divergent commits

---

## RULE 14 — COMMIT MESSAGE CONVENTION

```
<TYPE>: <short description>

<TYPE>:
- P0 HOTFIX — Emergency production fix
- FEATURE — New functionality
- FIX — Bug fix (non-critical)
- REFACTOR — Code reorganization, no behavior change
- CLEANUP — Remove dead files, archive backups
- DOCS — Documentation or governance files
- CONFIG — Configuration changes
- CATEGORY — Category system changes
```

---

## ENFORCEMENT

Violations of rules 1-3, 7-10 are **P0** — block deployment immediately.

Violations of rules 4-6, 11-14 are **P1** — must fix before next deployment.

---

*Permanent governance document — Tech Dose News*
