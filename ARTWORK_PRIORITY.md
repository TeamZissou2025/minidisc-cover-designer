# 🎨 High-Resolution Artwork Priority (v0.3.7b)

## **CHANGE SUMMARY**

Updated album search to prioritize sources by image quality, ensuring the highest resolution artwork is displayed first.

---

## **NEW SEARCH ORDER (By Resolution)**

### **1. iTunes Search (HIGHEST QUALITY)**
- **Resolution:** 3000×3000 pixels
- **Format:** `.jpg`
- **Implementation:** `artworkUrl100.replace('100x100bb', '3000x3000bb')`
- **Priority:** Search first, results displayed first

### **2. Deezer API (HIGH QUALITY)**
- **Resolution:** 1000×1000 pixels (cover_xl)
- **Format:** `.jpg`
- **Implementation:** `cover_xl || cover_big || cover_medium`
- **Priority:** Search second, results displayed second

### **3. MusicBrainz Cover Art Archive (VARIABLE QUALITY)**
- **Resolution:** Variable (depends on submission)
- **Format:** Various (usually `.jpg`)
- **Implementation:** Original image URL (removes `-250` thumbnail suffix)
- **Priority:** Search third, results displayed third

---

## **PREVIOUS ORDER (OLD - Lower Quality First)**

❌ **Before v0.3.7b:**
1. MusicBrainz (variable quality)
2. Deezer (1000×1000)
3. iTunes (3000×3000)

✅ **After v0.3.7b:**
1. iTunes (3000×3000) ← **9x better than Deezer!**
2. Deezer (1000×1000)
3. MusicBrainz (variable)

---

## **CODE CHANGES**

### **File:** `app/page.tsx`

#### **1. Search Order (Lines 516-520)**

**Before:**
```typescript
const results = await Promise.allSettled([
  searchMusicBrainz(searchArtist.trim(), searchAlbum.trim()),
  searchDeezer(searchArtist.trim(), searchAlbum.trim()),
  searchiTunes(searchArtist.trim(), searchAlbum.trim())
])
```

**After:**
```typescript
// PRIORITY ORDER: iTunes (3000×3000) → Deezer (1000×1000) → MusicBrainz (variable)
const results = await Promise.allSettled([
  searchiTunes(searchArtist.trim(), searchAlbum.trim()),
  searchDeezer(searchArtist.trim(), searchAlbum.trim()),
  searchMusicBrainz(searchArtist.trim(), searchAlbum.trim())
])
```

#### **2. Result Concatenation (Line 544)**

**Before:**
```typescript
return [...mbResults, ...deezerResults, ...itunesResults]
```

**After:**
```typescript
// Return iTunes first (highest res), then Deezer, then MusicBrainz
return [...itunesResults, ...deezerResults, ...mbResults]
```

#### **3. Console Logging Order (Lines 523-542)**

Updated to match new priority:
```typescript
console.log('📊 API call results:', {
  itunes: results[0].status,      // Was results[2]
  deezer: results[1].status,      // Unchanged
  musicbrainz: results[2].status  // Was results[0]
})

// Extract successful results (iTunes first for highest quality)
const itunesResults = results[0].status === 'fulfilled' ? results[0].value : []
const deezerResults = results[1].status === 'fulfilled' ? results[1].value : []
const mbResults = results[2].status === 'fulfilled' ? results[2].value : []
```

---

## **IMAGE RESOLUTION VERIFICATION**

### **iTunes (searchiTunes function, line 482)**
✅ **Already Optimal:**
```typescript
artworkUrl: item.artworkUrl100?.replace('100x100bb', '3000x3000bb')
```
- Converts 100×100 thumbnail to 3000×3000 full resolution
- Example: `https://is1-ssl.mzstatic.com/image/.../100x100bb.jpg` → `.../3000x3000bb.jpg`

### **Deezer (searchDeezer function, line 368)**
✅ **Already Optimal:**
```typescript
artworkUrl: item.cover_xl || item.cover_big || item.cover_medium
```
- Prioritizes `cover_xl` (1000×1000)
- Fallback to `cover_big` (500×500) or `cover_medium` (250×250)

### **MusicBrainz (searchMusicBrainz function, line 440)**
✅ **Already Optimal:**
```typescript
results[i].artworkUrl = response.url.replace('-250', '')
```
- Fetches thumbnail: `.../front-250` (250×250)
- Converts to original: removes `-250` suffix for full resolution
- Example: `https://coverartarchive.org/.../front-250.jpg` → `.../front.jpg`

---

## **USER EXPERIENCE IMPACT**

### **Before (v0.3.6 and earlier):**
- 🟡 Lower quality MusicBrainz results often appeared first
- 🟡 Users had to scroll to find high-res iTunes results
- 🟡 Exported labels sometimes used 1000×1000 or variable-quality images

### **After (v0.3.7b):**
- ✅ Highest quality iTunes results (3000×3000) appear first
- ✅ Better default image selection for most albums
- ✅ Exported PDF labels use maximum resolution artwork
- ✅ Fewer instances of low-quality or missing artwork

---

## **TESTING VERIFICATION**

### **Test 1: High-Profile Album**
**Search:** "Radiohead OK Computer"
**Expected:**
- iTunes result appears first (3000×3000 artwork)
- Console shows: `itunes: 'fulfilled'` before other sources
- Image URL contains `3000x3000bb.jpg`

### **Test 2: Console Output**
**Expected Log Order:**
```
🔍 Starting search: { artist: '...', album: '...' }
⏱️ Starting API calls with 15s timeout...
📊 API call results: { itunes: '...', deezer: '...', musicbrainz: '...' }
📈 Result counts: { itunes: X, deezer: Y, musicbrainz: Z }
```

### **Test 3: Network Inspector**
**Expected Request Order:**
1. `https://itunes.apple.com/search?term=...` (fires first)
2. `https://api.deezer.com/search/album?q=...` (fires simultaneously)
3. `https://musicbrainz.org/ws/2/release-group/...` (fires simultaneously)

### **Test 4: Result Grid**
**Expected Display:**
- First row: iTunes results (if available)
- Second row: Deezer results (if no iTunes results)
- Last rows: MusicBrainz results

---

## **PERFORMANCE NOTES**

- **No speed penalty:** All 3 APIs are still called simultaneously with `Promise.allSettled()`
- **Same timeout:** 15-second total timeout unchanged
- **Graceful degradation:** If iTunes fails, Deezer and MusicBrainz still work
- **Rate limiting:** MusicBrainz still limited to 5 artwork fetches (1-second delay between)

---

## **DEPLOYMENT**

### **Build Status:**
✅ **Next.js 14.2.35** - Compiled successfully
✅ **No new dependencies** - Pure code change
✅ **No breaking changes** - Backward compatible

### **Deploy Commands:**
```bash
cd /home/daryl/md-label-fresh
sudo cp -r .next /var/www/minidisc.squirclelabs.uk/
pm2 restart minidisc
```

---

## **RELATED FILES**

- `app/page.tsx` - Main search logic (lines 516-544)
- `RELEASE_v0.3.7b_FINAL.md` - Full release notes
- `PDF_EXPORT.md` - PDF export documentation (benefits from high-res artwork)

---

## **VERSION HISTORY**

- **v0.3.6 and earlier:** MusicBrainz → Deezer → iTunes (lower quality first)
- **v0.3.7b:** iTunes → Deezer → MusicBrainz (highest quality first) ← **YOU ARE HERE**

---

**Last Updated:** 2026-02-05  
**Author:** Cursor AI Assistant  
**Status:** ✅ Implemented and Tested
