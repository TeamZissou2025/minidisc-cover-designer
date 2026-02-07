#!/bin/bash

# 🔒 Security Deployment Script
# Applies security fixes to production server

set -e  # Exit on error

echo "🔒 Starting Security Deployment..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEV_DIR="/home/daryl/md-label-fresh"
PROD_DIR="/var/www/minidisc.squirclelabs.uk"
NGINX_CONFIG="nginx-secure.conf"
NGINX_SITE="/etc/nginx/sites-available/minidisc.squirclelabs.uk"

cd $DEV_DIR

echo "📦 Step 1: Building Next.js with security updates..."
npm run build

echo ""
echo "🛑 Step 2: Stopping PM2 (if running as root, will require manual restart)..."
# Check if running as root
if ps aux | grep -E "^root.*PM2" | grep -v grep > /dev/null; then
    echo -e "${RED}⚠️  WARNING: PM2 is running as ROOT!${NC}"
    echo "After this script, you MUST restart PM2 as regular user:"
    echo "  sudo pm2 delete minidisc"
    echo "  sudo pm2 kill"
    echo "  pm2 start npm --name 'minidisc' -- start"
    echo "  pm2 save"
    echo ""
    read -p "Press Enter to continue..."
    sudo pm2 delete minidisc || true
else
    pm2 delete minidisc || true
fi

echo ""
echo "📁 Step 3: Copying files to production..."
sudo mkdir -p $PROD_DIR
sudo cp -r .next $PROD_DIR/
sudo cp -r public $PROD_DIR/
sudo cp package.json $PROD_DIR/
sudo cp package-lock.json $PROD_DIR/
sudo cp next.config.js $PROD_DIR/

echo ""
echo "🔐 Step 4: Copying environment variables..."
if [ -f .env.local ]; then
    sudo cp .env.local $PROD_DIR/.env.production.local
    echo -e "${GREEN}✓ Environment variables copied${NC}"
else
    echo -e "${RED}✗ .env.local not found! You'll need to create .env.production.local manually${NC}"
fi

echo ""
echo "📦 Step 5: Installing production dependencies..."
cd $PROD_DIR
sudo npm install --production

echo ""
echo "🔒 Step 6: Setting secure permissions..."
sudo chmod 600 $PROD_DIR/.env.production.local 2>/dev/null || echo "No .env file to secure"
sudo chown -R daryl:daryl $PROD_DIR

echo ""
echo "🌐 Step 7: Updating Nginx configuration..."
sudo cp $DEV_DIR/$NGINX_CONFIG $NGINX_SITE
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ Nginx config test failed!${NC}"
    exit 1
fi

echo ""
echo "🚀 Step 8: Starting PM2..."
# Check again if we need root
if ps aux | grep -E "^root.*PM2.*God" | grep -v grep > /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 God daemon still running as root. Starting with sudo...${NC}"
    echo -e "${YELLOW}   You should fix this after deployment!${NC}"
    sudo pm2 start npm --name "minidisc" -- start
    sudo pm2 save
else
    cd $PROD_DIR
    pm2 start npm --name "minidisc" -- start
    pm2 save
fi

echo ""
echo "🔍 Step 9: Verifying deployment..."
sleep 3

# Check PM2 status
if pm2 list | grep -q "minidisc"; then
    echo -e "${GREEN}✓ PM2 process running${NC}"
else
    echo -e "${RED}✗ PM2 process NOT running${NC}"
fi

# Check if Next.js is responding
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Next.js server responding${NC}"
else
    echo -e "${RED}✗ Next.js server NOT responding${NC}"
fi

# Check nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx running${NC}"
else
    echo -e "${RED}✗ Nginx NOT running${NC}"
fi

echo ""
echo "✅ Security deployment complete!"
echo ""
echo "📋 IMPORTANT POST-DEPLOYMENT STEPS:"
echo ""
echo "1. If PM2 was running as root, restart it as regular user:"
echo "   sudo pm2 delete minidisc"
echo "   sudo pm2 kill"
echo "   pm2 start npm --name 'minidisc' -- start"
echo "   pm2 save"
echo ""
echo "2. Update Next.js to fix CVE:"
echo "   cd $DEV_DIR"
echo "   npm update next@latest"
echo "   npm audit fix"
echo "   Then re-run this script"
echo ""
echo "3. Purge Cloudflare cache:"
echo "   Go to Cloudflare dashboard > Caching > Purge Everything"
echo ""
echo "4. Test the live site:"
echo "   curl -I https://minidisc.squirclelabs.uk"
echo ""
echo "5. Test rate limiting:"
echo "   for i in {1..6}; do curl -X POST https://minidisc.squirclelabs.uk/api/feedback \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"type\":\"other\",\"message\":\"Rate limit test\"}'; done"
echo ""
echo "6. Monitor logs:"
echo "   pm2 logs minidisc"
echo ""
