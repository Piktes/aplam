#!/bin/bash
# Atomic Deploy Script for Heiraza
# Ensures clean build + pm2 restart in correct order

set -e  # Exit on any error

echo "🚀 Starting atomic deployment..."

# 1. Clean old build artifacts
echo "🧹 Cleaning old build..."
rm -rf .next
rm -rf node_modules/.cache

# 2. Install dependencies (clean install)
echo "📦 Installing dependencies..."
npm ci

# 3. Build application
echo "🔨 Building application..."
npm run build

# 4. Verify build succeeded
if [ ! -d ".next" ]; then
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

# 5. Restart pm2 gracefully
echo "🔄 Restarting pm2..."
pm2 restart aplam --update-env

# 6. Wait for app to be ready
echo "⏳ Waiting for app to start..."
sleep 5

# 7. Health check
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health || echo "000")
if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ Deployment successful! Health check passed."
else
    echo "⚠️  Warning: Health check returned $HEALTH_CHECK"
fi

# 8. Show current build info
echo ""
echo "📋 Current build info:"
curl -s http://localhost:3002/api/health | head -c 500 || echo "Could not fetch health info"
echo ""
echo ""
echo "🎉 Deployment complete!"
