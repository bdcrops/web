#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# push.sh — Smart auto-push for current branch
# Usage:
#   ./push.sh                        → auto commit message + push
#   ./push.sh "your message"         → custom commit message
#   ./push.sh -f                     → force push (use with care)
# ═══════════════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# ─── Check we're in a git repo ──────────────────────────────────
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}✗ Not a git repository${NC}"
    exit 1
fi

# ─── Parse args ─────────────────────────────────────────────────
FORCE=""
MSG=""
for arg in "$@"; do
    case "$arg" in
        -f|--force) FORCE="--force-with-lease" ;;
        *)          MSG="$arg" ;;
    esac
done

# ─── Get current branch ─────────────────────────────────────────
BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
    echo -e "${RED}✗ Detached HEAD — checkout a branch first${NC}"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Branch: ${GREEN}$BRANCH${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

# ─── Show status ────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}▸ Current status:${NC}"
git status --short

# ─── Check if anything to commit ────────────────────────────────
if [ -z "$(git status --porcelain)" ]; then
    echo ""
    echo -e "${YELLOW}▸ Nothing to commit — checking for unpushed commits...${NC}"

    UNPUSHED=$(git log @{u}.. --oneline 2>/dev/null | wc -l || echo "0")
    if [ "$UNPUSHED" -gt 0 ]; then
        echo -e "${GREEN}  Found $UNPUSHED unpushed commit(s):${NC}"
        git log @{u}.. --oneline
        echo ""
        echo -e "${BLUE}▸ Pushing to origin/$BRANCH...${NC}"
        git push $FORCE origin "$BRANCH"
        echo -e "${GREEN}✓ Pushed successfully${NC}"
    else
        echo -e "${GREEN}✓ Everything up to date${NC}"
    fi
    exit 0
fi

# ─── Stage all changes ──────────────────────────────────────────
echo ""
echo -e "${YELLOW}▸ Staging all changes...${NC}"
git add -A

# ─── Build commit message ───────────────────────────────────────
if [ -z "$MSG" ]; then
    # Auto-generate message from changed files
    CHANGED=$(git diff --cached --name-only | wc -l)
    ADDED=$(git diff --cached --name-only --diff-filter=A | wc -l)
    MODIFIED=$(git diff --cached --name-only --diff-filter=M | wc -l)
    DELETED=$(git diff --cached --name-only --diff-filter=D | wc -l)

    TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
    MSG="update: $CHANGED file(s) [+$ADDED ~$MODIFIED -$DELETED] · $TIMESTAMP"
fi

echo -e "${YELLOW}▸ Commit message:${NC} $MSG"

# ─── Commit ─────────────────────────────────────────────────────
git commit -m "$MSG"

# ─── Push ───────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▸ Pushing to origin/$BRANCH...${NC}"

# Handle first-time push (no upstream)
if ! git rev-parse --abbrev-ref @{u} > /dev/null 2>&1; then
    echo -e "${YELLOW}  No upstream — setting origin/$BRANCH${NC}"
    git push -u origin "$BRANCH"
else
    git push $FORCE origin "$BRANCH"
fi

echo ""
echo -e "${GREEN}✓ Done! Cloudflare Pages should auto-deploy in ~1 min.${NC}"
echo -e "${BLUE}  Watch: https://dash.cloudflare.com${NC}"
