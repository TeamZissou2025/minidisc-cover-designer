#!/bin/bash
# Deploy MiniDisc Cover Designer with Node.js server support

set -e  # Exit on any error

echo "🚀 Deploying MiniDisc Cover Designer v0.3.6 with Node.js..."

# Variables
SOURCE_DIR="/home/daryl/md-label-fresh"
DEPLOY_DIR="/var/www/minidisc.squirclelabs.uk"

echo "📦 Step 1: Stopping existing server (if running)..."
sudo pm2 stop minidisc 2>/dev/null || echo "   No existing server to stop"
sudo pm2 delete minidisc 2>/dev/null || echo "   No existing process to delete"

echo "📁 Step 2: Creating deployment directory..."
sudo mkdir -p "$DEPLOY_DIR"

echo "📋 Step 3: Copying built files..."
sudo cp -r "$SOURCE_DIR/.next" "$DEPLOY_DIR/"
sudo cp -r "$SOURCE_DIR/public" "$DEPLOY_DIR/" 2>/dev/null || echo "   No public folder"
sudo cp "$SOURCE_DIR/package.json" "$DEPLOY_DIR/"
sudo cp "$SOURCE_DIR/package-lock.json" "$DEPLOY_DIR/" 2>/dev/null || echo "   No package-lock"
sudo cp "$SOURCE_DIR/next.config.js" "$DEPLOY_DIR/"

echo "🔐 Step 4: Copying environment variables..."
sudo cp "$SOURCE_DIR/.env.local" "$DEPLOY_DIR/.env.production.local"

echo "📦 Step 5: Installing production dependencies..."
cd "$DEPLOY_DIR"
sudo npm install --production

echo "🚀 Step 6: Starting server with PM2..."
sudo pm2 start npm --name "minidisc" -- start
sudo pm2 save

echo "✅ Deployment complete!"
echo ""
echo "📊 Server Status:"
sudo pm2 status

echo ""
echo "🔗 Server running on: http://localhost:3000"
echo "🌐 Public URL: https://minidisc.squirclelabs.uk"
echo ""
echo "📝 Useful commands:"
echo "   View logs:    sudo pm2 logs minidisc"
echo "   Restart:      sudo pm2 restart minidisc"
echo "   Stop:         sudo pm2 stop minidisc"
echo "   Status:       sudo pm2 status"
