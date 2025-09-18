#!/bin/bash

# Deploy to Existing Instance Script
# Instance ID: i-0f2cfcf21f5224d37
# IP: 98.87.250.170

echo "🚀 Deploying to existing instance..."

# Configuration
INSTANCE_ID="i-0f2cfcf21f5224d37"
SERVER_IP="98.87.250.170"
KEY_FILE="~/.ssh/afiagate-key.pem"
SERVER_USER="ubuntu"

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

# Step 1: Build the React application
print_status "Building the React application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed! Please fix the build errors first."
    exit 1
fi

print_status "Build completed successfully!"

# Step 2: Check instance status
print_status "Checking instance status..."
INSTANCE_STATE=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].State.Name' --output text)

if [ "$INSTANCE_STATE" != "running" ]; then
    print_error "Instance is not running. Current state: $INSTANCE_STATE"
    print_status "Starting instance..."
    aws ec2 start-instances --instance-ids $INSTANCE_ID
    print_status "Waiting for instance to start..."
    aws ec2 wait instance-running --instance-ids $INSTANCE_ID
    sleep 30
fi

# Step 3: Get the public IP
SERVER_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
print_status "Instance IP: $SERVER_IP"

# Step 4: Wait for SSH to be available
print_status "Waiting for SSH to be available..."
for i in {1..20}; do
    if ssh -i $KEY_FILE -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'SSH test'" 2>/dev/null; then
        print_status "SSH connection successful!"
        break
    else
        print_warning "SSH not ready yet, waiting... (attempt $i/20)"
        sleep 15
    fi
done

# Step 5: Deploy using EC2 Instance Connect instructions
print_status "Since SSH is having issues, please use EC2 Instance Connect:"
echo ""
echo "📋 Manual Deployment Steps:"
echo "1. Go to AWS Console → EC2 → Instances"
echo "2. Select instance: $INSTANCE_ID"
echo "3. Click 'Connect' → 'EC2 Instance Connect'"
echo "4. Click 'Connect' to open browser terminal"
echo ""
echo "5. Run these commands in the browser terminal:"
echo "   sudo apt update -y"
echo "   sudo apt install -y nginx"
echo "   sudo mkdir -p /var/www/afiagate"
echo "   sudo chown -R www-data:www-data /var/www/afiagate"
echo ""
echo "6. Upload your build files:"
echo "   - Look for file upload in EC2 Instance Connect"
echo "   - Upload the 'build' folder from your local machine"
echo "   - Extract to /var/www/afiagate/"
echo ""
echo "7. Configure nginx:"
echo "   sudo tee /etc/nginx/sites-available/afiagate << 'EOF'"
echo "   server {"
echo "       listen 80;"
echo "       server_name _;"
echo "       root /var/www/afiagate;"
echo "       index index.html;"
echo "       location / {"
echo "           try_files \$uri \$uri/ /index.html;"
echo "       }"
echo "   }"
echo "   EOF"
echo ""
echo "8. Enable the site:"
echo "   sudo ln -sf /etc/nginx/sites-available/afiagate /etc/nginx/sites-enabled/"
echo "   sudo rm -f /etc/nginx/sites-enabled/default"
echo "   sudo systemctl restart nginx"
echo ""
echo "🌐 Your app will be available at: http://$SERVER_IP"
echo ""
print_status "Alternative: Try SSH again in a few minutes:"
echo "ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP"
