# 🚀 Anoud Job Website - Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Domain name configured (anoudjob.com)
- SSL certificate for HTTPS
- Server/hosting environment

## 🏗️ Project Structure

```
AnoudWebsite/
├── backend/          # Node.js/Express API server
├── frontend/         # React frontend application
├── uploads/          # File uploads directory
└── .env              # Environment variables (create this)
```

## 🔧 Backend Deployment

### 1. Environment Variables (.env)
Create `.env` file in the backend directory:

```bash
# Database
MONGO_URI=mongodb://localhost:27017/anoudjob
# or for cloud: mongodb+srv://username:password@cluster.mongodb.net/anoudjob

# Server
PORT=3000
NODE_ENV=production

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CORS Origins
ALLOWED_ORIGINS=https://www.anoudjob.com,https://anoudjob.com
```

### 2. Install Dependencies
```bash
cd backend
npm install --production
```

### 3. Build and Start
```bash
# For production
npm start

# Or manually
node server.js
```

### 4. Production Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "anoudjob-backend"

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

## 🌐 Frontend Deployment

### 1. Build Production Version
```bash
cd frontend
npm install
npm run build
```

### 2. Deploy Build Folder
The `build/` folder contains your production-ready static files.

### 3. Nginx Configuration
Create `/etc/nginx/sites-available/anoudjob.com`:

```nginx
server {
    listen 80;
    server_name anoudjob.com www.anoudjob.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name anoudjob.com www.anoudjob.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Frontend
    location / {
        root /var/www/anoudjob/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # File uploads
    location /uploads/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/anoudjob.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📁 File Uploads Setup

### 1. Create Uploads Directory
```bash
sudo mkdir -p /var/www/anoudjob/uploads
sudo chown -R $USER:$USER /var/www/anoudjob/uploads
sudo chmod 755 /var/www/anoudjob/uploads
```

### 2. Update Backend Path
Ensure your backend points to the correct uploads directory.

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique secrets
- Rotate secrets regularly

### 2. Database Security
- Use strong passwords
- Enable authentication
- Restrict network access

### 3. SSL/TLS
- Use strong ciphers
- Enable HSTS
- Regular certificate renewal

### 4. CORS Configuration
- Only allow necessary origins
- Validate all inputs
- Rate limiting

## 🚀 Deployment Commands

### Quick Deploy Script
```bash
#!/bin/bash
echo "🚀 Deploying Anoud Job Website..."

# Backend
echo "📦 Building backend..."
cd backend
npm install --production
pm2 restart anoudjob-backend

# Frontend
echo "🌐 Building frontend..."
cd ../frontend
npm install
npm run build

# Copy to web directory
sudo cp -r build/* /var/www/anoudjob/frontend/

echo "✅ Deployment complete!"
```

### Health Check
```bash
# Check backend
curl http://localhost:3000/

# Check frontend
curl -I https://anoudjob.com

# Check PM2 status
pm2 status
```

## 📊 Monitoring

### 1. PM2 Monitoring
```bash
pm2 monit
pm2 logs anoudjob-backend
```

### 2. Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Application Logs
Check your application logs for errors and performance issues.

## 🔄 Updates and Maintenance

### 1. Code Updates
```bash
git pull origin main
npm install
npm run build
pm2 restart anoudjob-backend
```

### 2. Database Backups
```bash
# MongoDB backup
mongodump --db anoudjob --out /backup/$(date +%Y%m%d)

# Restore if needed
mongorestore --db anoudjob /backup/20241201/anoudjob/
```

### 3. SSL Certificate Renewal
```bash
# If using Let's Encrypt
sudo certbot renew
sudo systemctl reload nginx
```

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check CORS configuration in backend
2. **Database Connection**: Verify MONGO_URI and network access
3. **File Uploads**: Check directory permissions and paths
4. **Build Errors**: Ensure all dependencies are installed

### Debug Mode:
```bash
# Backend debug
NODE_ENV=development node server.js

# Frontend debug
npm start
```

## 📞 Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test endpoints individually
4. Check server resources

---

**Happy Deploying! 🎉**
