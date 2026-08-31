#!/bin/bash
# git_sync.sh - Automated Git milestone sync script for SafeRoute AI

# Exit immediately if a command exits with a non-zero status
set -e

# Change directory to the script's directory to ensure relative paths work
cd "$(dirname "$0")"

# Check if git is initialized, if not initialize it
if [ ! -d .git ]; then
    echo "=== Initializing local Git repository ==="
    git init
    git branch -M main
fi

# Configure local git user if not set globally (to prevent commit errors)
if ! git config user.name >/dev/null 2>&1; then
    echo "Configuring default local Git user..."
    git config user.name "SafeRoute AI Dev"
    git config user.email "dev@saferoute.ai"
fi

# Stage all files
git add .

# Get current changes summary for commit message
CHANGES=$(git status --porcelain)

if [ -z "$CHANGES" ]; then
    echo "=== No changes to commit. Repository is up-to-date ==="
    exit 0
fi

echo "=== Detected changes ==="
echo "$CHANGES"
echo "========================"

# Generate commit message with current timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
COMMIT_MSG="Milestone update: $TIMESTAMP

Changes:
$CHANGES"

# Commit changes
git commit -m "$COMMIT_MSG"
echo "=== Created local commit ==="

# Check if remote origin is configured
if ! git remote | grep -q "origin"; then
    echo "=== No remote origin found. Creating a private repository on GitHub ==="
    
    # Get the directory name to use as the repo name
    REPO_NAME=$(basename "$PWD")
    
    # Create the repository using GitHub CLI
    # It will automatically set up the 'origin' remote pointing to the new repository
    gh repo create "$REPO_NAME" --private --source=. --remote=origin
    
    echo "=== Private repository '$REPO_NAME' created on GitHub! ==="
fi

# Push to the main branch
echo "=== Pushing changes to GitHub main branch ==="
git push -u origin main

echo "=== Git sync complete! ==="
