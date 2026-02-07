# 🎧 SPOTIFY API INTEGRATION

## ✅ **SETUP COMPLETE!**

Spotify has been added as the **2nd priority source** (after iTunes, before Deezer).

---

## 🔑 **NEXT STEP: ADD YOUR SECRET**

### **1. Get Your Client Secret:**

1. Go to: https://developer.spotify.com/dashboard/ed84904b5c4042e5becec2d600031205/settings
2. Click **"View client secret"**
3. Copy the secret

### **2. Add to `.env.local`:**

Open `/home/daryl/md-label-fresh/.env.local` and replace `YOUR_SECRET_HERE`:

```env
SPOTIFY_CLIENT_ID=ed84904b5c4042e5becec2d600031205
SPOTIFY_CLIENT_SECRET=paste_your_actual_secret_here
```

**IMPORTANT:** Don't share this file or commit it to Git! (It's already in `.gitignore`)

---

## 🚀 **THEN BUILD & DEPLOY:**

```bash
cd /home/daryl/md-label-fresh
npm run build
git add .
git commit -m "Add Spotify API integration (4th source)"
git push
```

**Note:** The `.env.local` file will NOT be committed (it's in `.gitignore` for security).

---

## 📊 **NEW SEARCH PRIORITY:**

After deployment, searches will use:

1. **iTunes** (3000×3000) - Highest quality
2. **Spotify** (640×640) - **NEW!** Best modern coverage
3. **Deezer** (1000×1000) - Good European coverage
4. **Last.fm** (300×300) - Final fallback

---

## 🎯 **QUALITY BADGES:**

Search results will now show:
- 🎵 **3000×3000** = iTunes
- 🎧 **640×640** = Spotify **(NEW!)**
- 🎶 **1000×1000** = Deezer
- 📻 **300×300** = Last.fm

---

## ✅ **VERCEL ENVIRONMENT VARIABLES:**

You'll also need to add the Spotify credentials to Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `SPOTIFY_CLIENT_ID` = `ed84904b5c4042e5becec2d600031205`
   - `SPOTIFY_CLIENT_SECRET` = (paste your secret)
5. Click **"Save"**
6. Redeploy

---

## 🧪 **TEST IT:**

After deploying, search for an album and check console logs:

```
📊 API call results: { 
  itunes: 'fulfilled', 
  spotify: 'fulfilled', ← Should see this now!
  deezer: 'fulfilled', 
  lastfm: 'fulfilled' 
}
```

---

## 📝 **FEATURES:**

- ✅ Client Credentials auth (automatic token refresh)
- ✅ Filters albums only (no singles/EPs)
- ✅ Fuzzy matching with artist/album
- ✅ Caches tokens for 1 hour
- ✅ 640×640 artwork (good quality)
- ✅ Massive catalog coverage

---

**Ready! Just add your secret to `.env.local`, then build and deploy!** 🎉
