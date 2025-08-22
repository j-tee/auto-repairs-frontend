#!/bin/bash

# Auto-commit script to prevent work loss
# Usage: ./scripts/auto-commit.sh "Optional commit message"

cd "$(dirname "$0")/.."

# Check if there are any changes
if git diff --quiet && git diff --staged --quiet; then
    echo "✅ No changes to commit"
    exit 0
fi

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Use provided message or default
MESSAGE="${1:-Auto-save work in progress - $TIMESTAMP}"

# Add all changes
git add .

# Commit with message
git commit -m "$MESSAGE"

# Push to current branch
CURRENT_BRANCH=$(git branch --show-current)
git push origin "$CURRENT_BRANCH"

echo "✅ Work auto-committed and pushed to $CURRENT_BRANCH"
echo "📝 Message: $MESSAGE"
