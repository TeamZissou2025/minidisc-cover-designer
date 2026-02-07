# v0.3.7a - RELEASE NOTES

**Date:** February 6, 2026  
**Type:** Analytics + Export Fix  
**Next.js Version:** 14.2.35 ✅

---

## 🎯 **MAJOR CHANGES**

### 1. **PDF Export** (Print-Ready)
- ✅ **Replaced PNG with PDF export**
- ✅ **Prints at exact physical dimensions** (37mm × 53mm, etc.)
- ✅ **No manual scaling needed** - Works with any printer settings
- ✅ **Professional format** - Industry standard
- ✅ **Descriptive filenames** - `artist_title_template_date.pdf`

### 2. **Google Analytics**
- ✅ **Measurement ID:** G-54KYPT7HFE
- ✅ **Page view tracking** - Understand traffic
- ✅ **Event tracking:**
  - `export_label` - Label exports
  - `submit_feedback` - User feedback
  - `search_album` - Album searches
  - `select_template` - Format changes

### 3. **UI Polish**
- ✅ **Removed duplicate zoom buttons** below canvas
- ✅ **Export button** now says "EXPORT PDF"
- ✅ **Version numbers synced** - v0.3.7a everywhere

---

## 🔒 **SECURITY (Unchanged from v0.3.6)**

All security fixes remain active:
- ✅ Rate limiting (5 req/hour per IP)
- ✅ Input validation (message, type, email)
- ✅ Security headers (XSS, clickjacking protection)
- ✅ PM2 running as regular user (not root)
- ✅ Secrets protected (.gitignore)

---

## 📦 **DEPLOYMENT**

### **IMPORTANT: npm install required on production**

```bash
cd /home/daryl/md-label-fresh

# Deploy files
sudo cp -r .next /var/www/minidisc.squirclelabs.uk/
sudo cp package.json /var/www/minidisc.squirclelabs.uk/
sudo cp package-lock.json /var/www/minidisc.squirclelabs.uk/
sudo cp .env.local /var/www/minidisc.squirclelabs.uk/.env.production.local

# Install NEW dependency (jsPDF)
cd /var/www/minidisc.squirclelabs.uk
sudo npm install --production

# Restart PM2
pm2 restart minidisc

# Verify
pm2 logs minidisc --lines 20
```

---

## ✅ **VERIFICATION CHECKLIST**

After deployment:

- [ ] Site loads correctly
- [ ] Export button says "EXPORT PDF"
- [ ] Clicking export downloads a `.pdf` file (not `.png`)
- [ ] PDF opens correctly in Preview/Adobe Reader
- [ ] PDF shows correct dimensions in properties
- [ ] Google Analytics script loads (check Network tab)
- [ ] Events tracked in GA Real-time dashboard

---

## 🧪 **TESTING**

### **Test PDF Export:**
1. Design a label (add title, artist, artwork)
2. Click "EXPORT PDF"
3. **Expected:** Downloads `artist_title_disc-surface_2026-02-06.pdf`
4. Open PDF → Should show label at exact size
5. Print → Prints at correct physical dimensions
6. Measure with ruler → Should be 37mm × 53mm

### **Test Google Analytics:**
1. Open site with DevTools (F12)
2. Network tab → Filter for "google"
3. **Expected:** See `gtag/js` script load
4. Perform actions (search, export, etc.)
5. Check GA dashboard → See events in real-time

---

## 📊 **CHANGES SUMMARY**

| Feature | v0.3.6 | v0.3.7a |
|---------|--------|---------|
| Export Format | PNG | **PDF** |
| Print Setup | Manual scaling | **Automatic** |
| Analytics | None | **Google Analytics** |
| Zoom Buttons | Duplicated | **Clean UI** |
| Image Rendering | Auto | **Crisp-edges** |

---

## 🔄 **ROLLBACK**

If PDF export has issues, restore v0.3.6:

```bash
cd /home/daryl/md-label-fresh
./restore.sh 20260206-175106
```

---

## 📦 **NEW DEPENDENCIES**

- **jsPDF:** ^2.5.2 (PDF generation)
- Total bundle size increase: ~50KB (acceptable)

---

## 🎉 **RELEASE HIGHLIGHTS**

✨ **Print-ready PDFs** - No more scaling issues  
📊 **Usage analytics** - Understand user behavior  
🎨 **Crisp images** - High-quality rendering  
🧹 **Clean UI** - Removed duplicate controls  

---

**Status:** ✅ **READY TO DEPLOY**

**Remember:** Run `npm install` on production server to get jsPDF!
