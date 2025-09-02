# 🌐 Domain & SSL Setup Guide for Anoud Job Website

## 🎯 **What This Fixes:**

1. **✅ HTTPS Redirect**: `anoudjob.com` → `https://www.anoudjob.com`
2. **✅ Page Refresh Errors**: React Router now works properly
3. **✅ Domain Consistency**: All traffic goes to `https://www.anoudjob.com`

## 🔧 **Step 1: DNS Configuration**

### **A Records (Required):**
```
anoudjob.com        → YOUR_SERVER_IP
www.anoudjob.com    → YOUR_SERVER_IP
```

### **CNAME Records (Optional but recommended):**
```
*.anoudjob.com      → anoudjob.com
```

## 🔒 **Step 2: SSL Certificate Setup**

### **Using Let's Encrypt (Free):**

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate for both domains
sudo certbot --nginx -d anoudjob.com -d www.anoudjob.com

# Auto-renewal (recommended)
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### **Manual SSL Certificate:**
If you have your own SSL certificate:
1. Place certificate files in `/etc/letsencrypt/live/anoudjob.com/`
2. Update paths in `nginx.conf`
3. Restart Nginx: `sudo systemctl restart nginx`

## 🚀 **Step 3: Deploy the Website**

```bash
# Run the deployment script
./deploy.sh

# Or manually:
cd backend && npm run prod
cd frontend && npm run build
sudo cp -r frontend/build /var/www/anoudjob.com/frontend/
sudo cp nginx.conf /etc/nginx/sites-available/anoudjob
sudo ln -sf /etc/nginx/sites-available/anoudjob /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## ✅ **Step 4: Test Everything**

### **Test URLs:**
- ✅ `https://www.anoudjob.com` (Main site)
- ✅ `https://anoudjob.com` (Redirects to www)
- ✅ `http://anoudjob.com` (Redirects to https www)
- ✅ `http://www.anoudjob.com` (Redirects to https www)

### **Test Page Refresh:**
1. Go to any page (e.g., `/jobs`, `/about`)
2. Refresh the page (F5 or Ctrl+R)
3. ✅ Should work without errors

## 🔍 **Troubleshooting**

### **If HTTPS doesn't work:**
```bash
# Check SSL certificate
sudo certbot certificates

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check firewall
sudo ufw status
sudo ufw allow 443
sudo ufw allow 80
```

### **If page refresh still fails:**
```bash
# Check Nginx configuration
sudo nginx -t

# Check if try_files directive is working
sudo grep -r "try_files" /etc/nginx/

# Restart Nginx
sudo systemctl restart nginx
```

### **If domain doesn't resolve:**
```bash
# Check DNS propagation
nslookup anoudjob.com
nslookup www.anoudjob.com

# Check from different locations
dig anoudjob.com
dig www.anoudjob.com
```

## 📱 **Mobile & Browser Testing**

### **Test on Different Devices:**
- ✅ Desktop Chrome/Firefox/Safari
- ✅ Mobile Chrome/Safari
- ✅ Different screen sizes

### **Test Different Scenarios:**
- ✅ Direct URL access
- ✅ Page refresh
- ✅ Browser back/forward buttons
- ✅ Deep linking (sharing URLs)

## 🎉 **Success Indicators**

When everything is working correctly:
1. **All HTTP traffic redirects to HTTPS**
2. **All non-www traffic redirects to www**
3. **Page refresh works on all routes**
4. **SSL certificate shows as valid**
5. **Website loads fast and securely**

## 📞 **Need Help?**

If you encounter issues:
1. Check the deployment logs: `pm2 logs anoudjob-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system logs: `sudo journalctl -u nginx -f`

---

**🎯 Your website will now work perfectly with:**
- ✅ `anoudjob.com` → `https://www.anoudjob.com`
- ✅ `http://anoudjob.com` → `https://www.anoudjob.com`
- ✅ Page refresh working on all routes
- ✅ Mobile-friendly and secure
