#!/bin/bash

# HTTPS Setup for Static Files - Execute this on the server
# Server IP: 3.230.72.136

echo "🔒 Setting up HTTPS for static files on 3.230.72.136..."

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily
sudo systemctl stop nginx

# Create HTTP-only config first
sudo tee /etc/nginx/sites-available/afiagate << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /var/www/afiagate;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/afiagate /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Start nginx
sudo nginx -t && sudo systemctl start nginx

# Get SSL certificate using nip.io domain
echo "🔐 Getting SSL certificate for 3.230.72.136.nip.io..."
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
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    root /var/www/afiagate;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF

# Test and restart nginx
sudo nginx -t && sudo systemctl restart nginx

echo "✅ HTTPS setup completed!"
echo "🔒 https://3.230.72.136.nip.io"
echo "🌐 http://3.230.72.136 (redirects to HTTPS)"
echo ""
echo "📝 Note: The nip.io domain allows you to use HTTPS with an IP address"
echo "   It automatically resolves 3.230.72.136.nip.io to 3.230.72.136"
