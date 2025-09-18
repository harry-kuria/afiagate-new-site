#!/bin/bash

# Fast Deployment Script - No Docker Build Required
# Server: 98.87.250.170

echo "🚀 Starting fast deployment..."

# Configuration
SERVER_IP="98.87.250.170"
KEY_FILE="~/.ssh/afiagate-key.pem"
SERVER_USER="ubuntu"

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Step 1: Build locally (faster)
print_status "Building the React application locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the build errors first."
    exit 1
fi

print_status "Build completed successfully!"

# Step 2: Create deployment package (only built files)
print_status "Creating deployment package..."
rm -f fast-deploy.tar.gz
tar -czf fast-deploy.tar.gz build/

print_status "Deployment package created!"

# Step 3: Upload to server
print_status "Uploading files to server..."
scp -i $KEY_FILE -o StrictHostKeyChecking=no fast-deploy.tar.gz $SERVER_USER@$SERVER_IP:~/

print_status "Files uploaded successfully!"

# Step 4: Deploy on server (fast nginx setup)
print_status "Deploying on server..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
echo "🔧 Setting up fast deployment..."

# Install nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "🌐 Installing nginx..."
    sudo apt update -y
    sudo apt install -y nginx
fi

# Create app directory
sudo mkdir -p /var/www/afiagate
cd /var/www/afiagate

# Extract deployment package
echo "📦 Extracting deployment package..."
sudo tar -xzf ~/fast-deploy.tar.gz
sudo mv build/* .
sudo rmdir build

# Set permissions
sudo chown -R www-data:www-data /var/www/afiagate
sudo chmod -R 755 /var/www/afiagate

# Create nginx configuration
echo "🌐 Configuring nginx..."
sudo tee /etc/nginx/sites-available/afiagate << 'NGINX'
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
}
NGINX

# Enable the site
sudo ln -sf /etc/nginx/sites-available/afiagate /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Set up firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Clean up
rm ~/fast-deploy.tar.gz

echo "✅ Fast deployment completed!"
EOF

# Clean up local files
rm -f fast-deploy.tar.gz

print_status "🎉 Fast deployment completed successfully!"
print_status "🌐 Your app should be available at: http://$SERVER_IP"
print_status "📊 To view nginx logs: ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/access.log'"
print_status "🛑 To stop: ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP 'sudo systemctl stop nginx'"
print_status "🔄 To restart: ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP 'sudo systemctl restart nginx'"
