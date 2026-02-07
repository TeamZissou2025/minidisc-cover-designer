# Email Setup Progress - WHERE WE LEFT OFF

**Date:** February 7, 2026  
**Goal:** Set up email account `daryl@squirclelabs.uk` on your server

---

## ✅ COMPLETED:

### 1. Mail Server Installation (10.0.0.246)
- ✅ Postfix installed and configured
- ✅ Dovecot installed (IMAP/POP3)
- ✅ User created: `emaildaryl`
- ✅ Domain configured: `squirclelabs.uk`
- ✅ Services running

### 2. DNS Configuration (Cloudflare)
- ✅ MX record: `10 mail.squirclelabs.uk`
- ✅ A record (mail): `24.67.69.129` (your public IP)
- ✅ DNS propagated and verified

**DNS Test Results:**
```bash
dig MX squirclelabs.uk +short
# Returns: 10 mail.squirclelabs.uk. ✅

dig A mail.squirclelabs.uk +short
# Returns: 24.67.69.129 ✅
```

---

## 🔄 IN PROGRESS / NEXT STEP:

### Port Forwarding on Router

**What needs to be done:**
Configure your router to forward these ports from `24.67.69.129` (internet) → `10.0.0.246` (mail server):

**Required Port Forwards:**
```
Port 25   → 10.0.0.246:25   (SMTP - receiving email)
Port 143  → 10.0.0.246:143  (IMAP - reading email)
Port 587  → 10.0.0.246:587  (SMTP Submission - sending email)
Port 993  → 10.0.0.246:993  (IMAPS - secure IMAP)
```

**How to do it:**
1. Access router (usually http://192.168.1.1 or http://10.0.0.1)
2. Find "Port Forwarding" or "Virtual Server" section
3. Add the 4 rules above
4. Save and reboot router

---

## 📧 AFTER PORT FORWARDING:

### Email Client Settings

Once port forwarding is complete, configure Thunderbird/Outlook with:

**Incoming (IMAP):**
- Server: `mail.squirclelabs.uk`
- Port: `143` (or 993 for SSL)
- Username: `emaildaryl`
- Password: (what you set during setup)

**Outgoing (SMTP):**
- Server: `mail.squirclelabs.uk`
- Port: `587` (or 25)
- Username: `emaildaryl`
- Password: (what you set during setup)

**Email Address:** `daryl@squirclelabs.uk`

---

## 🧪 TESTING CHECKLIST:

After port forwarding is done:

- [ ] Test SMTP: `telnet mail.squirclelabs.uk 25`
- [ ] Test IMAP: `telnet mail.squirclelabs.uk 143`
- [ ] Send test email from server: `echo "Test" | mail -s "Test" emaildaryl@squirclelabs.uk`
- [ ] Check inbox: `sudo ls /home/emaildaryl/Maildir/new/`
- [ ] Connect with email client (Thunderbird/Outlook)
- [ ] Send/receive test emails

---

## 📝 IMPORTANT INFO:

**Your Server:**
- IP: `10.0.0.246` (local)
- Public IP: `24.67.69.129`
- Domain: `squirclelabs.uk`
- Mail subdomain: `mail.squirclelabs.uk`

**Email Account:**
- Email: `daryl@squirclelabs.uk`
- System user: `emaildaryl`
- Home: `/home/emaildaryl`
- Maildir: `/home/emaildaryl/Maildir/`

**Services:**
- Postfix (SMTP): Running ✅
- Dovecot (IMAP): Running ✅
- Webmin: Installed but can't access (not critical for email)

---

## 🚨 IF YOU NEED TO CHECK STATUS LATER:

```bash
# SSH to server
ssh daryl@10.0.0.246

# Check services
sudo systemctl status postfix
sudo systemctl status dovecot

# Check if ports are listening
sudo ss -tlnp | grep -E ':25|:143|:587|:993'

# Check DNS
dig MX squirclelabs.uk +short
dig A mail.squirclelabs.uk +short

# Test local email
echo "Test" | mail -s "Test" emaildaryl@squirclelabs.uk
sudo ls /home/emaildaryl/Maildir/new/
```

---

## 🎯 RESUME FROM HERE:

**Next session, start with:**
1. Configure router port forwarding (4 ports listed above)
2. Test connectivity: `telnet mail.squirclelabs.uk 25`
3. Set up email client
4. Send test email

---

**You're 90% done! Just need port forwarding to complete the setup.** 🚀
