# 🚀 QUICK DEPLOY GUIDE

**Platform:** Vercel (Git-based deployment)  
**Current Version:** v0.3.7b

---

## ⚡ **DEPLOY IN 3 STEPS**

```bash
# 1️⃣ Stage changes
git add .

# 2️⃣ Commit
git commit -m "Your message here"

# 3️⃣ Push (auto-deploys)
git push
```

**Deploy time:** 30-60 seconds ✨

---

## 🆕 **FIRST TIME SETUP**

### **1. Configure Git**
```bash
cd /home/daryl/md-label-fresh
git config user.email "daryl@squirclelabs.uk"
git config user.name "Daryl"
```

### **2. Create GitHub Repo**
```bash
# Install GitHub CLI
sudo apt install gh

# Login and create repo
gh auth login
gh repo create minidisc-cover-designer --public --source=. --remote=origin --push
```

### **3. Connect Vercel**
1. Go to https://vercel.com/new
2. Import GitHub repo: `minidisc-cover-designer`
3. Add environment variables:
   - `DISCORD_WEBHOOK_URL`
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-54KYPT7HFE`
4. Deploy!

---

## 🎯 **DEPLOY v0.3.7b NOW**

```bash
cd /home/daryl/md-label-fresh

# First time? Configure Git:
git config user.email "daryl@squirclelabs.uk"
git config user.name "Daryl"

# Commit v0.3.7b
git add .
git commit -m "v0.3.7b: High-resolution artwork priority + PDF export

- Prioritize iTunes (3000×3000) over Deezer/MusicBrainz
- PDF export with exact print dimensions
- Google Analytics integration
- Removed duplicate zoom buttons"

# Push to GitHub → Vercel auto-deploys
git push
```

---

## ✅ **VERIFY DEPLOYMENT**

1. **Check Vercel Dashboard:** https://vercel.com/dashboard
2. **Check Site:** https://minidisc.squirclelabs.uk
3. **Verify Version:** Header should show "v0.3.7b"
4. **Test Search:** "Radiohead OK Computer" → iTunes results first
5. **Test Export:** Should download PDF (not PNG)

---

## 🔄 **ROLLBACK**

**Via Vercel Dashboard (easiest):**
1. Go to https://vercel.com/dashboard
2. Click "Deployments"
3. Find previous version
4. Click "..." → "Promote to Production"

---

## 🆘 **HELP**

**Build fails?**
```bash
# Test locally first
npm run build
```

**Site not updating?**
- Clear browser cache
- Check Vercel build logs
- Try incognito mode

**More help:** See `DEPLOYMENT.md`

---

## 📋 **QUICK REFERENCE**

| Command | Action |
|---------|--------|
| `git status` | Check what changed |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit with message |
| `git push` | Deploy to Vercel |
| `git log --oneline` | View commit history |
| `vercel logs` | View deployment logs |

---

**Remember:** No more PM2, Nginx, or manual file copying! Just `git push` and Vercel handles everything. 🎉
