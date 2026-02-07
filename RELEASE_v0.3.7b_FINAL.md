# v0.3.7b - RELEASE NOTES

**Date:** February 5, 2026  
**Type:** Analytics + Export Fix + Artwork Priority  
**Next.js Version:** 14.2.35 ✅

---

## 🎯 **MAJOR CHANGES**

### 1. **PDF Export** (Print-Ready)
- ✅ **Replaced PNG with PDF export**
- ✅ **Prints at exact physical dimensions** (37mm × 53mm, etc.)
- ✅ **No manual scaling needed** - Works with any printer settings
- ✅ **Professional format** - Industry standard
- ✅ **Descriptive filenames** - `artist_title_template_date.pdf`

### 2. **High-Resolution Artwork Priority** (NEW in v0.3.7b)
- ✅ **Search order changed** - iTunes first, then Deezer, then MusicBrainz
- ✅ **iTunes prioritized** - 3000×3000px images (9x better than before!)
- ✅ **Better default artwork** - Highest quality appears first in results
- ✅ **Improved exports** - PDFs use maximum resolution artwork

**Why this matters:**
- **Before v0.3.7b:** MusicBrainz (variable) → Deezer (1000×1000) → iTunes (3000×3000)
- **After v0.3.7b:** iTunes (3000×3000) → Deezer (1000×1000) → MusicBrainz (variable)

### 3. **Google Analytics**
- ✅ **Measurement ID:** G-54KYPT7HFE
- ✅ **Page view tracking** - Understand traffic
- ✅ **Event tracking:**
  - `export_label` - Label exports
  - `submit_feedback` - User feedback
  - `search_album` - Album searches
  - `select_template` - Format changes

### 4. **UI Polish**
- ✅ **Removed duplicate zoom buttons** below canvas
- ✅ **Export button** now says "EXPORT PDF"
- ✅ **Version numbers synced** - v0.3.7b everywhere

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
- [ ] Version shows "v0.3.7b" in header and bottom-left
- [ ] Export button says "EXPORT PDF"
- [ ] Clicking export downloads a `.pdf` file (not `.png`)
- [ ] PDF opens correctly in Preview/Adobe Reader
- [ ] PDF shows correct dimensions in properties
- [ ] **Search "Radiohead OK Computer"** → iTunes results appear first
- [ ] **Image URLs contain `3000x3000bb.jpg`** (not 100x100 or 600x600)
- [ ] Google Analytics script loads (check Network tab)
- [ ] Events tracked in GA Real-time dashboard

---

## 🧪 **TESTING**

### **Test PDF Export:**
1. Design a label (add title, artist, artwork)
2. Click "EXPORT PDF"
3. **Expected:** Downloads `artist_title_disc-surface_2026-02-05.pdf`
4. Open PDF → Should show label at exact size
5. Print → Prints at correct physical dimensions
6. Measure with ruler → Should be 37mm × 53mm

### **Test High-Resolution Artwork:**
1. Search for "Radiohead OK Computer"
2. **Expected:** iTunes results appear first
3. Right-click first result image → Inspect → Check URL
4. **Expected:** URL contains `3000x3000bb.jpg` (not `100x100bb`)
5. Console log shows: `itunes: 'fulfilled'` before other sources
6. Export label → PDF artwork is crisp and high-quality

### **Test Google Analytics:**
1. Open site with DevTools (F12)
2. Network tab → Filter for "google"
3. **Expected:** See `gtag/js` script load
4. Perform actions (search, export, etc.)
5. Check GA dashboard → See events in real-time

---

## 📊 **CHANGES SUMMARY**

| Feature | v0.3.6 | v0.3.7b |
|---------|--------|---------|
| Export Format | PNG | **PDF** |
| Print Setup | Manual scaling | **Automatic** |
| Artwork Priority | MusicBrainz first | **iTunes first (3000×3000)** |
| Analytics | None | **Google Analytics** |
| Zoom Buttons | Duplicated | **Clean UI** |
| Image Rendering | Auto | **Crisp-edges** |

---

## 🔄 **ROLLBACK**

If PDF export or artwork priority has issues, restore v0.3.6:

```bash
cd /home/daryl/md-label-fresh
./restore.sh 20260206-175106
```

---

## 📦 **NEW DEPENDENCIES**

- **jsPDF:** ^2.5.2 (PDF generation)
- Total bundle size increase: ~50KB (acceptable)

---

## 📝 **CODE CHANGES (v0.3.7b)**

### **Search Order (app/page.tsx, lines 516-520)**
```typescript
// OLD (v0.3.7a and earlier):
const results = await Promise.allSettled([
  searchMusicBrainz(...), // Low quality first
  searchDeezer(...),
  searchiTunes(...)       // High quality last
])

// NEW (v0.3.7b):
const results = await Promise.allSettled([
  searchiTunes(...),      // 3000×3000 - HIGHEST QUALITY FIRST
  searchDeezer(...),      // 1000×1000 - Second
  searchMusicBrainz(...)  // Variable - Last
])
```

### **Result Display Order (app/page.tsx, line 544)**
```typescript
// OLD:
return [...mbResults, ...deezerResults, ...itunesResults]

// NEW:
return [...itunesResults, ...deezerResults, ...mbResults]
```

---

## 🎉 **RELEASE HIGHLIGHTS**

✨ **Print-ready PDFs** - No more scaling issues  
🎨 **9x better artwork** - iTunes 3000×3000px prioritized  
📊 **Usage analytics** - Understand user behavior  
🧹 **Clean UI** - Removed duplicate controls  

---

## 📄 **DOCUMENTATION**

- `ARTWORK_PRIORITY.md` - Full artwork priority documentation
- `PDF_EXPORT.md` - PDF export feature documentation
- `SECURITY_AUDIT.md` - Security audit report (v0.3.6)
- `BACKUPS.md` - Backup and restore procedures

---

**Status:** ✅ **READY TO DEPLOY**

**Remember:** 
1. Run `npm install` on production server to get jsPDF!
2. Test artwork priority: Search "Radiohead OK Computer" → iTunes results first
3. Verify PDF exports at correct physical dimensions
