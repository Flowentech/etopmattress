#!/bin/bash

# Server Setup Script for InterioWale VPS
# This script sets up the server with Docker, Nginx, and security configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🖥️  InterioWale Server Setup${NC}"
echo "================================"

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

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Update system
print_header "📦 Updating System Packages"
apt update && apt upgrade -y

# Install essential packages
print_header "📦 Installing Essential Packages"
apt install -y curl wget git vim htop ufw fail2ban nginx docker.io docker-compose certbot python3-certbot-nginx

# Create deployment user
print_header "👤 Creating Deployment User"
if ! id "deploy" &>/dev/null; then
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo,docker deploy
    print_status "Created user 'deploy' with sudo and docker access"

    # Setup SSH key for deploy user
    mkdir -p /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    print_warning "Please add your SSH public key to /home/deploy/.ssh/authorized_keys"
else
    print_status "User 'deploy' already exists"
fi

# Configure UFW firewall
print_header "🔒 Configuring Firewall"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
print_header "🚨 Configuring Fail2Ban"
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Setup Docker
print_header "🐳 Configuring Docker"
systemctl enable docker
systemctl start docker

# Create docker group if it doesn't exist
if ! getent group docker > /dev/null 2>&1; then
    groupadd docker
fi

# Optimize system for production
print_header "⚡ System Optimization"

# Configure system limits
cat >> /etc/security/limits.conf << EOF
# Docker and nginx limits
* soft nofile 65536
* hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF

# Configure sysctl for networking
cat >> /etc/sysctl.conf << EOF

# Network optimization for production
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.tcp_congestion_control = bbr
net.core.netdev_max_backlog = 5000
EOF

sysctl -p

# Setup log rotation
print_header "📋 Configuring Log Rotation"
cat > /etc/logrotate.d/interiowale << EOF
/opt/interiowale/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/interiowale/docker-compose.yml restart nginx
    endscript
}
EOF

# Create deployment directory structure
print_header "📁 Creating Deployment Structure"
mkdir -p /opt/interiowale
mkdir -p /opt/backups/interiowale
mkdir -p /opt/interiowale/nginx/ssl

# Set permissions
chown -R deploy:deploy /opt/interiowale
chown -R deploy:deploy /opt/backups/interiowale

# Install monitoring script
print_header "📊 Setting up Monitoring"
cat > /usr/local/bin/interiowale-monitor << 'EOF'
#!/bin/bash
# Simple monitoring script for InterioWale

LOG_FILE="/var/log/interiowale-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check Docker containers
if ! docker-compose -f /opt/interiowale/docker-compose.yml ps | grep -q "Up"; then
    echo "[$DATE] ERROR: Some containers are down" >> $LOG_FILE
    # Restart containers
    docker-compose -f /opt/interiowale/docker-compose.yml restart
    echo "[$DATE] INFO: Attempted to restart containers" >> $LOG_FILE
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "[$DATE] WARNING: Memory usage is ${MEM_USAGE}%" >> $LOG_FILE
fi
EOF

chmod +x /usr/local/bin/interiowale-monitor

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/interiowale-monitor") | crontab -

print_header "✅ Server Setup Complete!"
echo ""
print_status "Next steps:"
echo "1. Add your SSH key to /home/deploy/.ssh/authorized_keys"
echo "2. Run 'su - deploy' to switch to deployment user"
echo "3. Clone your repository: git clone <your-repo> /opt/interiowale"
echo "4. Configure .env.production file"
echo "5. Run the deployment script: ./scripts/deploy.sh"
echo "6. Setup SSL: ./scripts/setup-ssl.sh"
echo ""
print_warning "Remember to:"
echo "- Configure your DNS to point to this server"
echo "- Set up proper monitoring and alerts"
echo "- Regularly backup your data"