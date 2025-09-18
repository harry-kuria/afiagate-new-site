#!/bin/bash

# One-Command Deployment for 3.230.72.136
# Copy and paste this ENTIRE script into your EC2 Instance Connect browser terminal

echo "🚀 Starting one-command deployment to 3.230.72.136..."

# Update system
echo "📦 Updating system packages..."
sudo apt update -y

# Install required packages
echo "🔧 Installing required packages..."
sudo apt install -y nginx curl wget unzip

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/afiagate
sudo chown -R www-data:www-data /var/www/afiagate

# Create a simple React app for testing (you can replace this with your actual app)
echo "📄 Creating test application..."
sudo tee /var/www/afiagate/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Afiagate Web App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .success {
            color: #4ade80;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Afiagate Web App</h1>
        <p>Your React application is successfully deployed!</p>
        <div class="status">
            <h2 class="success">✅ Deployment Status: SUCCESS</h2>
            <p>Server: 54.242.178.144</p>
            <p>Time: <span id="timestamp"></span></p>
        </div>
        <p>This is a placeholder page. Upload your React build files to replace this content.</p>
    </div>
    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
    </script>
</body>
</html>
EOF

# Configure nginx
echo "🌐 Configuring nginx..."
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
echo "🔗 Enabling nginx site..."
sudo ln -sf /etc/nginx/sites-available/afiagate /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

# Restart nginx
echo "🔄 Restarting nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Check status
echo "📊 Checking service status..."
sudo systemctl status nginx --no-pager -l

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your application is now available at:"
echo "   http://3.230.72.136"
echo ""
echo "🔍 To check if it's working:"
echo "   curl -I http://3.230.72.136"
echo ""
echo "📝 Next steps:"
echo "1. Upload your React build files to replace the placeholder"
echo "2. Set up HTTPS using the simple-https-setup.sh script"
echo "3. Configure your domain if needed"
