# Ianua Vini - Deployment Script for Windows (PowerShell)
param (
    [string]$Mode = "code_only"
)

Write-Host "--- Starting Deployment ---" -ForegroundColor Cyan

# 1. Build Frontend
Write-Host "1. Building Frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}

$ServerIP = "91.98.66.127"
$RemotePath = "/var/www/ianua-vini"

# 2. Prepare Server Directory
Write-Host "2. Preparing Server..." -ForegroundColor Yellow
ssh root@$ServerIP "mkdir -p $RemotePath"

# 3. Upload Files
Write-Host "3. Uploading files..." -ForegroundColor Yellow
if ($Mode -eq "upload_db") {
    Write-Host "!! Including db.json in upload !!" -ForegroundColor Red
    scp -r dist server.js ecosystem.config.cjs db.json package.json services "root@$ServerIP`:$RemotePath/"
}
else {
    Write-Host "Protecting live data (skipping db.json)" -ForegroundColor Green
    scp -r dist server.js ecosystem.config.cjs package.json services "root@$ServerIP`:$RemotePath/"
}

# 4. Finalize on server
Write-Host "4. Finalizing on server..." -ForegroundColor Yellow
$remoteCmd = "cd $RemotePath && npm install && pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs"
ssh root@$ServerIP $remoteCmd

# 5. Reload Nginx
Write-Host "5. Reloading Nginx..." -ForegroundColor Yellow
scp nginx.conf "root@$ServerIP`:/etc/nginx/sites-available/ianua-vini"
$nginxCmd = "ln -sf /etc/nginx/sites-available/ianua-vini /etc/nginx/sites-enabled/ianua-vini && systemctl reload nginx"
ssh root@$ServerIP $nginxCmd

Write-Host "SUCCESS: App available at https://ianuavini.duckdns.org" -ForegroundColor Green
