# Simple Server Deployment Guide

This guide will help you deploy your Afiagate web app to a server and keep it running continuously.

## 🚀 Quick Start (3 Steps)

### Step 1: Get a Server
Choose one of these options:
- **AWS EC2** (Recommended) - $5-15/month
- **DigitalOcean Droplet** - $5-10/month  
- **Vultr** - $5-10/month
- **Your own server** - Any Linux machine

### Step 2: Set Up the Server
Connect to your server and run:

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/afiagate-webapp/main/ec2-setup.sh | bash

# Or if you have the script locally:
scp ec2-setup.sh user@your-server-ip:~/
ssh user@your-server-ip
chmod +x ec2-setup.sh
./ec2-setup.sh
```

### Step 3: Deploy Your App
Upload your app to the server and run:

```bash
# Upload your app files
scp -r . user@your-server-ip:~/app/

# Connect to server and deploy
ssh user@your-server-ip
cd ~/app
chmod +x simple-deploy.sh
./simple-deploy.sh
```

## 📋 Detailed Steps

### Option A: AWS EC2 (Recommended)

1. **Launch EC2 Instance**
   - Go to AWS Console → EC2 → Launch Instance
   - Choose Ubuntu 22.04 LTS
   - Select t2.micro (free tier) or t3.small
   - Configure Security Group: Allow ports 22, 80, 443
   - Download your key pair (.pem file)

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

3. **Set Up Server**
   ```bash
   # Copy setup script to server
   scp ec2-setup.sh ubuntu@your-ec2-public-ip:~/
   
   # Run setup on server
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   chmod +x ec2-setup.sh
   ./ec2-setup.sh
   ```

4. **Deploy App**
   ```bash
   # From your local machine
   ./deploy-ec2.sh
   
   # Or manually upload and deploy
   scp -r . ubuntu@your-ec2-public-ip:~/app/
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   cd ~/app
   ./simple-deploy.sh
   ```

### Option B: Any Linux Server

1. **Install Docker and Docker Compose**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   
   # CentOS/RHEL
   sudo yum install -y docker docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   ```

2. **Upload and Deploy**
   ```bash
   # Create app directory
   mkdir -p ~/app
   cd ~/app
   
   # Upload your app files (from your local machine)
   scp -r . user@your-server-ip:~/app/
   
   # Deploy on server
   ssh user@your-server-ip
   cd ~/app
   chmod +x simple-deploy.sh
   ./simple-deploy.sh
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file on your server:
```env
REACT_APP_API_URL=https://your-backend-api.com
NODE_ENV=production
```

### Custom Domain (Optional)
1. Point your domain to your server's IP
2. Add SSL certificate:
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d yourdomain.com
   ```

## 📊 Management Commands

### View Logs
```bash
# View real-time logs
docker-compose logs -f

# View recent logs
docker-compose logs --tail=50
```

### Restart App
```bash
# Restart the app
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

### Stop App
```bash
# Stop the app
docker-compose down

# Stop and remove everything
docker-compose down -v
```

### Update App
```bash
# Pull latest code and redeploy
git pull
./simple-deploy.sh
```

## 🔒 Security

### Firewall Setup
```bash
# Ubuntu (UFW)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚨 Troubleshooting

### App Not Starting
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs

# Check if port 80 is available
sudo netstat -tlnp | grep :80
```

### Permission Issues
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and log back in
```

### Port Already in Use
```bash
# Find what's using port 80
sudo lsof -i :80

# Kill the process
sudo kill -9 <PID>
```

### Memory Issues
```bash
# Check memory usage
free -h

# Clean up Docker
docker system prune -a
```

## 💰 Cost Estimation

### AWS EC2
- **t2.micro** (free tier): $0/month
- **t3.small**: ~$15/month
- **t3.medium**: ~$30/month

### Other Providers
- **DigitalOcean**: $5-10/month
- **Vultr**: $5-10/month
- **Linode**: $5-10/month

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify Docker is running: `docker --version`
3. Check server resources: `htop` or `free -h`
4. Ensure ports are open: `sudo netstat -tlnp`

Your app will be available at: `http://your-server-ip`
