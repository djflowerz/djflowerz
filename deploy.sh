#!/bin/bash
# DJ Flowerz Deployment Helper
echo "Preparing to push to GitHub..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git..."
    git init
    git branch -M main
fi

# Ask for remote URL if not set
REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE" ]; then
    echo "No remote repository found."
    read -p "Enter your GitHub Repository URL: " REPO_URL
    git remote add origin $REPO_URL
fi

echo "Staging files..."
git add .

echo "Committing..."
git commit -m "Final Vercel Deployment Release"

echo "Pushing to GitHub..."
git push -u origin main

echo "Done! Now go to Vercel and import this repository."
