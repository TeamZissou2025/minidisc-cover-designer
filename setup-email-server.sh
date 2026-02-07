#!/bin/bash
# Set up email server on 10.0.0.246 (squirclelabs.uk)

echo "📧 Email Server Setup for squirclelabs.uk"
echo "=========================================="
echo ""

# Install Postfix (SMTP) and Dovecot (IMAP/POP3)
echo "Installing Postfix and Dovecot..."
sudo apt update
sudo apt install -y postfix dovecot-core dovecot-imapd dovecot-pop3d mailutils

# Configure Postfix for your domain
echo "Configuring Postfix..."
sudo postconf -e "myhostname = squirclelabs.uk"
sudo postconf -e "mydomain = squirclelabs.uk"
sudo postconf -e "myorigin = \$mydomain"
sudo postconf -e "mydestination = \$myhostname, localhost.\$mydomain, localhost, \$mydomain"
sudo postconf -e "inet_interfaces = all"
sudo postconf -e "home_mailbox = Maildir/"

# Configure Dovecot
echo "Configuring Dovecot..."
sudo sed -i 's/#mail_location = .*/mail_location = maildir:~\/Maildir/' /etc/dovecot/conf.d/10-mail.conf

# Restart services
echo "Restarting mail services..."
sudo systemctl restart postfix
sudo systemctl restart dovecot

# Create mailbox for daryl@squirclelabs.uk
echo ""
echo "Creating email account: daryl@squirclelabs.uk"
echo "You'll be prompted to set a password..."
sudo adduser --home /home/daryl-mail --shell /bin/bash daryl-mail

# Initialize Maildir
sudo -u daryl-mail mkdir -p /home/daryl-mail/Maildir/{new,cur,tmp}

echo ""
echo "✅ Email server configured!"
echo ""
echo "Your email account:"
echo "  Email: daryl@squirclelabs.uk"
echo "  User: daryl-mail"
echo "  Password: (what you just set)"
echo ""
echo "IMAP Settings:"
echo "  Server: squirclelabs.uk or 10.0.0.246"
echo "  Port: 143 (IMAP) or 993 (IMAPS)"
echo "  Username: daryl-mail"
echo ""
echo "SMTP Settings:"
echo "  Server: squirclelabs.uk or 10.0.0.246"
echo "  Port: 25 (SMTP) or 587 (submission)"
echo "  Username: daryl-mail"
echo ""
echo "⚠️ Don't forget to:"
echo "1. Open firewall ports: 25, 143, 587, 993"
echo "2. Update MX records to point to your server"
echo "3. Set up SSL certificates for secure email"
echo ""
