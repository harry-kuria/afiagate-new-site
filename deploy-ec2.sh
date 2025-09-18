#!/bin/bash

# AWS EC2 Deployment Script for Afiagate Web App
# This script deploys your React app to an EC2 instance and keeps it running

# Configuration
EC2_INSTANCE_ID="your-ec2-instance-id"
EC2_USER="ubuntu"  # or "ec2-user" for Amazon Linux
REGION="us-east-1"
KEY_FILE="your-key.pem"

echo "🚀 Starting deployment to EC2..."

# Build the application locally
echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf deploy.tar.gz build/ package.json package-lock.json Dockerfile nginx.conf

# Upload to EC2
echo "📤 Uploading to EC2..."
scp -i $KEY_FILE -o StrictHostKeyChecking=no deploy.tar.gz $EC2_USER@$(aws ec2 describe-instances --instance-ids $EC2_INSTANCE_ID --query 'Reservations[0].Instances[0].PublicIpAddress' --output text):~/app/

# Deploy on EC2
echo "🔧 Deploying on EC2..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no $EC2_USER@$(aws ec2 describe-instances --instance-ids $EC2_INSTANCE_ID --query 'Reservations[0].Instances[0].PublicIpAddress' --output text) << 'EOF'
cd ~/app
tar -xzf deploy.tar.gz
docker stop afiagate-webapp || true
docker rm afiagate-webapp || true
docker build -t afiagate-webapp .
docker run -d --name afiagate-webapp -p 80:80 --restart unless-stopped afiagate-webapp
rm deploy.tar.gz
echo "✅ Deployment completed on EC2!"
EOF

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be available at: http://$(aws ec2 describe-instances --instance-ids $EC2_INSTANCE_ID --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)"
