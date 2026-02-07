#!/bin/bash
# Webmin Installation Commands
# Run these one by one on your server

echo "Step 1: Add Webmin repository key"
curl -fsSL https://download.webmin.com/jcameron-key.asc | sudo gpg --dearmor -o /usr/share/keyrings/webmin.gpg

echo "Step 2: Add Webmin repository"
echo "deb [signed-by=/usr/share/keyrings/webmin.gpg] https://download.webmin.com/download/repository sarge contrib" | sudo tee /etc/apt/sources.list.d/webmin.list

echo "Step 3: Update package list"
sudo apt update

echo "Step 4: Install Webmin"
sudo apt install -y webmin

echo "Step 5: Open firewall"
sudo ufw allow 10000/tcp

echo ""
echo "✅ Done! Access Webmin at: https://10.0.0.246:10000"
