#!/bin/bash

# Git-based Deployment Script
# Copy and paste this ENTIRE script into your EC2 Instance Connect terminal

echo "🚀 Starting Git-based deployment..."

# Update system and install Docker
echo "📦 Updating system and installing Docker..."
sudo apt update -y
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release git
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory and clone from Git
echo "📁 Cloning from Git repository..."
mkdir -p ~/app
cd ~/app

# Clone your repository (replace with your actual Git URL)
git clone https://github.com/harry-kuria/afiagate-new-site.git .
# OR if you want to use SSH: git clone git@github.com:harry-kuria/afiagate-new-site.git .

# Set up firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Deploy the application
echo "🚀 Deploying the application..."
docker-compose up -d --build

# Check status
echo "🔍 Checking deployment status..."
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=10

echo "✅ Deployment completed!"
echo "🌐 Your app is available at: http://$(hostname -I | awk '{print $1}')"
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
echo "📥 To update from Git: git pull && docker-compose up -d --build"

