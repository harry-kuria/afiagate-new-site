#!/bin/bash

# Comprehensive SSH Deployment Script for 54.242.178.144
# This script will SSH to your server and perform the complete deployment

echo "🚀 Starting SSH deployment to 54.242.178.144..."

# Configuration
SERVER_IP="3.230.72.136"
SERVER_USER="ubuntu"
KEY_FILE="~/.ssh/afiagate-key.pem"

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

# Check if deployment package exists
if [ ! -f "full-app.tar.gz" ]; then
    print_error "full-app.tar.gz not found! Building the application..."
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Build failed! Please fix the build errors first."
        exit 1
    fi
    print_status "Build completed successfully!"
fi

# Test SSH connection
print_status "Testing SSH connection..."
if ssh -i $KEY_FILE -o ConnectTimeout=10 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'SSH test successful'" 2>/dev/null; then
    print_status "SSH connection successful!"
else
    print_error "SSH connection failed. Please check:"
    echo "1. Server is running at $SERVER_IP"
    echo "2. SSH key permissions: chmod 600 ~/.ssh/afiagate-key.pem"
    echo "3. Security group allows SSH (port 22)"
    echo "4. Try using EC2 Instance Connect instead"
    exit 1
fi

# Create deployment script on server
print_status "Creating deployment script on server..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
#!/bin/bash

echo "🚀 Starting deployment on server..."

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

# Configure nginx
echo "🌐 Configuring nginx..."
sudo tee /etc/nginx/sites-available/afiagate << 'NGINX_EOF'
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
NGINX_EOF

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

echo "✅ Server setup completed!"
EOF

# Upload the application files
print_status "Uploading application files..."
scp -i $KEY_FILE -o StrictHostKeyChecking=no full-app.tar.gz $SERVER_USER@$SERVER_IP:~/

# Extract and deploy the application
print_status "Deploying application..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
echo "📦 Extracting application..."
sudo tar -xzf ~/full-app.tar.gz -C /var/www/afiagate --strip-components=1
sudo chown -R www-data:www-data /var/www/afiagate
sudo chmod -R 755 /var/www/afiagate

echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

echo "📊 Checking service status..."
sudo systemctl status nginx --no-pager -l

echo "🧪 Testing the application..."
curl -I http://localhost
EOF

# Test the deployment
print_status "Testing deployment..."
sleep 5
if curl -s -I http://$SERVER_IP | head -1 | grep -q "200\|301\|302"; then
    print_status "✅ Deployment successful!"
    echo "🌐 Your application is now available at:"
    echo "   http://$SERVER_IP"
else
    print_warning "⚠️  Deployment may need manual verification"
    echo "🌐 Check your application at:"
    echo "   http://$SERVER_IP"
fi

echo ""
echo "📝 Next steps:"
echo "1. Set up HTTPS: ./simple-https-setup.sh"
echo "2. Configure your domain if needed"
echo "3. Monitor logs: ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/access.log'"
