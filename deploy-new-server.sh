#!/bin/bash

# Deployment Script for New Server
# Server: 98.87.250.170

echo "🚀 Starting deployment to new server..."

# Configuration
SERVER_IP="98.87.250.170"
KEY_FILE="~/.ssh/afiagate-key.pem"
SERVER_USER="ubuntu"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Step 1: Build the application
print_status "Building the React application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed! Please fix the build errors first."
    exit 1
fi

print_status "Build completed successfully!"

# Step 2: Create deployment package
print_status "Creating deployment package..."
rm -f deploy-package.tar.gz
tar -czf deploy-package.tar.gz build/ package.json package-lock.json Dockerfile docker-compose.yml nginx.conf src/ public/ tsconfig.json

if [ $? -ne 0 ]; then
    print_error "Failed to create deployment package!"
    exit 1
fi

print_status "Deployment package created!"

# Step 3: Upload to server
print_status "Uploading files to server..."
scp -i $KEY_FILE -o StrictHostKeyChecking=no deploy-package.tar.gz $SERVER_USER@$SERVER_IP:~/

if [ $? -ne 0 ]; then
    print_error "Failed to upload files to server!"
    print_warning "Please check your SSH connection and try again."
    exit 1
fi

print_status "Files uploaded successfully!"

# Step 4: Deploy on server
print_status "Deploying on server..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
echo "🔧 Setting up server environment..."

# Update system
sudo apt update -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create app directory
mkdir -p ~/app
cd ~/app

# Extract deployment package
echo "📦 Extracting deployment package..."
tar -xzf ~/deploy-package.tar.gz

# Set up firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Deploy the application
echo "🚀 Deploying application..."
docker-compose up -d --build

# Clean up
rm ~/deploy-package.tar.gz

echo "✅ Deployment completed on server!"
EOF

if [ $? -ne 0 ]; then
    print_error "Deployment failed on server!"
    print_warning "Please connect to your server manually and check the logs."
    exit 1
fi

# Step 5: Clean up local files
rm -f deploy-package.tar.gz

print_status "🎉 Deployment completed successfully!"
print_status "🌐 Your app should be available at: http://$SERVER_IP"
print_status "📊 To view logs: ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP 'cd ~/app && docker-compose logs -f'"
print_status "🛑 To stop: ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP 'cd ~/app && docker-compose down'"
print_status "🔄 To restart: ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP 'cd ~/app && docker-compose restart'"
