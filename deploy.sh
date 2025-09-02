#!/bin/bash

# 🚀 Anoud Job Website - Deployment Script
# This script automates the deployment process for both backend and frontend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="anoudjob"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
WEB_DIR="/var/www/anoudjob"
BACKEND_PORT=3000

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root"
        exit 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command_exists pm2; then
        print_warning "PM2 is not installed. Installing PM2..."
        npm install -g pm2
    fi
    
    print_success "Prerequisites check passed"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create web directory if it doesn't exist
    if [ ! -d "$WEB_DIR" ]; then
        print_status "Creating web directory: $WEB_DIR"
        sudo mkdir -p "$WEB_DIR"
        sudo chown -R $USER:$USER "$WEB_DIR"
        sudo chmod 755 "$WEB_DIR"
    fi
    
    # Create uploads directory
    if [ ! -d "$WEB_DIR/uploads" ]; then
        print_status "Creating uploads directory"
        sudo mkdir -p "$WEB_DIR/uploads"
        sudo chown -R $USER:$USER "$WEB_DIR/uploads"
        sudo chmod 755 "$WEB_DIR/uploads"
    fi
    
    print_success "Environment setup complete"
}

# Function to setup Nginx
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    # Check if Nginx is installed
    if ! command_exists nginx; then
        print_error "Nginx is not installed. Please install Nginx first."
        exit 1
    fi
    
    # Copy Nginx configuration
    if [ -f "nginx.conf" ]; then
        print_status "Installing Nginx configuration..."
        sudo cp nginx.conf /etc/nginx/sites-available/anoudjob
        sudo ln -sf /etc/nginx/sites-available/anoudjob /etc/nginx/sites-enabled/
        
        # Remove default site if it exists
        if [ -L "/etc/nginx/sites-enabled/default" ]; then
            sudo rm /etc/nginx/sites-enabled/default
        fi
        
        # Test Nginx configuration
        if sudo nginx -t; then
            print_success "Nginx configuration is valid"
        else
            print_error "Nginx configuration is invalid"
            exit 1
        fi
        
        # Reload Nginx
        sudo systemctl reload nginx
        print_success "Nginx configuration installed and reloaded"
    else
        print_warning "nginx.conf not found, skipping Nginx setup"
    fi
}

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend..."
    
    cd "$BACKEND_DIR"
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install --production
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Please create one from env.example"
        print_status "Copying env.example to .env..."
        cp env.example .env
        print_warning "Please edit .env file with your production values before continuing"
        read -p "Press Enter after editing .env file..."
    fi
    
    # Start/restart with PM2
    print_status "Starting backend with PM2..."
    if pm2 list | grep -q "anoudjob-backend"; then
        pm2 restart anoudjob-backend
        print_success "Backend restarted"
    else
        pm2 start server.js --name "anoudjob-backend"
        print_success "Backend started"
    fi
    
    # Save PM2 configuration
    pm2 save
    
    cd ..
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Build production version
    print_status "Building production version..."
    npm run build
    
    # Copy to web directory
    print_status "Copying build files to web directory..."
    sudo cp -r build/* "$WEB_DIR/frontend/"
    
    # Set proper permissions
    sudo chown -R $USER:$USER "$WEB_DIR/frontend"
    sudo chmod -R 755 "$WEB_DIR/frontend"
    
    cd ..
    
    print_success "Frontend deployed successfully"
}

# Function to setup nginx
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    # Check if nginx is installed
    if ! command_exists nginx; then
        print_warning "Nginx is not installed. Please install Nginx first."
        return
    fi
    
    # Create nginx configuration
    NGINX_CONF="/etc/nginx/sites-available/anoudjob.com"
    
    if [ ! -f "$NGINX_CONF" ]; then
        print_status "Creating Nginx configuration..."
        sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name anoudjob.com www.anoudjob.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name anoudjob.com www.anoudjob.com;
    
    # SSL Configuration (update paths)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Frontend
    location / {
        root $WEB_DIR/frontend;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # File uploads
    location /uploads/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
        
        print_success "Nginx configuration created"
    else
        print_status "Nginx configuration already exists"
    fi
    
    # Enable site if not already enabled
    if [ ! -L "/etc/nginx/sites-enabled/anoudjob.com" ]; then
        print_status "Enabling Nginx site..."
        sudo ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/
    fi
    
    # Test nginx configuration
    print_status "Testing Nginx configuration..."
    if sudo nginx -t; then
        print_success "Nginx configuration is valid"
        print_status "Reloading Nginx..."
        sudo systemctl reload nginx
    else
        print_error "Nginx configuration is invalid. Please check the configuration."
        exit 1
    fi
}

# Function to health check
health_check() {
    print_status "Performing health checks..."
    
    # Check backend
    if curl -s "http://localhost:$BACKEND_PORT/health" > /dev/null; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Check PM2 status
    print_status "PM2 status:"
    pm2 status
    
    # Check nginx status
    if command_exists nginx; then
        if sudo systemctl is-active --quiet nginx; then
            print_success "Nginx is running"
        else
            print_error "Nginx is not running"
        fi
    fi
    
    print_success "Health checks completed"
}

# Function to show deployment summary
show_summary() {
    echo
    echo "=========================================="
    echo "🚀 DEPLOYMENT SUMMARY"
    echo "=========================================="
    echo "✅ Backend: Running on port $BACKEND_PORT"
    echo "✅ Frontend: Served from $WEB_DIR/frontend"
    echo "✅ Uploads: Directory at $WEB_DIR/uploads"
    echo "✅ PM2: Process manager configured"
    echo "✅ Nginx: Configuration created"
    echo
    echo "🔗 Next steps:"
    echo "1. Update SSL certificate paths in Nginx config"
    echo "2. Configure your domain DNS"
    echo "3. Test the website at https://anoudjob.com"
    echo "4. Monitor logs: pm2 logs anoudjob-backend"
    echo "=========================================="
}

# Main deployment function
main() {
    echo "🚀 Starting Anoud Job Website deployment..."
    echo
    
    # Check if running as root
    check_root
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment
    setup_environment
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    # Setup nginx
    setup_nginx
    
    # Health check
    health_check
    
    # Show summary
    show_summary
    
    print_success "Deployment completed successfully! 🎉"
}

# Run main function
main "$@"
