# 🚀 FORCE VERCEL DEPLOYMENT & CACHE CLEAR

## ⚠️ **PROBLEM:**
Site stuck on v0.3.7b despite pushing v0.3.7d to GitHub.

**Cause:** Vercel is serving cached content (`x-vercel-cache: HIT`)

---

## ✅ **SOLUTION 1: Manual Redeploy via Vercel Dashboard (EASIEST)**

### **Steps:**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard

2. **Select Your Project:**
   - Click on `minidisc-cover-designer`

3. **Go to Deployments Tab:**
   - Click "Deployments" in the sidebar

4. **Find Latest Deployment:**
   - Look for the most recent deployment (should show commit `640ebe1` or `712c056`)
   - Status should be "Ready" or "Building"

5. **Redeploy:**
   - Click the "..." (three dots) next to the deployment
   - Select **"Redeploy"**
   - Check **"Use existing Build Cache"** = **OFF** (important!)
   - Click **"Redeploy"**

6. **Wait 2-3 minutes** for build to complete

7. **Clear Browser Cache:**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)
   - Or use Incognito/Private browsing

---

## ✅ **SOLUTION 2: Clear Cloudflare Cache (If Using Cloudflare)**

If your domain `minidisc.squirclelabs.uk` uses Cloudflare:

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com

2. **Select Your Domain:**
   - Click on `squirclelabs.uk`

3. **Purge Cache:**
   - Go to "Caching" tab
   - Click "Purge Cache"
   - Select **"Purge Everything"**
   - Confirm

4. **Wait 30 seconds**, then hard refresh your browser

---

## ✅ **SOLUTION 3: Use Vercel CLI (Already Attempted)**

```bash
cd /home/daryl/md-label-fresh
vercel --prod --force
```

**Note:** This was attempted but interrupted. The deployment may still complete in the background.

---

## ✅ **SOLUTION 4: Check Deployment Status**

### **Via Vercel CLI:**
```bash
vercel ls
```

### **Via Web:**
- Go to: https://vercel.com/daryls-projects-29513f8a/minidisc-cover-designer
- Check latest deployment status

### **Expected Latest Deployment:**
- **Commit:** `640ebe1` or `712c056`
- **Version:** v0.3.7d
- **Status:** Should be "Ready" (green)

---

## 🔍 **VERIFY DEPLOYMENT:**

Once deployed, check:

### **1. Check Version Number:**
- Bottom-left of site should show: **"Version 0.3.7d • Last.fm Integration"**
- If still showing v0.3.7b, deployment hasn't propagated yet

### **2. Check Git Commit in Vercel:**
- Go to Vercel dashboard
- Click on latest deployment
- Check "Git Commit" hash matches: `712c056` or `640ebe1`

### **3. Check Vercel Headers:**
```bash
curl -I https://minidisc.squirclelabs.uk/ | grep x-vercel-id
```

- The `x-vercel-id` should change after new deployment

### **4. Hard Refresh Browser:**
- Clear cache: `Ctrl + Shift + R`
- Or use Incognito/Private browsing mode
- Or clear all site data:
  - Chrome: `F12` → Application tab → Clear Storage → Clear site data

---

## 🐛 **TROUBLESHOOTING:**

### **Vercel Shows Old Commit:**
1. Check GitHub: https://github.com/TeamZissou2025/minidisc-cover-designer
2. Verify latest commit is `712c056`
3. If not, Vercel may be connected to wrong branch
4. Go to Vercel → Settings → Git → Check "Production Branch" is `master`

### **Deployment Stuck on "Building":**
1. Wait 5 minutes
2. If still stuck, cancel and redeploy
3. Check Vercel build logs for errors

### **Browser Still Shows v0.3.7b:**
1. Try different browser
2. Try Incognito/Private mode
3. Clear all browser cache and cookies for the site
4. Disable browser extensions (some cache aggressively)

### **Site Works on Vercel URL but Not Custom Domain:**
- Vercel URL: `https://minidisc-cover-designer-g3owiugvx-daryls-projects-29513f8a.vercel.app`
- Custom domain: `https://minidisc.squirclelabs.uk`

**If Vercel URL shows v0.3.7d but custom domain shows v0.3.7b:**
- This is a DNS/CDN caching issue
- Purge Cloudflare cache (see Solution 2)
- Wait 5-10 minutes for DNS propagation

---

## 📊 **CURRENT STATUS:**

```
✅ Code committed: v0.3.7d (commit 712c056)
✅ Pushed to GitHub: master branch
✅ Empty commit created: 640ebe1 (to force rebuild)
🔄 Vercel deployment: Started (may be completing in background)
⏳ Status: Check Vercel dashboard
```

---

## 🎯 **RECOMMENDED ACTIONS (IN ORDER):**

1. **Go to Vercel Dashboard** → Check if latest deployment succeeded
2. **If deployment succeeded** → Hard refresh browser (`Ctrl+Shift+R`)
3. **If still v0.3.7b** → Purge Cloudflare cache (if applicable)
4. **If still v0.3.7b** → Redeploy from Vercel dashboard (disable build cache)
5. **If still v0.3.7b** → Try Incognito mode to rule out browser cache

---

## 🔗 **USEFUL LINKS:**

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Project Page:** https://vercel.com/daryls-projects-29513f8a/minidisc-cover-designer
- **GitHub Repo:** https://github.com/TeamZissou2025/minidisc-cover-designer
- **Production URL (Vercel):** https://minidisc-cover-designer-g3owiugvx-daryls-projects-29513f8a.vercel.app
- **Custom Domain:** https://minidisc.squirclelabs.uk

---

## ✅ **WHEN IT WORKS, YOU'LL SEE:**

- ✅ Version shows: **"v0.3.7d • Last.fm Integration"**
- ✅ Search results show quality badges: **🎵 3000×3000**, **🎶 1000×1000**, **📻 300×300**
- ✅ Console logs show: `🎵 iTunes sample: { resolution: "✅ 3000×3000" }`

---

**Last Updated:** 2026-02-05  
**Target Version:** v0.3.7d  
**Current Issue:** Vercel cache serving v0.3.7b
