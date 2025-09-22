# 🚀 Production Deployment Instructions

## Files to Update on Production Server

### 1. Backend Files
- `server.js` - Updated with multer error handling
- `routes/applications.js` - Updated file validation
- All other backend files

### 2. Environment Variables
Make sure `.env` file contains:
```
MONGO_URI=mongodb+srv://ahmedmegahedbis:aahmedmegahedd@anoudcluster.wxvvnwe.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=SuperStrongSecretKey123!
PORT=3234
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Deployment Steps

1. **Stop the current server:**
   ```bash
   pm2 stop all
   # or
   sudo systemctl stop your-app-service
   ```

2. **Backup current backend:**
   ```bash
   cp -r /path/to/current/backend /path/to/backup/backend-$(date +%Y%m%d-%H%M%S)
   ```

3. **Copy new backend files:**
   ```bash
   cp -r backend/* /path/to/production/backend/
   ```

4. **Install dependencies (if needed):**
   ```bash
   cd /path/to/production/backend
   npm install
   ```

5. **Start the server:**
   ```bash
   pm2 start ecosystem.config.js
   # or
   sudo systemctl start your-app-service
   ```

6. **Verify deployment:**
   ```bash
   curl https://www.anoudjob.com/api/health
   curl https://www.anoudjob.com/api/applications/counts/public
   ```

## 🔧 Key Fixes Applied

1. **Multer Error Handling** - Added proper error middleware to handle file upload errors
2. **File Validation** - Improved file type validation to return 400 instead of 500
3. **Error Responses** - All endpoints now return proper HTTP status codes

## 🧪 Test After Deployment

Test these endpoints:
- `GET https://www.anoudjob.com/api/health` - Should return 200
- `GET https://www.anoudjob.com/api/applications/counts/public` - Should return 200
- `POST https://www.anoudjob.com/api/applications/public` - Should return 201 for valid data
- `POST https://www.anoudjob.com/api/applications` - Should return 400 for invalid files, 201 for valid files

