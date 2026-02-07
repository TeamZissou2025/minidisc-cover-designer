# 💾 MiniDisc Cover Designer - Backups

## Current Version: v0.3.6 (Working)

### Backup Location
`/home/daryl/md-label-backups/`

---

## 📦 What's Backed Up

### Source Backup (`source-v0.3.6-TIMESTAMP.tar.gz`)
- All source code
- Configuration files
- Environment files
- Security fixes
- **Excludes:** `node_modules`, `.next`, `.git`

### Production Backup (`production-v0.3.6-TIMESTAMP.tar.gz`)
- Built `.next` directory
- Production config
- **Excludes:** `node_modules`

---

## 🔧 Quick Commands

### Create Backup
```bash
cd /home/daryl/md-label-fresh
./backup.sh
```

### List Backups
```bash
ls -lh /home/daryl/md-label-backups/
```

### Restore Backup
```bash
cd /home/daryl/md-label-fresh
./restore.sh 20260206-175106  # Use your timestamp
```

---

## 📋 Manual Backup

```bash
# Backup source
cd /home/daryl/md-label-fresh
tar -czf ../md-label-backups/source-manual-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude='node_modules' --exclude='.next' --exclude='.git' .

# Backup production
cd /var/www/minidisc.squirclelabs.uk
sudo tar -czf /home/daryl/md-label-backups/production-manual-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude='node_modules' .
```

---

## 📋 Manual Restore

```bash
# 1. Stop PM2
pm2 stop minidisc

# 2. Extract backup
cd /home/daryl/md-label-fresh
tar -xzf ../md-label-backups/source-v0.3.6-TIMESTAMP.tar.gz

# 3. Install & build
npm install
npm run build

# 4. Deploy
sudo cp -r .next /var/www/minidisc.squirclelabs.uk/
sudo cp package.json /var/www/minidisc.squirclelabs.uk/
sudo cp next.config.js /var/www/minidisc.squirclelabs.uk/

# 5. Restart
pm2 start minidisc
```

---

## 🗂️ Backup Contents

### v0.3.6 (Current Working Version)

**Date:** February 6, 2026

**Includes:**
- ✅ Rate limiting (5 req/hour per IP)
- ✅ Input validation (message, type, email)
- ✅ Security headers (XSS, clickjacking protection)
- ✅ PM2 running as regular user (not root)
- ✅ `.gitignore` protecting secrets
- ✅ Crisp image rendering fix
- ✅ Next.js 14.2.35 (stable)

**Security Status:**
- API routes: Secured
- Feedback system: Working
- Discord webhook: Protected
- File permissions: Correct

---

## ⚠️ Important Notes

1. **Before major changes:** Always create a backup first
2. **Test after restore:** Run `pm2 logs minidisc` to verify
3. **Dependencies:** Backups exclude `node_modules` (run `npm install` after restore)
4. **Environment files:** `.env.local` is included in backups

---

## 🔐 Security Reminder

- Backups contain `.env.local` with Discord webhook
- Keep `/home/daryl/md-label-backups/` private
- Don't commit backups to git
- Rotate old backups periodically

---

## 📊 Current Backup

```
Timestamp: 20260206-175106
Source: 289KB
Status: ✅ Working version
```
