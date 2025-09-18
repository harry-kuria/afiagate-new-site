# Configure AWS Provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Use a specific Ubuntu AMI ID for us-east-1
locals {
  ubuntu_ami_id = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS in us-east-1
}

# VPC and Security Group
resource "aws_security_group" "afiagate_sg" {
  name        = "afiagate-webapp-sg"
  description = "Security group for Afiagate web app"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "afiagate-webapp-sg"
  }
}

# EC2 Instance
resource "aws_instance" "afiagate_server" {
  ami                    = local.ubuntu_ami_id
  instance_type          = "t3.micro"
  key_name               = "afiagate-key"
  vpc_security_group_ids = [aws_security_group.afiagate_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              # Update system
              apt update -y
              
              # Install Node.js and npm
              curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
              apt install -y nodejs
              
              # Install PM2 globally
              npm install -g pm2
              
              # Install nginx for reverse proxy
              apt install -y nginx
              
              # Create app directory
              mkdir -p /home/ubuntu/afiagate-app
              cd /home/ubuntu/afiagate-app
              
              # Install certbot for HTTPS
              apt install -y certbot python3-certbot-nginx
              
              # Configure nginx as reverse proxy
              cat > /etc/nginx/sites-available/afiagate << 'NGINX'
              server {
                  listen 80;
                  server_name _;
                  
                  location / {
                      proxy_pass http://localhost:3000;
                      proxy_http_version 1.1;
                      proxy_set_header Upgrade \$http_upgrade;
                      proxy_set_header Connection 'upgrade';
                      proxy_set_header Host \$host;
                      proxy_set_header X-Real-IP \$remote_addr;
                      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                      proxy_set_header X-Forwarded-Proto \$scheme;
                      proxy_cache_bypass \$http_upgrade;
                  }
              }
              NGINX
              
              # Enable the site
              ln -sf /etc/nginx/sites-available/afiagate /etc/nginx/sites-enabled/
              rm -f /etc/nginx/sites-enabled/default
              
              # Start nginx
              systemctl enable nginx
              systemctl start nginx
              
              # Configure firewall
              ufw allow 22
              ufw allow 80
              ufw allow 443
              ufw --force enable
              
              # Create a simple startup script
              cat > /home/ubuntu/start-app.sh << 'SCRIPT'
              #!/bin/bash
              cd /home/ubuntu/afiagate-app
              if [ -f "package.json" ]; then
                  npm install
                  pm2 start npm --name "afiagate-app" -- start
                  pm2 startup
                  pm2 save
              else
                  echo "Waiting for app files to be uploaded..."
                  # Create a simple placeholder
                  cat > index.html << 'HTML'
                  <!DOCTYPE html>
                  <html>
                  <head>
                      <title>Afiagate Web App</title>
                      <style>
                          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                          .container { max-width: 600px; margin: 0 auto; }
                          .status { color: green; font-weight: bold; }
                      </style>
                  </head>
                  <body>
                      <div class="container">
                          <h1>🚀 Afiagate Web App</h1>
                          <p class="status">✅ Server is running successfully!</p>
                          <p>Ready for React app deployment!</p>
                          <p>Upload your React app files to see your application.</p>
                      </div>
                  </body>
                  </html>
                  HTML
                  # Serve with a simple HTTP server
                  npm install -g serve
                  pm2 start serve --name "afiagate-placeholder" -- -s . -p 3000
                  pm2 startup
                  pm2 save
              fi
              SCRIPT
              
              chmod +x /home/ubuntu/start-app.sh
              /home/ubuntu/start-app.sh
              EOF

  tags = {
    Name = "afiagate-webapp-server"
  }

  # Wait for instance to be ready
  depends_on = [aws_security_group.afiagate_sg]
}

# Output the public IP
output "public_ip" {
  value = aws_instance.afiagate_server.public_ip
}

output "instance_id" {
  value = aws_instance.afiagate_server.id
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/afiagate-key.pem ubuntu@${aws_instance.afiagate_server.public_ip}"
}

output "app_url" {
  value = "http://${aws_instance.afiagate_server.public_ip}"
}
