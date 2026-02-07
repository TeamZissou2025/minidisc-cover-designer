# 🧪 TESTING SPOTIFY INTEGRATION

## 📋 **HOW TO CHECK IF IT'S WORKING:**

### **Method 1: Search an Album and Check Console**

1. **Hard refresh** the site: `Ctrl+Shift+R`
2. **Open Console**: `F12` → Console tab
3. **Search for any album** (e.g., "Taylor Swift 1989")
4. **Look for these logs:**

```
📊 API call results: {
  itunes: 'fulfilled',
  spotify: 'fulfilled', ← Should say 'fulfilled' (not 'rejected')!
  deezer: 'fulfilled',
  lastfm: 'fulfilled'
}

📈 Result counts: {
  itunes: 5,
  spotify: 8, ← Should have results!
  deezer: 3,
  lastfm: 12
}

🎧 Spotify sample: {
  title: "1989",
  url: "https://i.scdn.co/image/...",
  resolution: "640×640"
}
```

---

### **Method 2: Look for 🎧 Badges**

In the search results, you should see:
- 🎵 **3000×3000** = iTunes
- 🎧 **640×640** = Spotify **(NEW - if working!)**
- 🎶 **1000×1000** = Deezer
- 📻 **300×300** = Last.fm

---

### **Method 3: Test API Endpoint Directly**

Open this URL in your browser:
```
https://minidisc.squirclelabs.uk/api/proxy/spotify?q=radiohead
```

**If working:**
```json
{
  "albums": {
    "items": [...]
  }
}
```

**If not working:**
```json
{
  "error": "Spotify API failed",
  "message": "Failed to get Spotify token"
}
```

Or HTTP 404 if endpoint doesn't exist yet.

---

## 🐛 **TROUBLESHOOTING:**

### **Problem 1: Spotify shows 'rejected' in console**

**Check Console Error:**
```
❌ Spotify failed: Error: Failed to get Spotify token
```

**Cause:** Missing or incorrect credentials in Vercel

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Verify both exist:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
3. Check for typos
4. Redeploy

---

### **Problem 2: Endpoint returns 404**

**Cause:** Latest deployment hasn't propagated yet

**Solution:**
1. Wait 2-3 more minutes
2. Hard refresh: `Ctrl+Shift+R`
3. Check Vercel dashboard for deployment status

---

### **Problem 3: No 🎧 badges appear**

**Cause:** Spotify returned 0 results

**Possible reasons:**
- Search terms too specific
- API failed silently
- No matches found

**Check console for:** `spotify: 0` in result counts

---

## ✅ **WHEN IT'S WORKING:**

You'll see:
- ✅ Console shows `spotify: 'fulfilled'`
- ✅ Console shows `spotify: X` results (X > 0)
- ✅ Search results have 🎧 **640×640** badges
- ✅ `/api/proxy/spotify?q=test` returns JSON (not 404)
- ✅ More albums found (better coverage than iTunes alone)

---

## 🚨 **CURRENT STATUS CHECK:**

Run these commands in your browser console:

```javascript
// Test if Spotify endpoint exists
fetch('/api/proxy/spotify?q=test')
  .then(r => r.json())
  .then(d => console.log('✅ Spotify:', d))
  .catch(e => console.error('❌ Spotify:', e))
```

---

**What are you seeing in the console when you search? That will tell us if Spotify is working!**
