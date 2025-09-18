#!/bin/bash

# Deployment Script for Server: 54.242.178.144
# Copy and paste this entire script into your EC2 Instance Connect browser terminal

echo "🚀 Starting deployment to 54.242.178.144..."

# Update system
echo "📦 Updating system packages..."
sudo apt update -y

# Install required packages
echo "🔧 Installing required packages..."
sudo apt install -y nginx curl wget unzip

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/afiagate
sudo chown -R www-data:www-data /var/www/afiagate

# Download and extract the application
echo "📥 Downloading application..."
cd /tmp
wget -O afiagate-app.tar.gz "https://raw.githubusercontent.com/your-repo/afiagate-webapp/main/full-app.tar.gz"

# Extract the application
echo "📦 Extracting application..."
sudo tar -xzf afiagate-app.tar.gz -C /var/www/afiagate --strip-components=1

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/afiagate
sudo chmod -R 755 /var/www/afiagate

# Configure nginx
echo "🌐 Configuring nginx..."
sudo tee /etc/nginx/sites-available/afiagate << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /var/www/afiagate;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable the site
echo "🔗 Enabling nginx site..."
sudo ln -sf /etc/nginx/sites-available/afiagate /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

# Restart nginx
echo "🔄 Restarting nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Check status
echo "📊 Checking service status..."
sudo systemctl status nginx --no-pager -l

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your application is now available at:"
echo "   http://54.242.178.144"
echo ""
echo "🔍 To check if it's working:"
echo "   curl -I http://54.242.178.144"
