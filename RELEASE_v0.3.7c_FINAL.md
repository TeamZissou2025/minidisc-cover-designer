# v0.3.7c - RELEASE NOTES

**Date:** February 5, 2026  
**Type:** Vercel Deployment + Artwork Priority + PDF Export  
**Next.js Version:** 14.2.35 ✅  
**Deployment:** Vercel (Git-based)

---

## 🎯 **MAJOR CHANGES**

### 1. **Vercel Deployment** (NEW in v0.3.7c)
- ✅ **Migrated from PM2/Nginx to Vercel**
- ✅ **Git-based deployment** - Push to GitHub → Auto-deploy
- ✅ **No manual server management** - No PM2, no Nginx config
- ✅ **Instant rollbacks** - Via Vercel dashboard
- ✅ **Preview deployments** - Test branches before production

### 2. **High-Resolution Artwork Priority**
- ✅ **Search order changed** - iTunes first, then Deezer, then MusicBrainz
- ✅ **iTunes prioritized** - 3000×3000px images (9x better!)
- ✅ **Better default artwork** - Highest quality appears first
- ✅ **Improved exports** - PDFs use maximum resolution artwork

### 3. **PDF Export** (Print-Ready)
- ✅ **Replaced PNG with PDF export**
- ✅ **Prints at exact physical dimensions** (37mm × 53mm, etc.)
- ✅ **No manual scaling needed** - Works with any printer
- ✅ **Professional format** - Industry standard
- ✅ **Descriptive filenames** - `artist_title_template_date.pdf`

### 4. **Google Analytics**
- ✅ **Measurement ID:** G-54KYPT7HFE
- ✅ **Page view tracking**
- ✅ **Event tracking:** export, search, feedback, template changes

### 5. **UI Polish**
- ✅ **Removed duplicate zoom buttons**
- ✅ **Export button** says "EXPORT PDF"
- ✅ **Version display** shows "v0.3.7c • Vercel Deployed"

---

## 🚀 **DEPLOYMENT (CHANGED!)**

### **NEW: Vercel Git-Based Deployment**

```bash
cd /home/daryl/md-label-fresh

# Make changes, then:
git add .
git commit -m "Your changes"
git push

# That's it! Vercel auto-deploys in 30-60 seconds
```

**Benefits:**
- ✅ Automatic builds on push
- ✅ Zero-downtime deployments
- ✅ Instant rollbacks
- ✅ Preview URLs for testing
- ✅ No server maintenance

### **OLD: PM2/Nginx (deprecated)**
❌ Manual file copying  
❌ PM2 process management  
❌ Nginx configuration  
❌ **DO NOT USE THIS METHOD**

---

## 🔒 **SECURITY (Unchanged)**

All security fixes remain active:
- ✅ Rate limiting (5 req/hour per IP)
- ✅ Input validation (message, type, email)
- ✅ Security headers (XSS, clickjacking protection)
- ✅ Secrets protected (.gitignore, Vercel env vars)

---

## ✅ **VERIFICATION CHECKLIST**

After Vercel deployment:

- [ ] Site loads correctly
- [ ] Version shows "v0.3.7c • Vercel Deployed"
- [ ] Export button says "EXPORT PDF"
- [ ] Clicking export downloads `.pdf` file (not `.png`)
- [ ] Search "Radiohead OK Computer" → iTunes results first
- [ ] Image URLs contain `3000x3000bb.jpg`
- [ ] Google Analytics script loads (check Network tab)
- [ ] Events tracked in GA Real-time dashboard

---

## 🧪 **TESTING**

### **Test Vercel Deployment:**
1. Check Vercel dashboard: https://vercel.com/dashboard
2. See build logs and deployment status
3. **Expected:** Build succeeds, deployment live

### **Test High-Resolution Artwork:**
1. Search for "Radiohead OK Computer"
2. **Expected:** iTunes results appear first
3. Right-click first result → Inspect → Check URL
4. **Expected:** URL contains `3000x3000bb.jpg`

### **Test PDF Export:**
1. Design a label (add title, artist, artwork)
2. Click "EXPORT PDF"
3. **Expected:** Downloads `artist_title_disc-surface_2026-02-05.pdf`
4. Open PDF → Shows label at exact size
5. Print → Prints at correct physical dimensions

### **Test Google Analytics:**
1. Open site with DevTools (F12)
2. Network tab → Filter for "google"
3. **Expected:** See `gtag/js` script load
4. Perform actions (search, export)
5. Check GA dashboard → See events in real-time

---

## 📊 **CHANGES SUMMARY**

| Feature | v0.3.6 | v0.3.7c |
|---------|--------|---------|
| Deployment | PM2/Nginx | **Vercel (Git)** |
| Export Format | PNG | **PDF** |
| Print Setup | Manual scaling | **Automatic** |
| Artwork Priority | MusicBrainz first | **iTunes first (3000×3000)** |
| Analytics | None | **Google Analytics** |
| Zoom Buttons | Duplicated | **Clean UI** |
| Image Rendering | Auto | **Crisp-edges** |

---

## 🔄 **ROLLBACK**

### **Via Vercel Dashboard (easiest):**
1. Go to https://vercel.com/dashboard
2. Select project
3. Click "Deployments"
4. Find previous version
5. Click "..." → "Promote to Production"

### **Via Git:**
```bash
cd /home/daryl/md-label-fresh
git revert HEAD
git push
```

---

## 📦 **DEPENDENCIES**

- **jsPDF:** ^2.5.2 (PDF generation)
- **Next.js:** 14.2.35 (stable)
- Total bundle size increase: ~50KB

---

## 📝 **VERSION HISTORY**

- **v0.3.6:** PM2/Nginx deployment, PNG export
- **v0.3.7a:** Added PDF export, Google Analytics
- **v0.3.7b:** Added high-resolution artwork priority
- **v0.3.7c:** Migrated to Vercel deployment ← **YOU ARE HERE**

---

## 📄 **DOCUMENTATION**

- `DEPLOYMENT.md` - Complete Vercel deployment guide
- `QUICK_DEPLOY.md` - 3-step quick reference
- `ARTWORK_PRIORITY.md` - Artwork search documentation
- `ARTWORK_QUALITY_COMPARISON.md` - Quality comparison guide
- `PDF_EXPORT.md` - PDF export feature docs
- `SECURITY_AUDIT.md` - Security review (v0.3.6)

---

## 🎉 **RELEASE HIGHLIGHTS**

✨ **Vercel deployment** - Push to deploy in 60 seconds  
🎨 **9x better artwork** - iTunes 3000×3000px prioritized  
🖨️ **Print-ready PDFs** - No more scaling issues  
📊 **Usage analytics** - Understand user behavior  
🧹 **Clean UI** - Removed duplicate controls  

---

## 🔗 **LINKS**

- **Production Site:** https://minidisc-cover-designer.vercel.app (or custom domain)
- **GitHub Repo:** https://github.com/TeamZissou2025/minidisc-cover-designer
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Analytics:** Google Analytics (G-54KYPT7HFE)

---

**Status:** ✅ **DEPLOYED TO VERCEL**

**Git Commit:** cc04796  
**Deployment:** Automatic via Vercel  
**Live:** https://minidisc-cover-designer.vercel.app

---

## 🚀 **NEXT DEPLOYMENT:**

```bash
# Make changes to code
git add .
git commit -m "New feature"
git push

# Vercel auto-deploys! 🎉
```
