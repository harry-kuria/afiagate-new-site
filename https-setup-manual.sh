#!/bin/bash

# Manual HTTPS Setup Script for EC2 Instance Connect
# Copy and paste this entire script into EC2 Instance Connect terminal

echo "🔒 Setting up HTTPS for your React app..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check current status
print_status "Checking current status..."
pm2 status
sudo systemctl status nginx

# Step 2: Fix nginx configuration
print_status "Fixing nginx configuration..."

# Stop nginx
sudo systemctl stop nginx

# Create a simple HTTP-only nginx config first
sudo tee /etc/nginx/sites-available/afiagate << 'NGINX'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# Test and start nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

print_status "✅ Nginx configured and started"

# Step 3: Test HTTP access
print_status "Testing HTTP access..."
curl -s http://localhost:80 | head -5

# Step 4: Set up HTTPS with Let's Encrypt
print_status "Setting up HTTPS with Let's Encrypt..."

# Get the public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
DOMAIN="${PUBLIC_IP}.nip.io"

echo "Using domain: $DOMAIN"

# Stop nginx temporarily for certificate verification
sudo systemctl stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@example.com

if [ $? -eq 0 ]; then
    print_status "✅ SSL certificate obtained successfully!"
    
    # Create HTTPS nginx configuration
    sudo tee /etc/nginx/sites-available/afiagate << 'NGINX'
server {
    listen 80;
    server_name _;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;
    
    ssl_certificate /etc/letsencrypt/live/54.242.178.144.nip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/54.242.178.144.nip.io/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

    # Test nginx configuration
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        # Start nginx
        sudo systemctl start nginx
        
        print_status "✅ HTTPS configured successfully!"
        print_status "🔒 HTTPS URL: https://$DOMAIN"
        print_status "🌐 HTTP URL: http://$PUBLIC_IP (redirects to HTTPS)"
        
        # Test HTTPS
        sleep 5
        if curl -s -k https://$DOMAIN > /dev/null; then
            print_status "✅ HTTPS is working!"
        else
            print_warning "HTTPS test failed, but configuration is correct"
        fi
    else
        print_error "Nginx configuration test failed"
        # Fallback to HTTP-only
        sudo tee /etc/nginx/sites-available/afiagate << 'NGINX'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
        sudo nginx -t
        sudo systemctl start nginx
        print_status "🌐 HTTP-only mode active: http://$PUBLIC_IP"
    fi
else
    print_error "Failed to obtain SSL certificate"
    print_status "Falling back to HTTP-only mode..."
    
    # Fallback to HTTP-only
    sudo tee /etc/nginx/sites-available/afiagate << 'NGINX'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
    sudo nginx -t
    sudo systemctl start nginx
    print_status "🌐 HTTP-only mode active: http://$PUBLIC_IP"
fi

# Step 5: Final status
print_status "🎉 Setup completed!"
print_status "📊 PM2 Status:"
pm2 status
print_status "📋 Nginx Status:"
sudo systemctl status nginx --no-pager -l
print_status "🌐 Your app should be accessible at:"
print_status "   HTTP: http://$PUBLIC_IP"
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_status "   HTTPS: https://$DOMAIN"
fi
