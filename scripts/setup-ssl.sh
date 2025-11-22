#!/bin/bash

# SSL Setup Script for InterioWale
# This script sets up SSL certificates using Let's Encrypt

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="interiowale.com"
WWW_DOMAIN="www.interiowale.com"
EMAIL="admin@interiowale.com"
NGINX_SSL_DIR="/opt/interiowale/nginx/ssl"

echo -e "${GREEN}🔐 Setting up SSL certificates for $DOMAIN${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root for SSL operations
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root for SSL certificate operations"
   exit 1
fi

# Install Certbot if not already installed
if ! command -v certbot >/dev/null 2>&1; then
    print_status "Installing Certbot..."

    # Detect OS
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt update
        apt install -y certbot python3-certbot-nginx
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        yum install -y epel-release
        yum install -y certbot python3-certbot-nginx
    else
        print_error "Unsupported OS. Please install Certbot manually."
        exit 1
    fi
fi

# Create SSL directory if it doesn't exist
mkdir -p $NGINX_SSL_DIR

# Stop nginx to free up port 80
print_status "Stopping nginx temporarily..."
systemctl stop nginx || docker-compose -f /opt/interiowale/docker-compose.yml stop nginx || true

# Generate SSL certificates
print_status "Generating SSL certificates for $DOMAIN..."

# Get certificate for main domain
certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --domains $DOMAIN,$WWW_DOMAIN \
    --force-renewal

# Copy certificates to nginx ssl directory
print_status "Copying certificates to nginx directory..."
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $NGINX_SSL_DIR/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $NGINX_SSL_DIR/key.pem

# Set proper permissions
chmod 600 $NGINX_SSL_DIR/*
chown root:root $NGINX_SSL_DIR/*

# Start nginx again
print_status "Starting nginx..."
systemctl start nginx || docker-compose -f /opt/interiowale/docker-compose.yml start nginx || true

# Set up auto-renewal
print_status "Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /opt/interiowale/docker-compose.yml restart nginx") | crontab -

print_status "✅ SSL certificates have been successfully installed!"
print_status "Certificates will auto-renew daily."
print_status "Certificate location: $NGINX_SSL_DIR/"
print_status "To test renewal: certbot renew --dry-run"