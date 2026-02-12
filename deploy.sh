#!/bin/bash

# Ianua Vini - Deployment Script for Hetzner
echo "🚀 Starting Deployment..."

# 1. Build Frontend
echo "📦 Building Frontend..."
npm run build

# 2. Prepare Server Directory
echo "📂 Preparing Server..."
ssh root@91.98.66.127 "mkdir -p /var/www/ianua-vini"

# 3. Upload Files
echo "📤 Uploading files..."
# NOTE: We skip db.json by default to avoid overwriting live data. 
# Use 'upload_db' as first argument to include it.
if [ "$1" == "upload_db" ]; then
    echo "⚠️ Including db.json in upload..."
    scp -r dist server.js ecosystem.config.cjs db.json package.json services root@91.98.66.127:/var/www/ianua-vini/
else
    scp -r dist server.js ecosystem.config.cjs package.json services root@91.98.66.127:/var/www/ianua-vini/
fi

# 4. Install dependencies and restart on server
echo "⚙️ Finalizing on server..."
ssh root@91.98.66.127 "cd /var/www/ianua-vini && npm install && pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs"

# 4b. Install Certbot (if not present) and obtain SSL certificate
echo "🔒 Configuring SSL..."
ssh root@91.98.66.127 "apt-get update && apt-get install -y certbot python3-certbot-nginx"

# 5. Nginx
echo "🌐 Updating Nginx configuration..."
scp nginx.conf root@91.98.66.127:/etc/nginx/sites-available/ianua-vini
ssh root@91.98.66.127 "ln -sf /etc/nginx/sites-available/ianua-vini /etc/nginx/sites-enabled/ianua-vini && 
certbot --nginx -d ianuavini.duckdns.org --non-interactive --agree-tos -m admin@ianuavini.duckdns.org --redirect && 
systemctl reload nginx"

echo "✅ Done! App available at https://ianuavini.duckdns.org"
