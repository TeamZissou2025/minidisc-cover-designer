# Discogs API Debugging Guide

## Changes Made

### ✅ Fixed Authentication Format
**Before:** Incorrectly mixing URL params and headers  
**After:** Correctly using URL params only (key & secret)

### ✅ Added Comprehensive Logging

The Discogs proxy now logs:
1. **Request Info**: Query, timestamp
2. **Credentials Check**: Key exists, length, preview
3. **URL Construction**: Endpoint, parameters
4. **Response Status**: HTTP code, headers, rate limits
5. **Error Details**: Full error body from Discogs
6. **Success Info**: Result count, first result preview

---

## How to View Logs

### Option 1: Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project: `minidisc-cover-designer`
3. Click **"Functions"** tab
4. Click on `/api/proxy/discogs` 
5. View real-time logs

### Option 2: Vercel CLI
```bash
cd /home/daryl/md-label-fresh
vercel logs --follow
```

### Option 3: Browser Console (Client-Side)
1. Open https://minidisc.squirclelabs.uk
2. Open Dev Tools (F12) → Console tab
3. Search for an album
4. Look for `💿 Discogs` or `❌ Discogs` messages

---

## What to Look For

### 🔑 Credentials Check
```
🔑 Discogs Credentials Check: {
  keyExists: true,
  keyLength: 40,
  keyPreview: "abcd1234...",
  secretExists: true,
  secretLength: 40
}
```

**If `keyExists: false`:**
- Environment variable not set in Vercel
- Run: `vercel env add NEXT_PUBLIC_DISCOGS_KEY production`

**If `keyLength: 0`:**
- Variable exists but is empty
- Check Vercel dashboard → Settings → Environment Variables

---

### 📡 Response Status
```
📡 Discogs Response: {
  status: 200,
  statusText: "OK",
  ok: true,
  headers: {
    "x-discogs-ratelimit": "60",
    "x-discogs-ratelimit-remaining": "58"
  }
}
```

**Common Status Codes:**

**200 OK** ✅ - Success
- Credentials valid
- Query successful

**401 Unauthorized** ❌ - Invalid credentials
- Check Consumer Key is correct
- Check Consumer Secret (if provided)
- Get new credentials at: https://www.discogs.com/settings/developers

**429 Too Many Requests** ⚠️ - Rate limit hit
- Unauthenticated: 60 requests/minute
- Authenticated: 240 requests/minute
- Wait 60 seconds and try again

**404 Not Found** ❌ - Wrong endpoint
- Check URL construction
- Should be: `https://api.discogs.com/database/search`

**500 Internal Server Error** ❌ - Discogs API issue
- Usually temporary
- Try again in a few minutes

---

### ❌ Error Response Example
```json
❌ Discogs API Error: {
  status: 401,
  statusText: "Unauthorized",
  body: {
    "message": "Invalid consumer key"
  }
}
```

**Action:** Get valid Consumer Key from Discogs

---

### ✅ Success Response Example
```
✅ Discogs Success: {
  resultsCount: 15,
  pagination: { pages: 3, items: 45 }
}

📀 First result sample: {
  title: "Pink Floyd - The Wall",
  year: "1979",
  hasCoverImage: true
}
```

---

## Testing the Fix

### 1. Test Locally (If Credentials in .env.local)
```bash
cd /home/daryl/md-label-fresh
npm run dev
```

Navigate to http://localhost:3000 and search for:
- "Pink Floyd The Wall"
- "The Cure Disintegration"
- "Radiohead OK Computer"

### 2. Test on Vercel (After Deployment)
1. Wait ~30-60 seconds for deployment
2. Go to https://minidisc.squirclelabs.uk
3. Search for an album
4. Check browser console for Discogs logs

---

## Verifying Environment Variables

### Check if Set
```bash
vercel env ls
```

Should show:
```
NEXT_PUBLIC_DISCOGS_KEY    Production
DISCOGS_SECRET            Production
```

### Add if Missing
```bash
# Consumer Key (required)
vercel env add NEXT_PUBLIC_DISCOGS_KEY production

# Consumer Secret (optional, for higher rate limits)
vercel env add DISCOGS_SECRET production
```

### Update if Wrong
```bash
vercel env rm NEXT_PUBLIC_DISCOGS_KEY production
vercel env add NEXT_PUBLIC_DISCOGS_KEY production
```

---

## Common Issues & Solutions

### Issue: "Discogs API not configured"
**Cause:** `NEXT_PUBLIC_DISCOGS_KEY` not set  
**Solution:**
```bash
vercel env add NEXT_PUBLIC_DISCOGS_KEY production
# Paste your Consumer Key when prompted
```

### Issue: "401 Unauthorized"
**Cause:** Invalid Consumer Key or Secret  
**Solution:**
1. Go to: https://www.discogs.com/settings/developers
2. Verify your Consumer Key
3. Update in Vercel:
```bash
vercel env rm NEXT_PUBLIC_DISCOGS_KEY production
vercel env add NEXT_PUBLIC_DISCOGS_KEY production
```

### Issue: "429 Too Many Requests"
**Cause:** Rate limit exceeded (60 req/min without secret)  
**Solution:** Add Consumer Secret for 240 req/min:
```bash
vercel env add DISCOGS_SECRET production
```

### Issue: No Discogs results, but other APIs work
**Cause:** 
- Artist/album not in Discogs
- Fuzzy matching too strict
- API temporarily down

**Solution:**
1. Check logs for actual Discogs response
2. Try alternative search terms
3. Verify album exists on discogs.com

---

## Expected Console Output

When searching for "The Cure Disintegration", you should see:

```
🔍 Starting search: { artist: "The Cure", album: "Disintegration" }

⏱️ Starting API calls with 15s timeout...

📊 API call results: {
  itunes: "fulfilled",
  deezer: "fulfilled",
  discogs: "fulfilled",  ← Should be fulfilled
  spotify: "fulfilled",
  lastfm: "fulfilled"
}

📈 Result counts: {
  itunes: 5,
  deezer: 12,
  discogs: 8,  ← Should have results
  spotify: 10,
  lastfm: 15
}

💿 Discogs sample: {
  title: "Disintegration",
  url: "https://i.discogs.com/...",
  resolution: "~600×600 typical"
}
```

If you see:
```
❌ Discogs failed: Error: ...
```

Check Vercel function logs for the detailed error.

---

## Next Steps After Fixing

1. ✅ Verify logs show successful Discogs responses
2. ✅ Verify Discogs results appear in search
3. ✅ Verify 💿 pink badge shows for Discogs
4. ✅ Test with albums that iTunes/Deezer don't have
5. ✅ Monitor rate limit usage

---

## Getting Discogs Credentials

1. Sign up at https://www.discogs.com (free)
2. Go to https://www.discogs.com/settings/developers
3. Click "Create an Application"
4. Fill in:
   - **Name**: MiniDisc Cover Designer
   - **Description**: Album artwork search
   - **Website**: https://minidisc.squirclelabs.uk
5. Copy **Consumer Key** and **Consumer Secret**
6. Add to Vercel (see commands above)

---

**Debugging is now deployed!**  
Check logs after your next search to see detailed Discogs API info.
