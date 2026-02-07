#!/bin/bash
# Install Webmin on 10.0.0.246
# Run this ON the server at 10.0.0.246

echo "Installing Webmin Control Panel..."

# Update system
sudo apt update

# Install prerequisites
sudo apt install -y wget curl gnupg2 apt-transport-https software-properties-common

# Add Webmin repository key
curl -fsSL https://download.webmin.com/jcameron-key.asc | sudo gpg --dearmor -o /usr/share/keyrings/webmin.gpg

# Add Webmin repository
echo "deb [signed-by=/usr/share/keyrings/webmin.gpg] https://download.webmin.com/download/repository sarge contrib" | sudo tee /etc/apt/sources.list.d/webmin.list

# Install Webmin
sudo apt update
sudo apt install -y webmin

# Open firewall port
sudo ufw allow 10000/tcp 2>/dev/null || true

echo ""
echo "✅ DONE! Access Webmin at:"
echo ""
echo "   https://10.0.0.246:10000"
echo ""
echo "Login with your sudo user credentials"
