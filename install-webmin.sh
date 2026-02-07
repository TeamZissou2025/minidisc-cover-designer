#!/bin/bash
# Install Webmin on Ubuntu server (10.0.0.246)

echo "📧 Installing Webmin Email Control Panel"
echo "========================================="
echo ""
echo "Run this script on your server at 10.0.0.246"
echo ""

# Add Webmin repository
echo "Adding Webmin repository..."
sudo sh -c 'echo "deb https://download.webmin.com/download/repository sarge contrib" > /etc/apt/sources.list.d/webmin.list'

# Add GPG key
wget -qO - https://download.webmin.com/jcameron-key.asc | sudo apt-key add -

# Update and install
echo "Installing Webmin..."
sudo apt update
sudo apt install -y webmin

# Configure firewall (if UFW is enabled)
sudo ufw allow 10000/tcp 2>/dev/null

echo ""
echo "✅ Webmin installed!"
echo ""
echo "Access at: https://10.0.0.246:10000"
echo "Login with your system root/sudo user credentials"
echo ""
echo "To set up email:"
echo "1. Log into Webmin"
echo "2. Go to: Servers → Postfix Mail Server"
echo "3. Configure domains and mailboxes"
echo ""
