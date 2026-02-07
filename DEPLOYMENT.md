# 🚀 DEPLOYMENT GUIDE (Vercel)

**Last Updated:** 2026-02-05  
**Platform:** Vercel (auto-deploy from GitHub)  
**Site URL:** https://minidisc.squirclelabs.uk (or Vercel subdomain)

---

## 📋 **DEPLOYMENT METHOD**

### **Current: Vercel (Git-based)**
✅ Push to GitHub → Vercel auto-deploys  
✅ No manual PM2/Nginx management  
✅ Instant rollbacks  
✅ Preview deployments for branches  

### **OLD: PM2 + Nginx (deprecated)**
❌ Manual file copying  
❌ PM2 process management  
❌ Nginx configuration  
❌ **DO NOT USE THIS METHOD**

---

## 🔧 **SETUP (One-Time)**

### **1. Initialize Git (if not already done)**
```bash
cd /home/daryl/md-label-fresh
git init
git config user.email "daryl@squirclelabs.uk"
git config user.name "Daryl"
```

### **2. Create GitHub Repository**

#### **Option A: GitHub CLI (fastest)**
```bash
# Install gh CLI
sudo apt install gh

# Login
gh auth login

# Create and push
gh repo create minidisc-cover-designer --public --source=. --remote=origin --push
```

#### **Option B: GitHub Website**
1. Go to https://github.com/new
2. Name: `minidisc-cover-designer`
3. Create repository
4. Connect local repo:
```bash
git remote add origin https://github.com/YOUR_USERNAME/minidisc-cover-designer.git
git branch -M main
git push -u origin main
```

### **3. Connect Vercel**

1. Go to https://vercel.com/new
2. Import GitHub repository: `minidisc-cover-designer`
3. Configure project:
   - **Framework:** Next.js (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. Add environment variables:
   ```
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-54KYPT7HFE
   ```
5. Click "Deploy"

---

## 🚀 **DEPLOY NEW VERSION**

### **Standard Deployment**
```bash
cd /home/daryl/md-label-fresh

# 1. Check status
git status

# 2. Stage changes
git add .

# 3. Commit with descriptive message
git commit -m "Your commit message here"

# 4. Push to GitHub (triggers Vercel deploy)
git push
```

**That's it!** Vercel automatically:
- ✅ Detects push
- ✅ Runs `npm install`
- ✅ Runs `npm run build`
- ✅ Deploys to production
- ✅ Updates DNS

**Deploy time:** 30-60 seconds

---

## 🎯 **DEPLOY v0.3.7b (Current Version)**

```bash
cd /home/daryl/md-label-fresh

# Configure Git (if first time)
git config user.email "daryl@squirclelabs.uk"
git config user.name "Daryl"

# Commit current changes
git add .
git commit -m "v0.3.7b: High-resolution artwork priority + PDF export"

# Push to GitHub (triggers Vercel)
git push
```

---

## 🔄 **ROLLBACK TO PREVIOUS VERSION**

### **Option 1: Vercel Dashboard (easiest)**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments"
4. Find previous successful deployment
5. Click "..." → "Promote to Production"

### **Option 2: Git Revert**
```bash
cd /home/daryl/md-label-fresh

# View commit history
git log --oneline

# Revert to specific commit
git revert <commit-hash>

# Push
git push
```

### **Option 3: Git Reset (destructive)**
```bash
# Reset to previous commit (CAUTION: loses changes)
git reset --hard HEAD~1

# Force push
git push --force
```

---

## 🌿 **PREVIEW DEPLOYMENTS (Testing)**

Test changes before production:

```bash
cd /home/daryl/md-label-fresh

# Create feature branch
git checkout -b feature/my-new-feature

# Make changes, commit
git add .
git commit -m "Test new feature"

# Push branch
git push -u origin feature/my-new-feature
```

**Vercel automatically creates a preview URL:**
- Production: `https://minidisc.squirclelabs.uk`
- Preview: `https://minidisc-cover-designer-git-feature-my-new-feature.vercel.app`

Test on preview URL, then merge to main:
```bash
git checkout main
git merge feature/my-new-feature
git push
```

---

## 🔍 **VERIFY DEPLOYMENT**

After pushing to GitHub:

1. **Check Vercel Dashboard:**
   - Go to https://vercel.com/dashboard
   - See build logs in real-time
   - Status: "Building" → "Ready"

2. **Check Site:**
   ```bash
   curl -I https://minidisc.squirclelabs.uk
   ```
   - HTTP 200 OK
   - Header: `x-vercel-id` present

3. **Test Features:**
   - [ ] Site loads correctly
   - [ ] Version shows "v0.3.7b"
   - [ ] Search returns iTunes results first
   - [ ] PDF export works
   - [ ] Google Analytics loads

4. **Check Logs:**
   ```bash
   # View real-time logs
   vercel logs https://minidisc.squirclelabs.uk
   ```

---

## 🔐 **ENVIRONMENT VARIABLES**

### **Production (Vercel Dashboard)**
Set at: https://vercel.com/your-project/settings/environment-variables

**Required:**
- `DISCORD_WEBHOOK_URL` - Feedback form webhook
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics ID

**How to update:**
1. Go to project settings
2. Click "Environment Variables"
3. Edit value
4. Click "Save"
5. Redeploy (Vercel prompts automatically)

### **Local Development (.env.local)**
```bash
# /home/daryl/md-label-fresh/.env.local
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-54KYPT7HFE
```

**Never commit `.env.local` to Git!** (already in `.gitignore`)

---

## 🛠️ **COMMON COMMANDS**

### **Check Deployment Status**
```bash
# Via Vercel CLI
vercel ls

# Via GitHub Actions (if configured)
gh run list
```

### **View Build Logs**
```bash
# Latest deployment
vercel logs

# Specific deployment
vercel logs <deployment-url>
```

### **Local Development**
```bash
cd /home/daryl/md-label-fresh

# Development server
npm run dev

# Production build test
npm run build
npm start
```

---

## 📊 **DEPLOYMENT CHECKLIST**

Before deploying:

- [ ] Code compiles without errors (`npm run build`)
- [ ] Linter passes (no critical errors)
- [ ] Version number updated (if releasing)
- [ ] `.env.local` not committed
- [ ] `node_modules/` not committed
- [ ] `.next/` not committed
- [ ] Commit message is descriptive

After deploying:

- [ ] Site loads correctly
- [ ] No console errors (F12)
- [ ] Features work as expected
- [ ] Analytics tracking works
- [ ] Environment variables loaded

---

## 🚨 **TROUBLESHOOTING**

### **Build Fails on Vercel**
1. Check build logs in Vercel dashboard
2. Test locally: `npm run build`
3. Check `next.config.js` settings
4. Verify environment variables set

### **Environment Variables Not Working**
1. Check Vercel dashboard settings
2. Ensure `NEXT_PUBLIC_` prefix for client-side vars
3. Redeploy after changing env vars

### **404 on Routes**
1. Check `next.config.js` - no `output: 'export'` (breaks API routes)
2. Ensure API routes in `app/api/` directory
3. Check Vercel function logs

### **Site Not Updating**
1. Clear browser cache
2. Check if deploy succeeded (Vercel dashboard)
3. Try incognito/private browsing
4. Check if CDN cached (Cloudflare, if used)

---

## 📚 **RELATED DOCUMENTATION**

- `RELEASE_v0.3.7b_FINAL.md` - Current release notes
- `ARTWORK_PRIORITY.md` - Artwork search changes
- `PDF_EXPORT.md` - PDF export feature
- `SECURITY_AUDIT.md` - Security review

---

## 🔗 **USEFUL LINKS**

- **Production Site:** https://minidisc.squirclelabs.uk
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/YOUR_USERNAME/minidisc-cover-designer
- **Analytics:** https://analytics.google.com/analytics/web/#/p428627569 (replace with your property ID)

---

**Status:** ✅ Active  
**Last Deploy:** v0.3.7b  
**Method:** Git → GitHub → Vercel (auto)
