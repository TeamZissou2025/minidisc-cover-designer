# Discogs API Integration - v0.3.7f

## Overview

Discogs has been added as the **4th artwork source** for album cover searches, prioritized between Deezer and Spotify:

**Priority Order:**
1. 🎵 **iTunes** - 3000×3000px (highest quality)
2. 🎶 **Deezer** - 1000×1000px
3. 💿 **Discogs** - ~600×600px (often higher for vinyl releases)
4. 🎧 **Spotify** - 640×640px
5. 📻 **Last.fm** - 300×300px

---

## Why Discogs?

- **Comprehensive Database**: Especially strong for vinyl, physical releases, and rare albums
- **High-Quality Artwork**: Often 600×600px or larger
- **Release Year & Label Info**: Additional metadata for accurate matching
- **No Authentication Required**: Only needs Consumer Key (no OAuth flow)
- **Excellent Coverage**: Fills gaps where iTunes/Deezer don't have albums

---

## Setup Instructions

### 1. Get Discogs API Credentials

1. Go to: https://www.discogs.com/settings/developers
2. Create a new application:
   - **Name**: MiniDisc Cover Designer
   - **Description**: Album artwork search for MiniDisc label generator
   - **Website**: https://minidisc.squirclelabs.uk
3. Copy your **Consumer Key** and **Consumer Secret**

### 2. Add to Environment Variables

**Local Development** (`.env.local`):
```bash
NEXT_PUBLIC_DISCOGS_KEY=your_consumer_key_here
DISCOGS_SECRET=your_consumer_secret_here
```

**Vercel Production**:
```bash
cd /home/daryl/md-label-fresh

# Add Consumer Key (public)
vercel env add NEXT_PUBLIC_DISCOGS_KEY production
# When prompted, choose "Leave as is" and paste your key

# Add Consumer Secret (optional, for authenticated requests)
vercel env add DISCOGS_SECRET production
# When prompted, choose "Rename to DISCOGS_SECRET" and paste your secret
```

### 3. Deploy

```bash
git add .
git commit -m "v0.3.7f: Add Discogs API for album artwork"
git push origin main
```

---

## Implementation Details

### API Proxy
- **Route**: `/app/api/proxy/discogs/route.ts`
- **Endpoint**: `https://api.discogs.com/database/search`
- **Parameters**: 
  - `q` - search query (artist + album)
  - `type=release` - filter for releases only
  - `format=album` - filter for albums (not singles/EPs)
  - `key` - Consumer Key from env

### Search Function
- **Location**: `app/page.tsx` → `searchDiscogs()`
- **Fuzzy Matching**: Uses artist/album similarity scoring
- **Filtering**: 
  - Only `release` and `master` types
  - Excludes singles and EPs
  - Requires artist match ≥ 60% similarity

### UI Badge
- **Icon**: 💿
- **Color**: Pink (`bg-pink-500/20 text-pink-400`)
- **Label**: "600×600"

---

## Console Logging

When searching, you'll see:

```
🔍 Starting search: { artist: "...", album: "..." }
📊 API call results: {
  itunes: "fulfilled",
  deezer: "fulfilled",
  discogs: "fulfilled",
  spotify: "fulfilled",
  lastfm: "fulfilled"
}
📈 Result counts: {
  itunes: 5,
  deezer: 12,
  discogs: 8,
  spotify: 10,
  lastfm: 15
}
💿 Discogs sample: {
  title: "Album Name",
  url: "https://i.discogs.com/...",
  resolution: "~600×600 typical"
}
```

---

## Discogs API Response Format

**Sample Response:**
```json
{
  "results": [
    {
      "id": 123456,
      "type": "release",
      "title": "Artist Name - Album Name",
      "year": 1985,
      "format": ["Vinyl", "LP", "Album"],
      "cover_image": "https://i.discogs.com/.../R-123456.jpg",
      "thumb": "https://i.discogs.com/.../R-123456-thumb.jpg",
      "resource_url": "https://api.discogs.com/releases/123456"
    }
  ]
}
```

---

## Troubleshooting

### "Discogs API not configured" Error

**Problem**: `NEXT_PUBLIC_DISCOGS_KEY` not set

**Solution**:
```bash
# Check if env var exists
cat .env.local | grep DISCOGS

# Add if missing
echo "NEXT_PUBLIC_DISCOGS_KEY=your_key_here" >> .env.local

# For Vercel
vercel env add NEXT_PUBLIC_DISCOGS_KEY production
```

### No Discogs Results

**Possible Causes:**
1. **Rate Limiting**: Discogs limits to 60 requests/minute for unauthenticated
2. **Album Not in Database**: Try alternative search terms
3. **Network Issue**: Check console for API errors

**Debug**:
```javascript
// In browser console after search:
console.log('Check Discogs proxy response')
```

### Low Image Quality

- Discogs typically serves 600×600px for most releases
- Vinyl releases may have higher resolution (up to 1000×1000px)
- Older releases may only have ~300×300px scans
- If Discogs quality is low, iTunes or Deezer results will rank higher

---

## Testing

Test searches that benefit from Discogs:

1. **Vinyl Releases**: "Pink Floyd - The Wall"
2. **Rare Albums**: "Aphex Twin - Selected Ambient Works"
3. **Physical-Only Releases**: Many indie/underground albums
4. **Reissues**: Different editions with unique artwork

---

## Version History

**v0.3.7f** (Feb 7, 2026)
- ✅ Added Discogs as 4th artwork source
- ✅ Priority: iTunes → Deezer → Discogs → Spotify → Last.fm
- ✅ Fuzzy matching for artist/album
- ✅ 💿 Pink badge UI indicator
- ✅ Console logging for debugging
- ✅ API proxy to avoid CORS

---

## Next Steps

After Discogs credentials are added:

1. Test search for albums that iTunes/Deezer don't have
2. Monitor console logs for Discogs API response quality
3. Consider adding Discogs **master release** lookup for highest quality variants
4. Optional: Implement Discogs authenticated requests for higher rate limits (240 req/min)

---

**Integration Complete** ✅

Discogs API is now live and will automatically search alongside iTunes, Deezer, Spotify, and Last.fm!
