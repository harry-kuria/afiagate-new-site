#!/bin/bash

# Quick Status Check Script
# Copy and paste this into EC2 Instance Connect terminal

echo "🔍 Checking your React app status..."

echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "🌐 Network Status:"
curl -s http://localhost:3000 | head -5

echo ""
echo "🔒 SSL Certificate Status:"
if [ -f "/etc/letsencrypt/live/54.242.178.144.nip.io/fullchain.pem" ]; then
    echo "✅ SSL certificate exists"
    sudo certbot certificates
else
    echo "❌ SSL certificate not found"
fi

echo ""
echo "🌐 Your app URLs:"
echo "   HTTP: http://54.242.178.144"
echo "   HTTPS: https://54.242.178.144.nip.io"
