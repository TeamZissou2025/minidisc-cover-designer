#!/bin/bash
# Quick Webmin installer - Run this on your server at 10.0.0.246

echo "📧 Installing Webmin - Free Control Panel"
echo "=========================================="
echo ""

# Install prerequisites
sudo apt update
sudo apt install -y wget curl apt-transport-https software-properties-common

# Add Webmin repository
curl -fsSL https://download.webmin.com/jcameron-key.asc | sudo gpg --dearmor -o /usr/share/keyrings/webmin.gpg
echo "deb [signed-by=/usr/share/keyrings/webmin.gpg] https://download.webmin.com/download/repository sarge contrib" | sudo tee /etc/apt/sources.list.d/webmin.list

# Install Webmin
sudo apt update
sudo apt install -y webmin

# Open firewall port (if UFW is active)
sudo ufw allow 10000/tcp 2>/dev/null || echo "UFW not active"

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "✅ Webmin installed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 ACCESS WEBMIN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   https://10.0.0.246:10000"
echo "   or"
echo "   https://$SERVER_IP:10000"
echo ""
echo "   Login: root (or your sudo user)"
echo "   Password: (your system password)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 TO SET UP EMAIL:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Log into Webmin"
echo "2. Go to: Servers → Postfix Mail Server"
echo "3. Click: Local Domains → Add Domain"
echo "4. Enter: squirclelabs.uk"
echo "5. Go to: Mail Users → Add User"
echo "6. Create: daryl@squirclelabs.uk"
echo ""
echo "That's it! You'll have a web-based email manager."
echo ""
