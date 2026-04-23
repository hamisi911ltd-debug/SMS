#!/bin/bash

# Glotech School Management System - Deployment Script
# This script helps deploy the Node.js version to Railway

echo "🚀 Glotech School Management System - Deployment Helper"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Please run 'git init' first."
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No GitHub remote configured."
    echo "📖 Please follow GITHUB_SETUP.md to create a GitHub repository first."
    echo ""
    echo "Quick steps:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Git repository configured"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI not found. Installing..."
    npm install -g @railway/cli
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Railway CLI. Please install manually:"
        echo "   npm install -g @railway/cli"
        exit 1
    fi
fi

echo "✅ Railway CLI available"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Update: Ready for Railway deployment" || echo "No changes to commit"
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Failed to push to GitHub. Please check your repository setup."
    exit 1
fi

echo "✅ Code pushed to GitHub"

# Check if logged into Railway
echo "🔐 Checking Railway authentication..."
railway whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  Not logged into Railway. Please login:"
    railway login
    if [ $? -ne 0 ]; then
        echo "❌ Railway login failed. Please try again."
        exit 1
    fi
fi

echo "✅ Railway authentication verified"

# Initialize Railway project if not exists
if [ ! -f "railway.toml" ]; then
    echo "🔧 Initializing Railway project..."
    railway init
else
    echo "✅ Railway project already configured"
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up MongoDB Atlas (see DEPLOYMENT_GUIDE.md)"
    echo "2. Configure environment variables in Railway:"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - SESSION_SECRET"
    echo "   - NODE_ENV=production"
    echo "3. Test your application"
    echo "4. Change default passwords!"
    echo ""
    echo "🌐 Your app will be available at the Railway URL shown above."
else
    echo "❌ Deployment failed. Please check Railway logs for details."
    echo "💡 Try: railway logs"
fi