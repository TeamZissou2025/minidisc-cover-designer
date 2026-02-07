# MiniDisc Cover Designer - Deployment Guide
# Node.js Server with Discord Feedback Integration

## COMPLETE DEPLOYMENT STEPS

### STEP 1: Install PM2 (if not already installed)
```bash
sudo npm install -g pm2
```

### STEP 2: Run the Deployment Script
```bash
cd /home/daryl/md-label-fresh
./deploy.sh
```

This will:
- Stop any existing server
- Copy all files to /var/www/minidisc.squirclelabs.uk/
- Copy environment variables (Discord webhook)
- Install dependencies
- Start Node.js server with PM2 on port 3000

### STEP 3: Update Nginx Configuration
```bash
# Backup current config
sudo cp /etc/nginx/sites-available/minidisc.squirclelabs.uk /etc/nginx/sites-available/minidisc.squirclelabs.uk.backup

# Replace with new config
sudo cp /home/daryl/md-label-fresh/nginx-config.conf /etc/nginx/sites-available/minidisc.squirclelabs.uk

# Test Nginx config
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### STEP 4: Verify Everything Works
```bash
# Check PM2 status
sudo pm2 status

# Check server logs
sudo pm2 logs minidisc --lines 20

# Test locally
curl http://localhost:3000

# Test API endpoint
curl http://localhost:3000/api/test-env

# Test live site
curl https://minidisc.squirclelabs.uk
```

### STEP 5: Test Feedback Form
1. Visit https://minidisc.squirclelabs.uk
2. Click "💬 Give Feedback" button
3. Fill out and submit
4. Check your Discord channel!

---

## USEFUL COMMANDS

### PM2 Management
```bash
sudo pm2 status                # Check status
sudo pm2 logs minidisc        # View logs
sudo pm2 restart minidisc     # Restart server
sudo pm2 stop minidisc        # Stop server
sudo pm2 delete minidisc      # Remove process
```

### Update App (Future Deployments)
```bash
cd /home/daryl/md-label-fresh
npm run build
./deploy.sh
```

PM2 will automatically restart the server with new code.

---

## TROUBLESHOOTING

### Server won't start
```bash
sudo pm2 logs minidisc --err --lines 50
```

### Port 3000 already in use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Environment variable not loaded
```bash
cd /var/www/minidisc.squirclelabs.uk
cat .env.production.local
sudo pm2 restart minidisc
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

## WHAT CHANGED FROM STATIC DEPLOYMENT

**Before (Static):**
- Deployed: `out/*` folder (HTML/CSS/JS only)
- No API routes
- No server needed

**After (Node.js):**
- Deployed: `.next/*` folder + dependencies
- API routes work (/api/feedback)
- PM2 runs Node.js server
- Nginx proxies to port 3000

---

## READY TO DEPLOY!

Run these commands:

```bash
cd /home/daryl/md-label-fresh
./deploy.sh
```

Then update Nginx as shown in STEP 3 above.

The Discord feedback system will be live! 🎉
