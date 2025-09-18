#!/bin/bash

# Quick Setup Script for AWS EC2
# Run this after connecting to your EC2 instance

echo "🚀 Setting up Afiagate Web App on EC2..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
echo "📁 Creating app directory..."
mkdir -p ~/app
cd ~/app

# Set up firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Log out and log back in: exit"
echo "2. Reconnect: ssh -i your-key.pem ubuntu@YOUR_IP"
echo "3. Upload your app files from your local machine:"
echo "   scp -i your-key.pem -r . ubuntu@YOUR_IP:~/app/"
echo "4. Deploy your app:"
echo "   cd ~/app && chmod +x simple-deploy.sh && ./simple-deploy.sh"
echo ""
echo "🌐 Your app will be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"

