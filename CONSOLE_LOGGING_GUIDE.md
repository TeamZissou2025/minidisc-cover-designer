# 🔍 HOW TO VIEW CONSOLE LOGS & DEBUG ARTWORK QUALITY

**Issue:** Seeing low-quality artwork from Last.fm or iTunes thumbnails instead of high-resolution 3000×3000 images.

---

## 📋 **STEP 1: OPEN DEVELOPER CONSOLE**

### **Chrome / Edge / Brave:**
1. Right-click anywhere on the page
2. Select **"Inspect"** or **"Inspect Element"**
3. Click the **"Console"** tab at the top
4. You'll see a log of all JavaScript output

### **Keyboard Shortcuts:**
- **Windows/Linux:** `Ctrl + Shift + J`
- **Mac:** `Cmd + Option + J`
- **Firefox:** `Ctrl + Shift + K` (Windows) or `Cmd + Option + K` (Mac)

---

## 🔍 **STEP 2: SEARCH FOR AN ALBUM**

1. In the console, type: `console.clear()` and press Enter (clears old logs)
2. Search for an album (e.g., "Radiohead OK Computer")
3. Watch the console logs appear in real-time

---

## 📊 **STEP 3: READ THE LOGS**

### **What You Should See:**

```
🔍 Starting search: { artist: "Radiohead", album: "OK Computer" }
⏱️ Starting API calls with 15s timeout...
🔍 Searching for: { artist: "Radiohead", album: "OK Computer" }

📊 API call results: { 
  itunes: 'fulfilled', 
  deezer: 'fulfilled', 
  lastfm: 'fulfilled' 
}

📈 Result counts: { 
  itunes: 5, 
  deezer: 8, 
  lastfm: 12 
}

🎵 iTunes sample: {
  title: "OK Computer",
  url: "https://is1-ssl.mzstatic.com/image/thumb/.../3000x3000bb.jpg",
  resolution: "✅ 3000×3000"
}

🎶 Deezer sample: {
  title: "OK Computer",
  url: "https://e-cdns-images.dzcdn.net/.../1000x1000-000000-80-0-0.jpg",
  resolution: "✅ 1000×1000"
}

📻 Last.fm sample: {
  title: "OK Computer",
  url: "https://lastfm.freetls.fastly.net/.../300x300.jpg"
}

📊 Final results order (first 5):
   1. [itunes] Radiohead - OK Computer
   2. [itunes] Radiohead - OK Computer (Collector's Edition)
   3. [deezer] Radiohead - OK Computer
   4. [deezer] Radiohead - OK Computer OKNOTOK 1997 2017
   5. [lastfm] Radiohead - OK Computer
```

### **When You Select a Result:**

```
🎯 handleSelectResult called with: {
  title: "OK Computer",
  artist: "Radiohead",
  source: "itunes",
  artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/.../3000x3000bb.jpg"
}
✅ Setting label data with artwork: https://is1-ssl.mzstatic.com/image/thumb/.../3000x3000bb.jpg
✅ Label data updated
```

---

## ✅ **WHAT TO CHECK:**

### **1. Check iTunes URLs:**
Look for `🎵 iTunes sample:` in the logs.

**✅ GOOD (High Resolution):**
```
url: "https://is1-ssl.mzstatic.com/image/thumb/.../3000x3000bb.jpg"
resolution: "✅ 3000×3000"
```

**❌ BAD (Low Resolution):**
```
url: "https://is1-ssl.mzstatic.com/image/thumb/.../100x100bb.jpg"
resolution: "⚠️ Lower res"
```

### **2. Check Result Order:**
Look for `📊 Final results order (first 5):`

**✅ GOOD (iTunes first):**
```
1. [itunes] Radiohead - OK Computer  ← iTunes at top!
2. [itunes] ...
3. [deezer] ...
```

**❌ BAD (iTunes not first):**
```
1. [lastfm] Radiohead - OK Computer  ← Low quality first!
2. [deezer] ...
3. [itunes] ...
```

### **3. Check Selected Result:**
When you click a result, look for `🎯 handleSelectResult called with:`

**✅ GOOD:**
```
source: "itunes"
artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/.../3000x3000bb.jpg"
```

**❌ BAD:**
```
source: "lastfm"
artworkUrl: "https://ia800506.us.archive.org/3/items/..."  ← Low quality!
```

---

## 🐛 **TROUBLESHOOTING:**

### **Problem 1: Seeing Internet Archive URLs**
```
❌ https://ia800506.us.archive.org/3/items/...
```

**Cause:** You selected a Last.fm result (300×300 quality)

**Solution:** 
- Look for the **🎵 3000×3000** badge in search results
- Select results with iTunes badge (highest quality)
- iTunes results should appear FIRST in the list

---

### **Problem 2: Seeing `100x100bb` or `600x600bb` in iTunes URLs**

**Cause:** iTunes API returned low-res, or URL conversion failed

**Check Console For:**
```
⚠️ Lower res
```

**Solution:**
1. Check if iTunes API failed: `itunes: 'rejected'`
2. If fulfilled but low-res, this is a bug - report it
3. Try a different album to see if it's consistent

---

### **Problem 3: No Console Logs Appearing**

**Possible causes:**
- Console filter is set (look for dropdown that says "All levels")
- Site not loaded yet (wait for page to fully load)
- Browser extensions blocking console
- Wrong browser tab open

**Solution:**
1. Make sure Console tab is selected
2. Check filter dropdown shows "All levels" or "Verbose"
3. Try in Incognito/Private mode
4. Refresh page with `Ctrl+Shift+R`

---

### **Problem 4: Version Shows v0.3.7c or Older**

**Cause:** Vercel hasn't deployed v0.3.7d yet, or browser cache

**Solution:**
1. Check Vercel dashboard: https://vercel.com/dashboard
2. Look for latest deployment status
3. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Try Incognito/Private browsing mode
5. Wait 2-3 minutes for Vercel build to complete

---

## 🎨 **VISUAL QUALITY INDICATORS (v0.3.7d+)**

Search results now show quality badges:

- **🎵 3000×3000** = iTunes (Highest quality) ← SELECT THESE!
- **🎶 1000×1000** = Deezer (Good quality)
- **📻 300×300** = Last.fm (Acceptable fallback)

**Always select results with the 🎵 3000×3000 badge for best quality!**

---

## 📸 **STEP 4: INSPECT THE LOADED IMAGE**

After selecting a result:

1. Right-click on the artwork in the label preview
2. Select **"Inspect"** or **"Inspect Element"**
3. Look at the `<img>` tag's `src` attribute
4. Check if it contains `3000x3000bb.jpg`

**Example Good URL:**
```html
<img src="https://is1-ssl.mzstatic.com/image/thumb/Music/.../3000x3000bb.jpg">
```

**Example Bad URL:**
```html
<img src="https://ia800506.us.archive.org/3/items/...">
```

---

## 📊 **EXPECTED BEHAVIOR (v0.3.7d):**

1. ✅ iTunes results appear FIRST with **🎵 3000×3000** badge
2. ✅ Console logs show `resolution: "✅ 3000×3000"`
3. ✅ Selected artwork URL contains `3000x3000bb.jpg`
4. ✅ Exported PDF has crisp, high-resolution artwork

---

## 🆘 **STILL SEEING LOW-QUALITY ARTWORK?**

### **Check These:**

1. **Is version v0.3.7d deployed?**
   - Bottom-left of page should show "Version 0.3.7d"
   - If not, wait for Vercel deployment or hard refresh

2. **Are you selecting iTunes results?**
   - Look for **🎵 3000×3000** badge
   - iTunes results should be at the top of the list

3. **Did iTunes API return results?**
   - Check console: `itunes: 'fulfilled'` and count > 0
   - If rejected or 0 results, try different search terms

4. **Is the image actually loading?**
   - Check Network tab in DevTools
   - Filter by "Img"
   - Look for 3000x3000 image requests

---

## 📝 **REPORT A BUG:**

If iTunes shows `✅ 3000×3000` in console but you still see low-res images:

1. Take screenshot of console logs
2. Copy the full iTunes URL from console
3. Copy the URL that's actually loading (right-click image → Copy Image Address)
4. Note the album/artist you searched for
5. Report with all this information

---

**Last Updated:** 2026-02-05  
**Version:** v0.3.7d  
**Feature:** Console logging + Quality badges
