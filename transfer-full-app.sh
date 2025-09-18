#!/bin/bash

# Full App Transfer Script
# Copy and paste this ENTIRE script into your EC2 Instance Connect terminal

echo "🚀 Starting full app deployment..."

# Update system and install Docker
echo "📦 Updating system and installing Docker..."
sudo apt update -y
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
echo "📁 Setting up application directory..."
mkdir -p ~/app
cd ~/app

echo "✅ Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Look for a file upload button in your EC2 Instance Connect browser terminal"
echo "2. Upload the 'full-app.tar.gz' file from your local machine"
echo "3. Run: tar -xzf full-app.tar.gz"
echo "4. Run: docker-compose up -d --build"
echo ""
echo "🌐 Your app will be available at: http://$(hostname -I | awk '{print $1}')"
