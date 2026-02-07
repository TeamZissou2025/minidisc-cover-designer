# Vercel Login Troubleshooting

## **TL;DR:**
Go to https://vercel.com/login and click **"Continue with GitHub"**

---

## **Your Vercel Account Details:**

- **GitHub Username:** TeamZissou2025
- **Project Name:** minidisc-cover-designer
- **Project URL:** https://vercel.com/teamzissou2025s-projects/minidisc-cover-designer
- **Live Site:** https://minidisc.squirclelabs.uk
- **Email (likely):** daryl@squirclelabs.uk

---

## **How to Log In:**

### **Step 1: Go to Vercel**
https://vercel.com/login

### **Step 2: Click "Continue with GitHub"**
```
┌─────────────────────────────────┐
│  Continue with GitHub           │ ← Click this!
├─────────────────────────────────┤
│  Continue with GitLab           │
├─────────────────────────────────┤
│  Continue with Bitbucket        │
├─────────────────────────────────┤
│  Continue with Email            │
└─────────────────────────────────┘
```

### **Step 3: Authorize (if asked)**
- GitHub will ask if you want to authorize Vercel
- Click "Authorize vercel"
- You'll be redirected back to Vercel dashboard

---

## **Common Issues:**

### **Problem 1: "I don't remember which GitHub account I used"**

**Check your GitHub accounts:**
1. Go to https://github.com
2. Check if you're logged in as `TeamZissou2025`
3. If not, log out and try other accounts

**Your known GitHub account:**
- Username: `TeamZissou2025`
- Email: `daryl@squirclelabs.uk`
- Repo: `minidisc-cover-designer`

### **Problem 2: "GitHub login doesn't show my project"**

**Check which organization you're viewing:**
1. After logging in, look at top-left dropdown
2. It might say "Personal Account" or "Team Account"
3. Switch to: `teamzissou2025s-projects`

### **Problem 3: "I see multiple Vercel accounts"**

**You might have:**
- Personal account (your GitHub username)
- Team account (teamzissou2025s-projects)

**Your project is under:** `teamzissou2025s-projects`

### **Problem 4: "GitHub authorization expired"**

**Re-authorize Vercel:**
1. Go to https://github.com/settings/applications
2. Find "Vercel" in the list
3. Click "Revoke" (if exists)
4. Go back to https://vercel.com/login
5. Click "Continue with GitHub" again
6. Authorize when prompted

---

## **Alternative: Use Email to Reset**

If GitHub login really doesn't work:

1. Go to https://vercel.com/login
2. Click "Continue with Email"
3. Enter: `daryl@squirclelabs.uk`
4. Check your email for login link
5. Click the link to log in

---

## **Once Logged In:**

### **Find Your Project:**
1. Dashboard → Projects
2. Look for: `minidisc-cover-designer`
3. Click it to see deployments

### **Check Recent Deployments:**
You should see these recent commits:
- `7d36e5f` - v0.3.7e: Smart title auto-scaling
- `f8d94cc` - Force Vercel redeploy

### **View Deployment Status:**
- ✅ Green = Deployed successfully
- 🟡 Building = In progress
- 🔴 Failed = Check logs

---

## **Verify It's Your Account:**

Once logged in, check:
1. **Project name:** minidisc-cover-designer ✅
2. **Live URL:** https://minidisc.squirclelabs.uk ✅
3. **Git repo:** github.com/TeamZissou2025/minidisc-cover-designer ✅
4. **Recent commit:** Contains "Smart title auto-scaling" ✅

If all these match, you're in the right account!

---

## **Still Having Issues?**

### **Check GitHub Connection:**
```bash
# From your terminal:
cd /home/daryl/md-label-fresh
git remote -v
```

Should show:
```
origin  https://github.com/TeamZissou2025/minidisc-cover-designer.git
```

### **Check Vercel Project Link:**
```bash
cat .vercel/project.json
```

Should show:
```json
{
  "projectId": "prj_8mxG8AwXELwvc4iMgB2adU8T6owu",
  "orgId": "team_bnLhq1Gaj1R6uPYgjXAtDtZN",
  "projectName": "minidisc-cover-designer"
}
```

---

## **Need to Re-link Project?**

If you've lost access to the Vercel dashboard but deployments still work, you can:

1. **Check deployment status from terminal:**
   ```bash
   ./check-deployment.sh
   ```

2. **View recent deployments:**
   ```bash
   git log --oneline -5
   ```

3. **Your site is still live:**
   https://minidisc.squirclelabs.uk

The good news: **Deployments are working even if you can't access the dashboard!**

---

## **Summary:**

✅ **To log in:** https://vercel.com/login → "Continue with GitHub"  
✅ **Your GitHub:** TeamZissou2025  
✅ **Your project:** minidisc-cover-designer  
✅ **Deployments:** Still working (auto-deploy from GitHub)  

**You don't need dashboard access to deploy - `git push` does it automatically!** 🚀
