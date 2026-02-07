#!/bin/bash

# Backup script for MiniDisc Cover Designer
# Creates timestamped backups of source and production

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/home/daryl/md-label-backups"
DEV_DIR="/home/daryl/md-label-fresh"
PROD_DIR="/var/www/minidisc.squirclelabs.uk"

echo "🔒 Creating backup: $TIMESTAMP"
echo ""

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup source code (excluding node_modules, .next, .git)
echo "📦 Backing up source code..."
cd $DEV_DIR
tar -czf $BACKUP_DIR/source-v0.3.6-$TIMESTAMP.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  .

SOURCE_SIZE=$(du -h $BACKUP_DIR/source-v0.3.6-$TIMESTAMP.tar.gz | cut -f1)
echo "✓ Source backup: $SOURCE_SIZE"

# Backup production (excluding node_modules)
echo ""
echo "🚀 Backing up production deployment..."
cd $PROD_DIR
sudo tar -czf $BACKUP_DIR/production-v0.3.6-$TIMESTAMP.tar.gz \
  --exclude='node_modules' \
  .

sudo chown daryl:daryl $BACKUP_DIR/production-v0.3.6-$TIMESTAMP.tar.gz
PROD_SIZE=$(du -h $BACKUP_DIR/production-v0.3.6-$TIMESTAMP.tar.gz | cut -f1)
echo "✓ Production backup: $PROD_SIZE"

# Backup package-lock.json for exact dependencies
echo ""
echo "📋 Backing up dependency manifest..."
cp $DEV_DIR/package-lock.json $BACKUP_DIR/package-lock-$TIMESTAMP.json
echo "✓ Dependencies backed up"

# List all backups
echo ""
echo "📂 All backups:"
ls -lht $BACKUP_DIR/ | head -10

echo ""
echo "✅ Backup complete!"
echo ""
echo "Backup location: $BACKUP_DIR"
echo "Total size: $(du -sh $BACKUP_DIR | cut -f1)"
