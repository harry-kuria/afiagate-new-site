#!/bin/bash

# Simple HTTPS Setup - Execute this on the server
# Server IP: 3.230.72.136

echo "🔒 Setting up HTTPS for 3.230.72.136..."

# Stop nginx
sudo systemctl stop nginx

# Create HTTP-only config first
sudo tee /etc/nginx/sites-available/afiagate << 'EOF'
server {
    listen 80;
    server_name _;
    
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
EOF

# Start nginx
sudo nginx -t && sudo systemctl start nginx

# Get SSL certificate using nip.io domain
sudo certbot certonly --standalone -d 3.230.72.136.nip.io --non-interactive --agree-tos --email admin@example.com

# Create HTTPS config
sudo tee /etc/nginx/sites-available/afiagate << 'EOF'
server {
    listen 80;
    server_name _;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;
    
    ssl_certificate /etc/letsencrypt/live/3.230.72.136.nip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/3.230.72.136.nip.io/privkey.pem;
    
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
EOF

# Restart nginx
sudo nginx -t && sudo systemctl restart nginx

echo "✅ HTTPS setup completed!"
echo "🔒 https://3.230.72.136.nip.io"
echo "🌐 http://3.230.72.136 (redirects to HTTPS)"
