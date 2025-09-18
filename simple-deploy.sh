#!/bin/bash

# Simple Server Deployment Script
# Run this on your server to deploy and keep the app running

echo "🚀 Deploying Afiagate Web App to server..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start new containers
echo "🔧 Building and starting containers..."
docker-compose up -d --build

# Check if containers are running
echo "🔍 Checking container status..."
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at: http://$(hostname -I | awk '{print $1}')"
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"

