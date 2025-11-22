#!/bin/bash

# Interiowale Deployment Script
# Usage: ./deploy.sh [build|start|stop|restart|logs|status]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Check environment file
check_env() {
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found!"
        print_info "Please create .env.production from .env.production.example"
        exit 1
    fi
}

# Check SSL certificates
check_ssl() {
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        print_warning "SSL certificates not found in nginx/ssl/"
        print_info "Please run: ./deploy.sh setup-ssl"
        return 1
    fi
    return 0
}

# Setup SSL certificates (self-signed for development)
setup_ssl() {
    print_info "Setting up self-signed SSL certificates..."
    mkdir -p nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/CN=interiowale.com" 2>/dev/null
    print_info "SSL certificates created successfully!"
    print_warning "Note: These are self-signed certificates for development only."
    print_warning "For production, use Let's Encrypt certificates."
}

# Build Docker image
build() {
    print_info "Building Docker image..."
    check_env
    docker build -t interiowale/interiowale:main .
    print_info "Docker image built successfully!"
}

# Start services
start() {
    print_info "Starting services..."
    check_docker
    check_env

    if ! check_ssl; then
        print_error "SSL certificates required. Run: ./deploy.sh setup-ssl"
        exit 1
    fi

    # Create log directory if it doesn't exist
    mkdir -p /var/log/nginx 2>/dev/null || sudo mkdir -p /var/log/nginx

    docker-compose up -d
    print_info "Services started successfully!"
    print_info "Access your application at: https://interiowale.com"
    print_info "Health check: http://localhost/health"
}

# Stop services
stop() {
    print_info "Stopping services..."
    docker-compose down
    print_info "Services stopped successfully!"
}

# Restart services
restart() {
    print_info "Restarting services..."
    stop
    start
}

# View logs
logs() {
    print_info "Showing logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Check status
status() {
    print_info "Checking service status..."
    docker-compose ps

    echo ""
    print_info "Testing health endpoint..."
    if curl -s http://localhost/health > /dev/null 2>&1; then
        print_info "✓ Health check passed"
    else
        print_error "✗ Health check failed"
    fi
}

# Full deployment
deploy() {
    print_info "Starting full deployment..."
    check_docker
    check_env

    if ! check_ssl; then
        print_warning "Setting up SSL certificates..."
        setup_ssl
    fi

    print_info "Building Docker image..."
    build

    print_info "Starting services..."
    start

    print_info "Waiting for services to be ready..."
    sleep 5

    status

    print_info "Deployment complete!"
}

# Show usage
usage() {
    echo "Interiowale Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup-ssl  - Generate self-signed SSL certificates"
    echo "  build      - Build Docker image"
    echo "  start      - Start all services"
    echo "  stop       - Stop all services"
    echo "  restart    - Restart all services"
    echo "  logs       - View service logs"
    echo "  status     - Check service status"
    echo "  deploy     - Full deployment (build + start)"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh deploy     # Full deployment"
    echo "  ./deploy.sh logs       # View logs"
    echo "  ./deploy.sh status     # Check status"
}

# Main script
main() {
    case "${1:-help}" in
        setup-ssl)
            setup_ssl
            ;;
        build)
            build
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            logs
            ;;
        status)
            status
            ;;
        deploy)
            deploy
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            usage
            exit 1
            ;;
    esac
}

main "$@"
