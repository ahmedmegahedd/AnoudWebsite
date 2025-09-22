# 🚀 XAMPP Deployment Guide for Dell R730 Server

## 📋 **Overview**

This guide will help you deploy the Anoud Job website on a Dell R730 server using XAMPP. The setup includes:
- **Apache** for serving the React frontend
- **Node.js** for the backend API
- **MongoDB** for the database
- **PHP** (if needed for additional features)

---

## 🔧 **System Requirements**

### **Dell R730 Server Specifications:**
- **OS:** Windows Server 2019/2022 or Linux (Ubuntu/CentOS)
- **RAM:** Minimum 8GB (Recommended 16GB+)
- **Storage:** Minimum 100GB free space
- **Network:** Static IP address

### **Software Requirements:**
- **XAMPP** (Latest version)
- **Node.js** (v18.0.0 or higher)
- **MongoDB** (v6.0 or higher)
- **Git** (for deployment)

---

## 📦 **Installation Steps**

### **Step 1: Install XAMPP**
1. Download XAMPP from https://www.apachefriends.org/
2. Install with Apache, MySQL, PHP, and phpMyAdmin
3. Start Apache and MySQL services

### **Step 2: Install Node.js**
1. Download Node.js from https://nodejs.org/
2. Install with npm package manager
3. Verify installation: `node --version` and `npm --version`

### **Step 3: Install MongoDB**
1. Download MongoDB Community Server
2. Install and configure as a Windows Service
3. Create database: `Anoud`

### **Step 4: Configure Apache**
1. Edit `httpd.conf` in XAMPP installation directory
2. Enable required modules (mod_rewrite, mod_headers)
3. Configure virtual hosts

---

## 🗂️ **Directory Structure**

```
C:\xampp\
├── htdocs\
│   └── anoudjob\                 # Frontend (React build)
│       ├── index.html
│       ├── static\
│       └── ...
├── nodejs\
│   └── anoudjob-backend\         # Backend (Node.js)
│       ├── server.js
│       ├── routes\
│       ├── models\
│       └── ...
└── logs\
    └── anoudjob\
        ├── access.log
        ├── error.log
        └── node.log
```

---

## ⚙️ **Configuration Files**

### **Apache Virtual Host Configuration**
- File: `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
- Handles frontend routing and API proxy

### **Node.js Backend Configuration**
- File: `C:\xampp\nodejs\anoudjob-backend\.env`
- Database connection and environment variables

### **Frontend Build Configuration**
- File: `C:\xampp\htdocs\anoudjob\`
- React production build

---

## 🔄 **Deployment Process**

### **1. Backend Deployment**
```bash
# Navigate to backend directory
cd C:\xampp\nodejs\anoudjob-backend

# Install dependencies
npm install

# Start the server
npm start
```

### **2. Frontend Deployment**
```bash
# Build React app
cd C:\xampp\htdocs\anoudjob
npm run build

# Copy build files to XAMPP htdocs
# (Already configured in build process)
```

### **3. Database Setup**
```bash
# Connect to MongoDB
mongo

# Create database
use Anoud

# Create collections (automatic on first use)
```

---

## 🧪 **Testing & Verification**

### **Local Testing:**
- Frontend: `http://localhost/anoudjob`
- Backend API: `http://localhost:3234/api`
- Database: `mongodb://localhost:27017/Anoud`

### **Production Testing:**
- Frontend: `http://your-server-ip/anoudjob`
- Backend API: `http://your-server-ip:3234/api`
- Health Check: `http://your-server-ip:3234/api/health`

---

## 🔒 **Security Considerations**

### **Firewall Configuration:**
- Port 80 (HTTP) - Open
- Port 443 (HTTPS) - Open
- Port 3234 (Node.js) - Open
- Port 27017 (MongoDB) - Restricted to localhost

### **SSL/HTTPS Setup:**
- Configure SSL certificates
- Redirect HTTP to HTTPS
- Secure API endpoints

---

## 📊 **Monitoring & Maintenance**

### **Log Files:**
- Apache: `C:\xampp\apache\logs\`
- Node.js: `C:\xampp\nodejs\anoudjob-backend\logs\`
- MongoDB: `C:\xampp\mongodb\logs\`

### **Performance Monitoring:**
- Apache access logs
- Node.js application logs
- MongoDB query logs
- System resource usage

---

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Port conflicts** - Check if ports 80, 3234, 27017 are free
2. **Permission issues** - Run as administrator
3. **Database connection** - Verify MongoDB is running
4. **Node.js not starting** - Check environment variables

### **Error Logs:**
- Check Apache error logs
- Check Node.js console output
- Check MongoDB logs
- Check Windows Event Viewer

---

## 📈 **Performance Optimization**

### **Apache Configuration:**
- Enable compression (mod_deflate)
- Configure caching headers
- Optimize MaxRequestWorkers

### **Node.js Configuration:**
- Use PM2 for process management
- Configure clustering
- Optimize memory usage

### **Database Optimization:**
- Create proper indexes
- Configure connection pooling
- Monitor query performance

---

## 🔄 **Backup & Recovery**

### **Backup Strategy:**
- Database: MongoDB dump
- Files: Full directory backup
- Configuration: Version control

### **Recovery Process:**
- Restore database from dump
- Restore files from backup
- Restart services

---

**🎯 This setup ensures your Anoud Job website runs smoothly on the Dell R730 server with XAMPP!**
