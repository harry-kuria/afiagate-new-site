#!/bin/bash

# AWS S3 + CloudFront Deployment Script for Afiagate Web App
# Make sure you have AWS CLI installed and configured

# Configuration
BUCKET_NAME="your-afiagate-webapp-bucket"
REGION="us-east-1"
DISTRIBUTION_ID="your-cloudfront-distribution-id"

echo "🚀 Starting deployment to AWS S3..."

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Sync build files to S3
echo "📤 Uploading files to S3..."
aws s3 sync build/ s3://$BUCKET_NAME --delete

if [ $? -ne 0 ]; then
    echo "❌ S3 upload failed!"
    exit 1
fi

# Invalidate CloudFront cache
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be available at: https://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
