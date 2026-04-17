# Ubuntu Deployment Guide

## Tamil Calendar & Panchangam Web Application

Complete deployment guide for Ubuntu 20.04+ server with Node.js, PM2, and Nginx.

---

## Table of Contents

1. [Server Requirements](#server-requirements)
2. [Install Dependencies](#install-dependencies)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [SSL Setup](#ssl-setup)
7. [PM2 Setup](#pm2-setup)
8. [Automation](#automation)
9. [Troubleshooting](#troubleshooting)

---

## Server Requirements

- Ubuntu 20.04 or above (LTS recommended)
- Minimum 1GB RAM (2GB recommended)
- 20GB+ disk space
- Root or sudo access

---

## 1. Install Dependencies

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 20.x

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### Install MongoDB

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### Install Nginx

```bash
sudo apt install -y nginx
```

### Install PM2

```bash
sudo npm install -g pm2
```

---

## 2. Database Setup

### Create MongoDB Database and User

```bash
# Connect to MongoDB
mongosh

# In MongoDB shell
use admin

# Create admin user
db.createUser({
  user: "tamilcalendar",
  pwd: "your_secure_password",
  roles: [
    { role: "readWrite", db: "tamil_calendar" },
    { role: "dbAdmin", db: "tamil_calendar" }
  ]
})

# Create the database
use tamil_calendar

# Exit MongoDB shell
exit
```

### Create Environment File

```bash
# On the server, create the environment file
sudo nano /var/www/tamil-calendar/api/.env
```

Add the following content:

```
# Database
MONGODB_URI="mongodb://tamilcalendar:your_secure_password@localhost:27017/tamil_calendar"

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS="https://your-domain.com,http://your-domain.com"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-bot-token-from-botfather"

# Scraper
SCRAPER_DELAY_MS=3000
SCRAPER_MAX_RETRIES=3
SCRAPER_TIMEOUT_MS=30000

# Logging
LOG_LEVEL=info
LOG_DIR=logs
```

---

## 3. Application Deployment

### Create Application Directory

```bash
# Create directory structure
sudo mkdir -p /var/www/tamil-calendar
sudo chown -R $USER:$USER /var/www/tamil-calendar
cd /var/www/tamil-calendar
```

### Clone or Copy Application

```bash
# If using git
git clone https://github.com/your-repo/tamil-calendar.git /var/www/tamil-calendar

# Or copy files via SCP, Rsync, etc.
```

### Install Dependencies

```bash
cd /var/www/tamil-calendar

# Install pnpm globally if not installed
npm install -g pnpm

# Install all dependencies
pnpm install

# Build the applications
pnpm build
```

### Create Log Directory

```bash
mkdir -p /var/www/tamil-calendar/apps/api/logs
```

### Set Permissions

```bash
sudo chmod -R 755 /var/www/tamil-calendar
```

---

## 4. Nginx Configuration

### Create Nginx Server Block

```bash
sudo nano /etc/nginx/sites-available/tamil-calendar
```

### Basic Configuration (HTTP)

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files for frontend build
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable the Site

```bash
# Test configuration
sudo nginx -t

# Enable site
sudo ln -s /etc/nginx/sites-available/tamil-calendar /etc/nginx/sites-enabled/

# Reload Nginx
sudo systemctl reload nginx
```

---

## 5. SSL Setup (Let's Encrypt)

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Auto-renewal Test

```bash
# Test auto-renewal
sudo certbot renew --dry-run
```

### SSL Configuration (HTTPS)

After Certbot, your Nginx config will be updated with SSL. Here's the final config:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 6. PM2 Setup

### Create Ecosystem File

```bash
cd /var/www/tamil-calendar
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'tamil-calendar-api',
      script: 'apps/api/dist/index.js',
      cwd: '/var/www/tamil-calendar',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: 'apps/api/logs/error.log',
      out_file: 'apps/api/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false
    },
    {
      name: 'tamil-calendar-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/tamil-calendar/apps/web',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://your-domain.com'
      },
      error_file: 'apps/web/logs/error.log',
      out_file: 'apps/web/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false
    }
  ]
};
```

### Create Log Directories

```bash
mkdir -p /var/www/tamil-calendar/apps/api/logs /var/www/tamil-calendar/apps/web/logs
```

### Start Applications with PM2

```bash
cd /var/www/tamil-calendar

# Start with ecosystem file
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
```

### PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs tamil-calendar-api
pm2 logs tamil-calendar-web

# Restart applications
pm2 restart tamil-calendar-api
pm2 restart tamil-calendar-web

# Restart all
pm2 restart all

# Stop applications
pm2 stop tamil-calendar-api
pm2 stop tamil-calendar-web

# Monitor in real-time
pm2 monit
```

---

## 7. Automation

### Setup Cron for Scheduled Tasks

The cron jobs are already configured in the application code to run at:
- 4:30 AM IST - Scraping job
- 5:00 AM IST - Telegram daily post

### Setup Systemd Service for PM2 (Optional)

```bash
sudo nano /etc/systemd/system/tamil-calendar.service
```

```ini
[Unit]
Description=Tamil Calendar & Panchangam Application
After=network.target mongodb.service

[Service]
Type=forking
User=www-data
WorkingDirectory=/var/www/tamil-calendar
Restart=on-failure
RestartSec=10
ExecStart=/usr/local/bin/pm2 start ecosystem.config.js
ExecStop=/usr/local/bin/pm2 stop all
ExecReload=/usr/local/bin/pm2 reload all
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable tamil-calendar
sudo systemctl start tamil-calendar
```

---

## 8. Firewall Setup

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## 9. Troubleshooting

### Check Application Logs

```bash
# PM2 logs
pm2 logs tamil-calendar-api --lines 100
pm2 logs tamil-calendar-web --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Common Issues

#### MongoDB Connection Issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test MongoDB connection
mongosh --eval "db.adminCommand('ping')"
```

#### Port Already in Use

```bash
# Check what's using port 5000 or 3000
sudo lsof -i :5000
sudo lsof -i :3000

# Kill the process if needed
sudo kill -9 <PID>
```

#### Nginx 502 Bad Gateway

This usually means the backend is not running:

```bash
# Check if applications are running
pm2 status

# Restart if needed
pm2 restart all

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually if needed
sudo certbot renew
```

#### Puppeteer/Scraper Issues

If scraping fails due to Chrome/Puppeteer issues:

```bash
# Install Chrome dependencies
sudo apt install -y chromium-browser
sudo apt install -y chromium-codecs-ffmpeg
```

### Useful Commands

```bash
# Full restart
sudo systemctl restart mongod
pm2 restart all
sudo systemctl reload nginx

# Check all services status
sudo systemctl status mongod nginx
pm2 status

# View system resources
htop
df -h
free -h
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Update JWT_SECRET in production
- [ ] Set strong MongoDB password
- [ ] Configure Telegram bot token
- [ ] Enable UFW firewall
- [ ] Setup SSL certificate
- [ ] Review Nginx security settings
- [ ] Setup log rotation
- [ ] Enable automatic security updates

### Log Rotation Setup

```bash
sudo nano /etc/logrotate.d/tamil-calendar
```

```
/var/www/tamil-calendar/apps/*/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

---

## Backup

### MongoDB Backup

```bash
# Create backup directory
mkdir -p /var/www/tamil-calendar/backups

# Backup database
mongodump --db tamil_calendar --out /var/www/tamil-calendar/backups/$(date +%Y%m%d_%H%M%S)

# Restore backup
mongorestore --db tamil_calendar --drop /path/to/backup
```

### Automated Backup Script

```bash
#!/bin/bash
# /var/www/tamil-calendar/scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/tamil-calendar/backups"

# Create backup
mongodump --db tamil_calendar --out "$BACKUP_DIR/$DATE"

# Remove backups older than 7 days
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $DATE"
```

```bash
# Make executable and setup cron
chmod +x /var/www/tamil-calendar/scripts/backup.sh
# Add to crontab: 0 2 * * * /var/www/tamil-calendar/scripts/backup.sh
```

---

## Support

For issues or questions, please create an issue on the repository or contact the development team.
