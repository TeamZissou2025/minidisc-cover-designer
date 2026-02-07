# 🔍 ACTIVE APIS & IMAGE QUALITY ANALYSIS

**Last Updated:** 2026-02-05  
**Version:** v0.3.7d

---

## 📡 **ACTIVE APIS (in priority order):**

### **1. iTunes Search API** 🎵

**Endpoint:**
```
https://itunes.apple.com/search?term={query}&entity=album&limit=20&media=music
```

**Returns:**
- `artworkUrl100`: Thumbnail path (e.g., `/image/thumb/.../100x100bb.jpg`)

**What We Do:**
```typescript
artworkUrl: item.artworkUrl100?.replace('100x100bb', '3000x3000bb')
```

**Result:**
```
https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/07/60/ba/0760ba0f-148c-b18f-d0ff-169ee96f3af5/634904078164.png/3000x3000bb.jpg
```

**⚠️ NOTE:** The path WILL contain `/image/thumb/` - **this is normal!**

Despite the "thumb" in the path, iTunes allows requesting different sizes by changing the filename:
- `/100x100bb.jpg` = 100×100 thumbnail
- `/600x600bb.jpg` = 600×600 medium
- `/3000x3000bb.jpg` = 3000×3000 **high-resolution** ✅

**Verified Working:** Yes (HTTP 200 response confirmed)

---

### **2. Deezer API** 🎶

**Endpoint:**
```
https://api.deezer.com/search/album?q={query}&limit=20
```

**Returns:**
- `cover_small`: 56×56
- `cover_medium`: 250×250
- `cover_big`: 500×500
- `cover_xl`: 1000×1000 ✅

**What We Use:**
```typescript
artworkUrl: item.cover_xl || item.cover_big || item.cover_medium
```

**Result:**
```
https://e-cdns-images.dzcdn.net/images/cover/{hash}/1000x1000-000000-80-0-0.jpg
```

**Quality:** 1000×1000 (1,000,000 pixels)

---

### **3. Last.fm API** 📻

**Endpoint:**
```
https://ws.audioscrobbler.com/2.0/?method=album.search&album={query}&api_key={key}&format=json&limit=20
```

**API Key:** `6d43fd481fed3e5946df5b87c6d2aa89` (public, free)

**Returns (image array with sizes):**
- `small`: 34×34
- `medium`: 64×64
- `large`: 174×174
- `extralarge`: 300×300 ✅

**What We Use:**
```typescript
const largestImage = images.find((img: any) => img.size === 'extralarge') || 
                    images.find((img: any) => img.size === 'large') ||
                    images[images.length - 1]
```

**Result:**
```
https://lastfm.freetls.fastly.net/i/u/300x300/{hash}.png
OR
https://ia800506.us.archive.org/3/items/mbid-{id}/...
```

**Quality:** 300×300 (90,000 pixels) - **Low quality fallback**

---

## 🔍 **WHY YOU SEE `/image/thumb/` IN iTunes URLS:**

### **This is NORMAL and CORRECT!** ✅

iTunes stores all artwork (including high-res) in the `/image/thumb/` directory structure. The actual resolution is determined by the filename:

**Example URL breakdown:**
```
https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/07/60/ba/0760ba0f-148c-b18f-d0ff-169ee96f3af5/634904078164.png/3000x3000bb.jpg
                                ^^^^^^^^^^^                                                                                        ^^^^^^^^^^^^^
                                Path prefix                                                                                        Size parameter
                                (always "thumb")                                                                                  (what determines quality)
```

The word "thumb" in the path is misleading - it's just Apple's CDN structure. The actual size is in the filename.

---

## 📊 **QUALITY COMPARISON:**

| Source | URL Pattern | Resolution | Pixels | Quality |
|--------|-------------|-----------|--------|---------|
| **iTunes** | `/image/thumb/.../3000x3000bb.jpg` | 3000×3000 | 9,000,000 | ⭐⭐⭐⭐⭐ Best |
| **Deezer** | `/images/cover/.../1000x1000-000000-80-0-0.jpg` | 1000×1000 | 1,000,000 | ⭐⭐⭐⭐ Good |
| **Last.fm** | `/i/u/300x300/{hash}.png` | 300×300 | 90,000 | ⭐⭐⭐ Acceptable |
| **Last.fm (Internet Archive)** | `/ia800506.us.archive.org/...` | Variable | ~90,000 | ⭐⭐ Low |

---

## 🧪 **HOW TO VERIFY IMAGE QUALITY:**

### **Method 1: Check Console Logs**

After searching, look for:
```
🎵 iTunes sample: {
  title: "OK Computer",
  url: "https://is1-ssl.mzstatic.com/image/thumb/.../3000x3000bb.jpg",
  resolution: "✅ 3000×3000"  ← This confirms it's high-res!
}
```

**Key:** Look for `3000x3000bb.jpg` in the URL, NOT the `/thumb/` part.

---

### **Method 2: Download and Check Image Properties**

1. Select an iTunes result (with 🎵 3000×3000 badge)
2. Export as PDF
3. Extract image from PDF or screenshot at 100% zoom
4. Right-click image → Properties
5. Check dimensions: Should be 3000×3000 pixels

---

### **Method 3: Inspect Network Request**

1. Open DevTools (`F12`)
2. Click **Network** tab
3. Filter by **Img**
4. Select a result with 🎵 badge
5. Look for image request
6. Click on it and check **Headers** tab
7. `Content-Length` should be ~500KB-2MB for 3000×3000
8. Click **Preview** tab to see actual image
9. Right-click → "Open image in new tab"
10. Check browser shows "3000 × 3000" in tab or title

---

### **Method 4: URL Pattern Check**

**iTunes URLs should look like:**
```
✅ https://is1-ssl.mzstatic.com/image/thumb/Music{number}/v4/{hash}/{uuid}.png/3000x3000bb.jpg
```

**Key parts:**
- ✅ `3000x3000bb.jpg` at the end
- ✅ `/image/thumb/` in the middle (normal!)
- ⚠️ `100x100bb.jpg` or `600x600bb.jpg` = wrong (low-res)

---

## 🐛 **KNOWN ISSUES:**

### **Issue 1: Last.fm Internet Archive URLs**

**Symptom:**
```
https://ia800506.us.archive.org/3/items/...
```

**Cause:** You selected a Last.fm result (📻 300×300 badge)

**Solution:** Select results with 🎵 3000×3000 badge instead

---

### **Issue 2: iTunes Returns 100x100 Instead of 3000x3000**

**Symptom:**
```
❌ url: "https://is1-ssl.mzstatic.com/image/thumb/.../100x100bb.jpg"
⚠️ Lower res
```

**Possible Causes:**
1. iTunes API didn't return `artworkUrl100` field
2. URL replacement failed
3. Album doesn't have high-res artwork

**Debug:**
1. Check console for `🎵 iTunes sample:`
2. If shows `⚠️ Lower res`, this is a bug
3. Try searching for a different, popular album
4. If consistent, report with console logs

---

### **Issue 3: Deezer URLs Instead of iTunes**

**Symptom:** First results show 🎶 1000×1000 instead of 🎵 3000×3000

**Cause:** iTunes API failed or returned no results

**Check Console:**
```
📊 API call results: {
  itunes: 'rejected'  ← iTunes failed!
  deezer: 'fulfilled',
  lastfm: 'fulfilled'
}
```

**Solution:**
1. Try different search terms
2. Check if artist/album name is exact
3. Some albums may not be on iTunes

---

## 🔬 **TESTING CHECKLIST:**

To verify everything is working:

### **1. Check APIs are responding:**
```
📊 API call results: {
  itunes: 'fulfilled' ✅
  deezer: 'fulfilled' ✅
  lastfm: 'fulfilled' ✅
}
```

### **2. Check iTunes returns results:**
```
📈 Result counts: {
  itunes: 5 ✅ (should be > 0)
  deezer: 8 ✅
  lastfm: 12 ✅
}
```

### **3. Check iTunes URLs have 3000x3000:**
```
🎵 iTunes sample: {
  url: "https://is1-ssl.mzstatic.com/image/thumb/.../3000x3000bb.jpg" ✅
  resolution: "✅ 3000×3000" ✅
}
```

### **4. Check result order (iTunes first):**
```
📊 Final results order (first 5):
   1. [itunes] ... ✅
   2. [itunes] ... ✅
   3. [deezer] ...
```

### **5. Check selected result uses high-res URL:**
```
🎯 handleSelectResult called with: {
  source: "itunes" ✅
  artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/.../3000x3000bb.jpg" ✅
}
```

### **6. Check URL Analysis:**
```
🔍 URL Analysis: {
  hasThumb: true ← Normal for iTunes!
  has3000x3000: true ✅ ← This is what matters!
  fullURL: "https://is1-ssl.mzstatic.com/image/thumb/.../3000x3000bb.jpg"
}
```

---

## ✅ **SUMMARY:**

**Current APIs:**
1. iTunes (3000×3000) - BEST ✅
2. Deezer (1000×1000) - Good ✅
3. Last.fm (300×300) - Fallback ✅

**iTunes `/image/thumb/` is NORMAL** - don't be alarmed!

**What matters:** The filename ending (`3000x3000bb.jpg`)

**How to verify:** Check console logs for `✅ 3000×3000` confirmation

---

**If you see `/image/thumb/` in URLs but they end in `3000x3000bb.jpg`, your images ARE high-resolution!**
