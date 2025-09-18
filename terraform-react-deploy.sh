#!/bin/bash

# React App Terraform Deployment Script with PM2 and HTTPS

echo "🚀 Starting React app deployment with PM2 and HTTPS..."

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

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed. Please install Terraform first."
    exit 1
fi

# Check if AWS CLI is configured
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install AWS CLI first."
    exit 1
fi

# Step 1: Initialize Terraform
print_status "Initializing Terraform..."
terraform init

if [ $? -ne 0 ]; then
    print_error "Terraform initialization failed!"
    exit 1
fi

# Step 2: Plan Terraform deployment
print_status "Planning Terraform deployment..."
terraform plan

if [ $? -ne 0 ]; then
    print_error "Terraform plan failed!"
    exit 1
fi

# Step 3: Apply Terraform configuration
print_status "Creating infrastructure with Terraform..."
terraform apply -auto-approve

if [ $? -ne 0 ]; then
    print_error "Terraform apply failed!"
    exit 1
fi

# Step 4: Get the server details
SERVER_IP=$(terraform output -raw public_ip)
INSTANCE_ID=$(terraform output -raw instance_id)

print_status "Infrastructure created successfully!"
print_status "Server IP: $SERVER_IP"
print_status "Instance ID: $INSTANCE_ID"

# Step 5: Wait for server to be ready
print_status "Waiting for server to be ready..."
sleep 90

# Step 6: Test server connectivity
print_status "Testing server connectivity..."
for i in {1..15}; do
    if curl -s -m 10 http://$SERVER_IP > /dev/null; then
        print_status "Server is responding!"
        break
    else
        print_warning "Server not ready yet, waiting... (attempt $i/15)"
        sleep 30
    fi
done

# Step 7: Upload the React app files
print_status "Uploading React app files..."
scp -i ~/.ssh/afiagate-key.pem -o StrictHostKeyChecking=no -r src/ public/ package.json package-lock.json tsconfig.json ubuntu@$SERVER_IP:/home/ubuntu/afiagate-app/

if [ $? -ne 0 ]; then
    print_error "Failed to upload files via SCP!"
    print_warning "You can manually upload files using EC2 Instance Connect"
else
    print_status "Files uploaded successfully!"
fi

# Step 8: Install dependencies and start the app
print_status "Installing dependencies and starting the app..."
ssh -i ~/.ssh/afiagate-key.pem -o StrictHostKeyChecking=no ubuntu@$SERVER_IP << 'EOF'
cd /home/ubuntu/afiagate-app
npm install
pm2 delete afiagate-app 2>/dev/null || true
pm2 start npm --name "afiagate-app" -- start
pm2 save
pm2 startup
EOF

if [ $? -ne 0 ]; then
    print_warning "Could not start the app via SSH"
    print_warning "You can start it manually via EC2 Instance Connect"
else
    print_status "React app started successfully with PM2!"
fi

# Step 9: Set up HTTPS with Let's Encrypt
print_status "Setting up HTTPS with Let's Encrypt..."
ssh -i ~/.ssh/afiagate-key.pem -o StrictHostKeyChecking=no ubuntu@$SERVER_IP << 'EOF'
# Stop nginx temporarily
sudo systemctl stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4).nip.io --non-interactive --agree-tos --email admin@example.com

# Update nginx configuration for HTTPS
sudo tee /etc/nginx/sites-available/afiagate << 'NGINX'
server {
    listen 80;
    server_name _;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name _;
    
    ssl_certificate /etc/letsencrypt/live/$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4).nip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4).nip.io/privkey.pem;
    
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

# Start nginx
sudo systemctl start nginx
EOF

if [ $? -ne 0 ]; then
    print_warning "HTTPS setup failed, but HTTP should still work"
else
    print_status "HTTPS setup completed!"
fi

# Step 10: Final status
print_status "🎉 React app deployment completed!"
print_status "🌐 HTTP URL: http://$SERVER_IP"
print_status "🔒 HTTPS URL: https://$SERVER_IP.nip.io"
print_status "📊 PM2 Status: ssh -i ~/.ssh/afiagate-key.pem ubuntu@$SERVER_IP 'pm2 status'"
print_status "📋 PM2 Logs: ssh -i ~/.ssh/afiagate-key.pem ubuntu@$SERVER_IP 'pm2 logs afiagate-app'"
print_status "🛑 To destroy infrastructure: terraform destroy"
print_status "🔄 To update app: scp -i ~/.ssh/afiagate-key.pem -r src/ public/ package.json ubuntu@$SERVER_IP:/home/ubuntu/afiagate-app/ && ssh -i ~/.ssh/afiagate-key.pem ubuntu@$SERVER_IP 'cd /home/ubuntu/afiagate-app && npm install && pm2 restart afiagate-app'"

# Show Terraform outputs
echo ""
print_status "Terraform Outputs:"
terraform output
