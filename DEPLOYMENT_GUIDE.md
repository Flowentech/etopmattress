# Docker Deployment Guide for Interiowale

## Prerequisites

- Docker and Docker Compose installed
- Domain name pointed to your server
- SSL certificates (Let's Encrypt recommended)

## Step 1: Prepare SSL Certificates

### Option A: Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Get certificates
sudo certbot certonly --standalone -d interiowale.com -d www.interiowale.com

# Copy certificates to nginx/ssl directory
sudo cp /etc/letsencrypt/live/interiowale.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/interiowale.com/privkey.pem nginx/ssl/key.pem
```

### Option B: Using Self-Signed (Development Only)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=interiowale.com"
```

## Step 2: Build Docker Image

```bash
# Build the image
docker build -t interiowale/interiowale:main .

# Test the build
docker run -p 3001:3001 --env-file .env.production interiowale/interiowale:main
```

## Step 3: Push to Docker Registry (Optional)

```bash
# Login to Docker Hub
docker login

# Tag the image
docker tag interiowale/interiowale:main yourusername/interiowale:main

# Push to registry
docker push yourusername/interiowale:main

# Update docker-compose.yml with your username
# Change: image: ${DOCKER_USERNAME:-interiowale}/interiowale:main
```

## Step 4: Deploy with Docker Compose

```bash
# Create required directories
mkdir -p nginx/ssl
mkdir -p /var/log/nginx

# Ensure .env.production is configured with all production values
# Copy from .env.production.example and update values

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify services are running
docker-compose ps
```

## Step 5: Verify Deployment

```bash
# Test health endpoint
curl http://localhost/health

# Check nginx logs
docker-compose logs nginx

# Check app logs
docker-compose logs app
```

## Step 6: Setup Auto-Renewal for SSL (Let's Encrypt)

```bash
# Add cron job for certificate renewal
sudo crontab -e

# Add this line:
0 0 1 * * certbot renew --quiet && docker-compose restart nginx
```

## Environment Variables Checklist

Ensure these are set in `.env.production`:

- ✅ `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-M3M8F2BXDP`
- ✅ `NEXT_PUBLIC_BASE_URL=https://interiowale.com`
- ✅ All Clerk production keys
- ✅ All Stripe production keys
- ✅ Sanity production tokens
- ✅ Cloudinary credentials
- ✅ Replicate API tokens
- ✅ Email service credentials

## Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild image
docker build -t interiowale/interiowale:main .

# Restart services
docker-compose down
docker-compose up -d

# Verify deployment
docker-compose logs -f
```

## Troubleshooting

### Container won't start
```bash
docker-compose logs app
```

### Nginx errors
```bash
docker-compose logs nginx
tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
# Verify certificates exist
ls -la nginx/ssl/

# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout
```

### Port conflicts
```bash
# Check if ports 80/443 are in use
sudo lsof -i :80
sudo lsof -i :443
```

## Security Recommendations

1. **Firewall**: Only allow ports 80, 443, and SSH
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

2. **Regular Updates**:
   ```bash
   # Update base images monthly
   docker pull node:18-alpine
   docker pull nginx:alpine
   docker-compose build --no-cache
   ```

3. **Backup**: Regularly backup:
   - `.env.production`
   - SSL certificates
   - Sanity CMS data

4. **Monitoring**: Set up monitoring for:
   - Container health
   - Disk space
   - SSL certificate expiry
   - Application logs

## Performance Tuning

### For high traffic:

1. **Increase worker connections** in `nginx/nginx.conf`:
   ```nginx
   worker_connections 2048;
   ```

2. **Add Docker resource limits** in `docker-compose.yml`:
   ```yaml
   app:
     deploy:
       resources:
         limits:
           cpus: '2'
           memory: 2G
   ```

3. **Enable Docker BuildKit** for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   ```

## Quick Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart app
docker-compose restart nginx

# Rebuild and restart
docker-compose up -d --build

# Clean up
docker system prune -a
```
