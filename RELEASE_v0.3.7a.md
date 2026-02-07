# v0.3.7a - RELEASE NOTES

**Date:** February 6, 2026  
**Type:** UI Polish  
**Next.js Version:** 14.2.35 ✅

---

## 🎯 Changes

### UI Improvements
- ✅ **Removed duplicate zoom buttons** below canvas preview
- ✅ **Kept zoom buttons** in top controls panel (Font Family section)
- ✅ **Updated version** to v0.3.7a throughout app

---

## ✅ What's Still Working

### Security (from v0.3.6)
- ✅ Rate limiting (5 req/hour per IP)
- ✅ Input validation (message, type, email)
- ✅ Security headers (XSS, clickjacking protection)
- ✅ PM2 running as regular user

### Features
- ✅ Crisp image rendering
- ✅ High-resolution artwork (iTunes 3000x3000, Deezer 1000x1000)
- ✅ Feedback system
- ✅ All templates and controls

---

## 📦 Deployment

```bash
cd /home/daryl/md-label-fresh
sudo cp -r .next /var/www/minidisc.squirclelabs.uk/
pm2 restart minidisc
```

---

## ✅ Verification

- [x] Next.js 14.2.35 (not upgraded)
- [x] Build successful
- [x] Bottom zoom buttons removed
- [x] Top zoom buttons preserved
- [x] Version updated to v0.3.7a

---

## 🔄 Rollback

If needed, restore from backup:
```bash
./restore.sh 20260206-175106
```

---

**Status:** ✅ Ready to deploy
