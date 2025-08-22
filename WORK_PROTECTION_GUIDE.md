# 🛡️ WORK PROTECTION CHECKLIST 🛡️

## Before You Start Working:
- [ ] Run `git status` to check current state
- [ ] Run `git pull` to get latest changes
- [ ] Confirm you're on the right branch

## During Work (Every 30-60 minutes):
- [ ] Save files (Ctrl+S or auto-save active)
- [ ] Quick commit: `./scripts/auto-commit.sh "Progress on [feature]"`
- [ ] Or use VS Code Task: Ctrl+Shift+P → "Tasks: Run Task" → "Quick Save to Git"

## Before Taking Breaks:
- [ ] Save all files
- [ ] Run quick save: `quicksave` (if you added the alias)
- [ ] Or manual: `git add . && git commit -m "Break save" && git push`

## End of Day (MANDATORY):
- [ ] Save all files
- [ ] Run: `./scripts/auto-commit.sh "End of day save: [what you worked on]"`
- [ ] Or use VS Code Task: "End of Day Save"
- [ ] Verify push succeeded: `git log --oneline -3`

## Emergency Situations:
- [ ] System crashing/freezing: `emergency "System issue"`
- [ ] About to make risky changes: `./scripts/auto-commit.sh "Before risky changes"`
- [ ] VS Code acting up: Save files + commit immediately

## Recovery Commands (if you lose work):
```bash
# Check if there are any uncommitted changes
git status

# Check recent commits
git log --oneline -10

# Check if files exist but not committed
git diff
git diff --staged

# Recover from local backup (if any)
git stash list
git stash pop
```

## Daily Workflow:
1. **Start**: `git pull` → check status
2. **Work**: Save frequently + commit every 30-60 min
3. **Breaks**: Quick save before leaving
4. **End**: Comprehensive end-of-day commit + push
5. **Verify**: Check GitHub/remote has your work

## Aliases to Add to ~/.bashrc:
```bash
source /home/teejay/Documents/Projects/auto-repairs-frontend/scripts/git-aliases.sh
```
