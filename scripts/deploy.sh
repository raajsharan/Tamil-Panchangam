#!/bin/bash

# Tamil Calendar Deployment Script
# Run as: sudo ./deploy.sh

set -e

echo "=========================================="
echo "  Tamil Calendar Deployment Script"
echo "=========================================="

# Variables
APP_DIR="/var/www/tamil-calendar"
WEB_USER="www-data"
WEB_GROUP="www-data"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root or with sudo"
    exit 1
fi

echo "[1/8] Updating system..."
apt update && apt upgrade -y

echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version

echo "[3/8] Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

echo "[4/8] Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo "[5/8] Installing PM2..."
npm install -g pm2

echo "[6/8] Creating application directory..."
mkdir -p $APP_DIR
cp -r . $APP_DIR
cd $APP_DIR
chown -R $WEB_USER:$WEB_GROUP $APP_DIR

echo "[7/8] Installing dependencies and building..."
sudo -u $WEB_USER npm install -g pnpm
sudo -u $WEB_USER pnpm install
sudo -u $WEB_USER pnpm build

echo "[8/8] Configuring and starting services..."
cp configs/tamil-calendar.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/tamil-calendar.conf /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Setup PM2
sudo -u $WEB_USER pm2 start ecosystem.config.js
sudo -u $WEB_USER pm2 save
sudo -u $WEB_USER pm2 startup

echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Configure .env file at $APP_DIR/apps/api/.env"
echo "2. Run: sudo -u $WEB_USER pm2 restart all"
echo "3. Obtain SSL: certbot --nginx -d your-domain.com"
echo ""
