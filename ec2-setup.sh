#!/bin/bash

# EC2 Instance Setup Script
# Run this on your EC2 instance to prepare it for deployment

echo "🔧 Setting up EC2 instance for Afiagate Web App..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

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

# Create docker-compose.yml for easy management
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  afiagate-webapp:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/var/log/nginx
EOF

# Create logs directory
mkdir -p logs

# Set up firewall (if using UFW)
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create systemd service for auto-start
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/afiagate-webapp.service > /dev/null << 'EOF'
[Unit]
Description=Afiagate Web App
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/app
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable afiagate-webapp.service

echo "✅ EC2 setup completed!"
echo "📋 Next steps:"
echo "1. Log out and log back in for docker group changes to take effect"
echo "2. Upload your app files to ~/app directory"
echo "3. Run: docker-compose up -d"
echo "4. Your app will be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
