# Complete AWS EC2 Setup Guide

This guide will walk you through setting up an EC2 instance from scratch and deploying your Afiagate web app.

## 🚀 Step-by-Step Process

### Step 1: Create an EC2 Instance

1. **Login to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Sign in with your AWS account

2. **Navigate to EC2**
   - Click on "Services" → "EC2" (or search for "EC2")
   - Click "Launch Instance"

3. **Configure Instance**
   - **Name**: `afiagate-webapp`
   - **AMI**: Choose "Ubuntu Server 22.04 LTS" (free tier eligible)
   - **Instance Type**: Select "t2.micro" (free tier eligible)
   - **Key Pair**: Click "Create new key pair"
     - Name: `afiagate-key`
     - Key pair type: RSA
     - Private key file format: .pem
     - Click "Create key pair" (this will download a .pem file)

4. **Network Settings**
   - Click "Edit" in Network Settings
   - **Security Group**: Create new security group
   - **Security Group Name**: `afiagate-sg`
   - **Description**: `Security group for Afiagate web app`
   - **Inbound Rules**:
     - SSH (Port 22): Anywhere-IPv4
     - HTTP (Port 80): Anywhere-IPv4
     - HTTPS (Port 443): Anywhere-IPv4
   - Click "Save"

5. **Storage**
   - Keep default 8 GB (free tier eligible)

6. **Launch Instance**
   - Click "Launch Instance"
   - Wait for instance to be "Running" (green checkmark)

### Step 2: Get Your Instance Details

1. **Find Your Instance**
   - In EC2 Dashboard, click "Instances (running)"
   - Find your instance named "afiagate-webapp"
   - Note down the **Public IPv4 address** (e.g., 3.250.123.45)

2. **Download Key File**
   - Make sure you have the `afiagate-key.pem` file downloaded
   - Move it to a safe location (e.g., `~/.ssh/`)

### Step 3: Connect to Your Instance

1. **Set Key Permissions** (Linux/Mac)
   ```bash
   chmod 400 ~/.ssh/afiagate-key.pem
   ```

2. **Connect via SSH**
   ```bash
   ssh -i ~/.ssh/afiagate-key.pem ubuntu@YOUR_PUBLIC_IP
   ```
   Replace `YOUR_PUBLIC_IP` with your actual IP address.

3. **Verify Connection**
   You should see a welcome message and be logged into your Ubuntu server.

### Step 4: Set Up the Server

1. **Update the Server**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Docker**
   ```bash
   # Install required packages
   sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

   # Add Docker's official GPG key
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

   # Add Docker repository
   echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

   # Install Docker
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io

   # Add your user to docker group
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Log Out and Log Back In**
   ```bash
   exit
   ```
   Then reconnect:
   ```bash
   ssh -i ~/.ssh/afiagate-key.pem ubuntu@YOUR_PUBLIC_IP
   ```

5. **Verify Docker Installation**
   ```bash
   docker --version
   docker-compose --version
   ```

### Step 5: Deploy Your App

1. **Create App Directory**
   ```bash
   mkdir -p ~/app
   cd ~/app
   ```

2. **Upload Your App Files**
   From your local machine (open a new terminal):
   ```bash
   # Navigate to your project directory
   cd /path/to/your/afiagate-webapp

   # Upload files to server
   scp -i ~/.ssh/afiagate-key.pem -r . ubuntu@YOUR_PUBLIC_IP:~/app/
   ```

3. **Deploy on Server**
   Back on your server:
   ```bash
   cd ~/app
   chmod +x simple-deploy.sh
   ./simple-deploy.sh
   ```

### Step 6: Access Your App

Your app should now be running at:
```
http://YOUR_PUBLIC_IP
```

## 🔧 Management Commands

### View App Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f
```

### Restart App
```bash
docker-compose restart
```

### Update App
```bash
# Stop current app
docker-compose down

# Upload new files (from local machine)
scp -i ~/.ssh/afiagate-key.pem -r . ubuntu@YOUR_PUBLIC_IP:~/app/

# Deploy new version (on server)
cd ~/app
./simple-deploy.sh
```

## 🔒 Security Setup

### Set Up Firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Add SSL Certificate (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com
```

## 💰 Cost Monitoring

### Check Free Tier Usage
- Go to AWS Console → Billing → Billing Dashboard
- Monitor your usage to stay within free tier limits
- Free tier includes 750 hours/month of t2.micro

### Estimated Monthly Cost
- **t2.micro**: $0/month (free tier)
- **t3.small**: ~$15/month
- **Data transfer**: ~$0.09/GB (first 1GB free)

## 🚨 Troubleshooting

### Can't Connect via SSH
1. Check security group allows port 22
2. Verify key file permissions: `chmod 400 afiagate-key.pem`
3. Check instance is running

### App Not Loading
1. Check if app is running: `docker-compose ps`
2. View logs: `docker-compose logs`
3. Check security group allows ports 80/443

### Permission Denied
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and log back in
```

## 📞 Next Steps

1. **Test your app** at `http://YOUR_PUBLIC_IP`
2. **Set up monitoring** with CloudWatch
3. **Add a domain name** (optional)
4. **Set up backups** (optional)

Your Afiagate web app is now running on AWS EC2! 🎉

