#!/bin/bash

# Terraform Deployment Script for Afiagate Web App

echo "🚀 Starting Terraform deployment..."

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
    print_warning "Visit: https://developer.hashicorp.com/terraform/downloads"
    exit 1
fi

# Check if AWS CLI is configured
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install AWS CLI first."
    exit 1
fi

# Build the React application
print_status "Building the React application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed! Please fix the build errors first."
    exit 1
fi

print_status "Build completed successfully!"

# Initialize Terraform
print_status "Initializing Terraform..."
terraform init

if [ $? -ne 0 ]; then
    print_error "Terraform initialization failed!"
    exit 1
fi

# Plan Terraform deployment
print_status "Planning Terraform deployment..."
terraform plan

if [ $? -ne 0 ]; then
    print_error "Terraform plan failed!"
    exit 1
fi

# Apply Terraform configuration
print_status "Creating infrastructure with Terraform..."
terraform apply -auto-approve

if [ $? -ne 0 ]; then
    print_error "Terraform apply failed!"
    exit 1
fi

# Get the server IP
SERVER_IP=$(terraform output -raw public_ip)
INSTANCE_ID=$(terraform output -raw instance_id)

print_status "Infrastructure created successfully!"
print_status "Server IP: $SERVER_IP"
print_status "Instance ID: $INSTANCE_ID"

# Wait for server to be ready
print_status "Waiting for server to be ready..."
sleep 60

# Test server connectivity
print_status "Testing server connectivity..."
for i in {1..10}; do
    if curl -s -m 10 http://$SERVER_IP > /dev/null; then
        print_status "Server is responding!"
        break
    else
        print_warning "Server not ready yet, waiting... (attempt $i/10)"
        sleep 30
    fi
done

# Upload the built app
print_status "Uploading application files..."
scp -i ~/.ssh/afiagate-key.pem -o StrictHostKeyChecking=no -r build/* ubuntu@$SERVER_IP:/var/www/afiagate/

if [ $? -ne 0 ]; then
    print_error "Failed to upload files!"
    print_warning "You can manually upload files using EC2 Instance Connect"
else
    print_status "Files uploaded successfully!"
fi

# Restart nginx to ensure changes take effect
print_status "Restarting nginx..."
ssh -i ~/.ssh/afiagate-key.pem -o StrictHostKeyChecking=no ubuntu@$SERVER_IP "sudo systemctl restart nginx"

print_status "🎉 Deployment completed successfully!"
print_status "🌐 Your app is available at: http://$SERVER_IP"
print_status "📊 To view logs: ssh -i ~/.ssh/afiagate-key.pem ubuntu@$SERVER_IP 'sudo tail -f /var/log/nginx/access.log'"
print_status "🛑 To destroy infrastructure: terraform destroy"
print_status "🔄 To update app: scp -i ~/.ssh/afiagate-key.pem -r build/* ubuntu@$SERVER_IP:/var/www/afiagate/"
