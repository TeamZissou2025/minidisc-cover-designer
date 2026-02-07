#!/bin/bash

# Restore script for MiniDisc Cover Designer
# Usage: ./restore.sh <backup-timestamp>
# Example: ./restore.sh 20260206-175106

set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup-timestamp>"
  echo ""
  echo "Available backups:"
  ls -1 /home/daryl/md-label-backups/ | grep "source-" | sed 's/source-v0.3.6-\(.*\)\.tar\.gz/  \1/'
  exit 1
fi

TIMESTAMP=$1
BACKUP_DIR="/home/daryl/md-label-backups"
DEV_DIR="/home/daryl/md-label-fresh"
PROD_DIR="/var/www/minidisc.squirclelabs.uk"

SOURCE_BACKUP="$BACKUP_DIR/source-v0.3.6-$TIMESTAMP.tar.gz"
PROD_BACKUP="$BACKUP_DIR/production-v0.3.6-$TIMESTAMP.tar.gz"

if [ ! -f "$SOURCE_BACKUP" ]; then
  echo "❌ Backup not found: $SOURCE_BACKUP"
  exit 1
fi

echo "🔄 Restoring from backup: $TIMESTAMP"
echo ""

read -p "⚠️  This will OVERWRITE current files. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore cancelled."
  exit 0
fi

# Stop PM2
echo ""
echo "🛑 Stopping PM2..."
pm2 stop minidisc || true

# Restore source
echo ""
echo "📦 Restoring source code..."
cd $DEV_DIR
tar -xzf $SOURCE_BACKUP

# Restore production
if [ -f "$PROD_BACKUP" ]; then
  echo ""
  echo "🚀 Restoring production..."
  cd $PROD_DIR
  sudo tar -xzf $PROD_BACKUP
  sudo chown -R daryl:daryl .
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd $DEV_DIR
npm install

# Rebuild
echo ""
echo "🔨 Building..."
npm run build

# Copy to production
echo ""
echo "🚀 Deploying..."
sudo cp -r .next $PROD_DIR/
sudo cp package.json $PROD_DIR/
sudo cp package-lock.json $PROD_DIR/
sudo cp next.config.js $PROD_DIR/
cd $PROD_DIR
sudo npm install --production

# Restart PM2
echo ""
echo "▶️  Starting PM2..."
pm2 start minidisc

echo ""
echo "✅ Restore complete!"
echo ""
echo "Check status: pm2 logs minidisc"
