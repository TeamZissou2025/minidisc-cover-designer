# 🔒 Security Post-Deployment Checklist

Use this checklist after running `./deploy-security.sh`

---

## ✅ IMMEDIATE VERIFICATION (5 minutes)

### 1. Check PM2 User
```bash
ps aux | grep PM2 | grep -v grep
```
**Expected:** Should show `daryl` user, NOT `root`  
**If root:** Run fix commands from deployment script

### 2. Test Application
```bash
curl -I https://minidisc.squirclelabs.uk
```
**Expected:** 200 OK response

### 3. Verify Security Headers
```bash
curl -I https://minidisc.squirclelabs.uk 2>&1 | grep -E "X-Frame-Options|X-Content-Type|X-XSS"
```
**Expected:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

### 4. Test Rate Limiting
```bash
# Should succeed first 5 times, fail on 6th
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST https://minidisc.squirclelabs.uk/api/feedback \
    -H "Content-Type: application/json" \
    -d '{"type":"other","message":"Test message 12345"}' \
    -w "\nHTTP Status: %{http_code}\n\n"
done
```
**Expected:** First 5 succeed, 6th returns 429 (Too Many Requests)

### 5. Test Input Validation

**Too short:**
```bash
curl -X POST https://minidisc.squirclelabs.uk/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"type":"other","message":"short"}'
```
**Expected:** 400 error "Message too short"

**Invalid type:**
```bash
curl -X POST https://minidisc.squirclelabs.uk/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"type":"invalid","message":"Test message 12345"}'
```
**Expected:** 400 error "Invalid feedback type"

**Invalid email:**
```bash
curl -X POST https://minidisc.squirclelabs.uk/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"type":"other","message":"Test message 12345","email":"notanemail"}'
```
**Expected:** 400 error "Invalid email format"

---

## ✅ CRITICAL FIXES (10 minutes)

### 1. Fix PM2 Root Issue (if needed)
```bash
# Stop root PM2
sudo pm2 delete minidisc
sudo pm2 kill

# Start as regular user
cd /var/www/minidisc.squirclelabs.uk
pm2 start npm --name "minidisc" -- start
pm2 save

# Enable startup on boot
pm2 startup
# Follow the command it gives you (will use sudo)
```

### 2. Update Next.js
```bash
cd /home/daryl/md-label-fresh
npm update next@latest
npm audit fix

# Rebuild and redeploy
./deploy-security.sh
```

### 3. Secure .env.local Permissions
```bash
chmod 600 /var/www/minidisc.squirclelabs.uk/.env.production.local
```

### 4. Purge Cloudflare Cache
1. Go to Cloudflare dashboard
2. Select `minidisc.squirclelabs.uk` domain
3. Go to **Caching** > **Configuration**
4. Click **Purge Everything**
5. Confirm

---

## ✅ MONITORING SETUP (15 minutes)

### 1. Check PM2 Logs
```bash
pm2 logs minidisc --lines 100
```
**Look for:**
- ✅ No errors on startup
- ✅ "Ready on http://localhost:3000"
- ⚠️ Watch for rate limit warnings

### 2. Enable PM2 Monitoring
```bash
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Test Error Logging
```bash
# Trigger a rate limit to see if logging works
for i in {1..10}; do
  curl -X POST https://minidisc.squirclelabs.uk/api/feedback \
    -H "Content-Type: application/json" \
    -d '{"type":"other","message":"Test message 12345"}' &
done
wait

# Check logs for rate limit warnings
pm2 logs minidisc --lines 20 | grep "Rate limit"
```

---

## ✅ FINAL VERIFICATION (5 minutes)

### Complete System Check
```bash
# 1. Check all services
echo "=== PM2 Status ==="
pm2 status

echo -e "\n=== Nginx Status ==="
sudo systemctl status nginx --no-pager

echo -e "\n=== Disk Space ==="
df -h /var/www/minidisc.squirclelabs.uk

echo -e "\n=== Process User ==="
ps aux | grep -E "(PM2|next-server)" | grep -v grep | awk '{print $1, $11}'

echo -e "\n=== Next.js Version ==="
cd /var/www/minidisc.squirclelabs.uk && npm list next

echo -e "\n=== Environment Variables ==="
ls -la /var/www/minidisc.squirclelabs.uk/.env.production.local 2>/dev/null || echo "No .env file"

echo -e "\n=== Live Site Test ==="
curl -I https://minidisc.squirclelabs.uk 2>&1 | head -10
```

### Manual Browser Test
1. Open https://minidisc.squirclelabs.uk
2. Try uploading an image
3. Try submitting feedback
4. Submit feedback 6 times rapidly (should get rate limited)
5. Check browser console for errors

---

## ✅ SECURITY AUDIT COMPLETE

### If All Checks Pass:
✅ **APPROVED FOR PUBLIC BETA RELEASE**

### If Any Checks Fail:
1. Review PM2 logs: `pm2 logs minidisc`
2. Review Nginx logs: `sudo tail -50 /var/log/nginx/error.log`
3. Check this checklist again
4. Contact if issues persist

---

## 📊 ONGOING MAINTENANCE

### Daily (Automated)
- PM2 auto-restart on failure
- Log rotation

### Weekly
```bash
# Check logs for issues
pm2 logs minidisc --lines 200 | grep -E "ERROR|Rate limit|❌"

# Check Nginx logs
sudo tail -100 /var/log/nginx/error.log
```

### Monthly
```bash
# Update dependencies
cd /home/daryl/md-label-fresh
npm audit
npm update
npm audit fix

# Redeploy if needed
./deploy-security.sh
```

### Quarterly
- Review Discord webhook usage
- Check for new Next.js security advisories
- Update SSL certificates (Let's Encrypt auto-renews)

---

## 🆘 EMERGENCY CONTACTS

If webhook URL is compromised:
1. Regenerate in Discord server settings
2. Update `.env.local` in dev folder
3. Run: `./deploy-security.sh`

If site is down:
1. Check PM2: `pm2 status`
2. Check Nginx: `sudo systemctl status nginx`
3. Check logs: `pm2 logs minidisc`
4. Restart: `pm2 restart minidisc`
