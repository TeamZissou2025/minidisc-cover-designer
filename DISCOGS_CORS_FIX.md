# Discogs CORS Fix - Image Proxy

**Date:** 2026-02-07  
**Commit:** d7766df

---

## Problem

Discogs images were being blocked by CORS policy when loaded directly from `api.discogs.com`:

```
Access to fetch at 'https://api-img.discogs.com/...' has been blocked by CORS policy
```

---

## Solution

Created an image proxy API route that fetches images server-side and serves them with proper CORS headers.

### Implementation

#### 1. New API Route: `/api/proxy/image`

**File:** `app/api/proxy/image/route.ts`

- Accepts `?url=` parameter with encoded image URL
- Fetches image server-side with User-Agent header
- Returns image buffer with:
  - Proper `Content-Type` header
  - Long-term caching: `Cache-Control: public, max-age=31536000, immutable`
- Handles errors gracefully

#### 2. Updated Discogs Search Handler

**File:** `app/page.tsx` (line 508-530)

- Modified `searchDiscogs` function to wrap all Discogs image URLs
- Both `artworkUrl` and `thumbnailUrl` are now proxied
- Format: `/api/proxy/image?url=${encodeURIComponent(discogsImageUrl)}`

---

## Benefits

1. **Bypasses CORS:** Server-side fetch has no CORS restrictions
2. **Caching:** Aggressive caching reduces bandwidth and API calls
3. **Consistent:** Works for both thumbnail and full-size artwork
4. **Transparent:** No changes needed to rendering logic

---

## Testing

1. Search for an album that returns Discogs results
2. Check browser console - no CORS errors
3. Check Network tab - images load from `/api/proxy/image?url=...`
4. Verify artwork displays correctly on label

---

## Notes

- This proxy works for **any** image URL, not just Discogs
- Could be extended to Last.fm or other sources if needed
- User-Agent header helps avoid rate limiting: `MiniDiscCoverDesigner/1.0 +https://minidisc.squirclelabs.uk`
