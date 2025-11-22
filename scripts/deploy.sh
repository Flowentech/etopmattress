#!/bin/bash

# InterioWale Deployment Script
# This script deploys the application to production VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="git@github.com:yourusername/interiowale.git"
DEPLOY_DIR="/opt/interiowale"
BACKUP_DIR="/opt/backups/interiowale"
SERVICE_NAME="interiowale"

echo -e "${GREEN}🚀 Starting InterioWale deployment...${NC}"

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if Docker and Docker Compose are installed
command -v docker >/dev/null 2>&1 || { print_error "Docker is not installed. Please install Docker first."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { print_error "Docker Compose is not installed. Please install Docker Compose first."; exit 1; }

# Create necessary directories
print_status "Creating necessary directories..."
sudo mkdir -p $DEPLOY_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $DEPLOY_DIR/nginx/ssl

# Set permissions
sudo chown -R $USER:$USER $DEPLOY_DIR
sudo chown -R $USER:$USER $BACKUP_DIR

# Clone or update the repository
if [ -d "$DEPLOY_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $DEPLOY_DIR
    git fetch origin main
    git reset --hard origin/main
else
    print_status "Cloning repository..."
    git clone $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

# Check if .env.production exists, if not create from example
if [ ! -f "$DEPLOY_DIR/.env.production" ]; then
    if [ -f "$DEPLOY_DIR/.env.example" ]; then
        print_warning ".env.production not found, creating from .env.example"
        cp $DEPLOY_DIR/.env.example $DEPLOY_DIR/.env.production
        print_warning "Please edit $DEPLOY_DIR/.env.production with your production values"
        exit 1
    else
        print_error ".env.example not found. Please create .env.production manually."
        exit 1
    fi
fi

# Backup current containers if they exist
print_status "Creating backup of current deployment..."
if docker-compose ps -q | grep -q .; then
    sudo docker-compose down
    sudo docker tag interiowale:latest interiowale:backup-$(date +%Y%m%d-%H%M%S)
fi

# Build and start new containers
print_status "Building Docker images..."
docker-compose build --no-cache

print_status "Starting services..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Services are running successfully!"
else
    print_error "❌ Services failed to start. Check logs with 'docker-compose logs'"
    exit 1
fi

# Run health check
print_status "Running health check..."
if curl -f http://localhost/health >/dev/null 2>&1; then
    print_status "✅ Health check passed!"
else
    print_warning "⚠️  Health check failed, but deployment may still be successful"
fi

# Clean up old images
print_status "Cleaning up old Docker images..."
docker image prune -f

print_status "🎉 Deployment completed successfully!"
print_status "Your application is now available at: https://interiowale.com"
print_status "To view logs: docker-compose logs -f"
print_status "To stop: docker-compose down"