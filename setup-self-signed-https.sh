#!/bin/bash

# Self-Signed HTTPS Setup for Static Files
# Server IP: 3.230.72.136

echo "🔒 Setting up self-signed HTTPS for 3.230.72.136..."

# Create SSL directory
sudo mkdir -p /etc/ssl/private

# Generate self-signed certificate
echo "🔐 Generating self-signed SSL certificate..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/afiagate-selfsigned.key \
    -out /etc/ssl/certs/afiagate-selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=3.230.72.136"

# Create nginx configuration with self-signed certificate
sudo tee /etc/nginx/sites-available/afiagate << 'EOF'
server {
    listen 80;
    server_name _;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;
    
    ssl_certificate /etc/ssl/certs/afiagate-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/afiagate-selfsigned.key;
    
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

# Enable the site
sudo ln -sf /etc/nginx/sites-available/afiagate /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Self-signed HTTPS setup completed!"
echo "🔒 https://3.230.72.136 (self-signed certificate)"
echo "🌐 http://3.230.72.136 (redirects to HTTPS)"
echo ""
echo "⚠️  Note: Browsers will show a security warning for self-signed certificates"
echo "   You can click 'Advanced' and 'Proceed to 3.230.72.136 (unsafe)' to access your site"
echo "   For production use, consider getting a proper SSL certificate from Let's Encrypt"
