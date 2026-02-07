#!/bin/bash
# Run this ON your server (10.0.0.246) to verify and fix mail server configuration

echo "🔧 Checking and configuring mail server..."
echo ""

# Check if Postfix is listening on all interfaces
echo "1. Checking Postfix configuration..."
sudo postconf inet_interfaces

# Configure Postfix to listen on all interfaces (not just localhost)
echo "2. Configuring Postfix to accept external connections..."
sudo postconf -e "inet_interfaces = all"

# Check and configure Dovecot
echo "3. Checking Dovecot configuration..."
if [ -f /etc/dovecot/dovecot.conf ]; then
    sudo grep "^listen = " /etc/dovecot/dovecot.conf || echo "listen = *, ::" | sudo tee -a /etc/dovecot/dovecot.conf
fi

# Restart services
echo "4. Restarting mail services..."
sudo systemctl restart postfix
sudo systemctl restart dovecot

# Check if services are listening on correct ports
echo "5. Verifying ports are listening..."
sudo ss -tlnp | grep -E ':25|:143|:587|:993'

echo ""
echo "✅ Configuration complete!"
echo ""
echo "Services should now be accessible from internet."
