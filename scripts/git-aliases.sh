# Git Workflow Protection Aliases
# Add these to your ~/.bashrc or ~/.zshrc

# Quick save current work
alias quicksave='cd /home/teejay/Documents/Projects/auto-repairs-frontend && ./scripts/auto-commit.sh'

# Save with custom message
alias save='function _save() { cd /home/teejay/Documents/Projects/auto-repairs-frontend && ./scripts/auto-commit.sh "$1"; }; _save'

# End of day save - comprehensive commit and push
alias eod='function _eod() { 
    cd /home/teejay/Documents/Projects/auto-repairs-frontend
    echo "🔄 End of day save..."
    git add .
    git commit -m "End of day save: $(date +%Y-%m-%d) - $1" 
    git push origin $(git branch --show-current)
    echo "✅ Work safely backed up!"
}; _eod'

# Emergency save - when something goes wrong
alias emergency='function _emergency() {
    cd /home/teejay/Documents/Projects/auto-repairs-frontend
    echo "🚨 Emergency save in progress..."
    git add .
    git commit -m "EMERGENCY SAVE: $(date +%Y-%m-%d_%H-%M-%S) - $1"
    git push origin $(git branch --show-current)
    echo "✅ Emergency save complete!"
}; _emergency'
