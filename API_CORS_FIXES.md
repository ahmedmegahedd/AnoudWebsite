# 🚀 API and CORS Configuration Fixes

This document outlines the critical fixes applied to resolve API and CORS issues when deploying the Anoud Job website.

## 🔧 Issues Fixed

### 1. Port Configuration Mismatch
**Problem**: Backend was configured to run on port 3000, but nginx was proxying to port 3234.

**Files Fixed**:
- `backend/server.js` - Changed default port from 3000 to 3234
- `backend/ecosystem.config.js` - Updated PM2 configuration to use port 3234
- `backend/env.example` - Updated example environment file
- `deploy.sh` - Updated deployment script port configuration

### 2. CORS Configuration Issues
**Problem**: CORS was not properly configured for production domains and development environments.

**Files Fixed**:
- `backend/server.js` - Enhanced CORS configuration with:
  - Better origin validation
  - Support for both HTTP and HTTPS in production
  - Additional allowed headers
  - Better error logging

### 3. Frontend API Configuration
**Problem**: Frontend was using incorrect API endpoints and sending wrong data format.

**Files Fixed**:
- `frontend/src/pages/Jobs.tsx` - Fixed application submission:
  - Changed from `/public` endpoint to main `/` endpoint
  - Fixed to send FormData instead of JSON for file uploads
  - Removed incorrect Content-Type header for FormData
- `frontend/src/config/api.ts` - Updated to use correct port 3234

### 4. Route Configuration
**Problem**: Duplicate route definitions and missing error handling.

**Files Fixed**:
- `backend/server.js` - Added:
  - Request logging middleware
  - Root endpoint for API testing
  - Better error handling
  - Proper route organization

## 🧪 Testing

### Test Script
A comprehensive test script has been created: `test-api.js`

**Usage**:
```bash
# Test development environment
node test-api.js development

# Test production environment  
node test-api.js production
```

**What it tests**:
- Health check endpoint
- Root API endpoint
- Jobs API endpoint
- Application counts endpoint
- CORS configuration

### Manual Testing

1. **Backend Health Check**:
   ```bash
   curl http://localhost:3234/health
   ```

2. **API Root**:
   ```bash
   curl http://localhost:3234/
   ```

3. **CORS Test**:
   ```bash
   curl -H "Origin: https://www.anoudjob.com" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:3234/health
   ```

## 🚀 Deployment Steps

### 1. Update Environment Variables
Make sure your `.env` file has:
```env
NODE_ENV=production
PORT=3234
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 2. Restart Backend
```bash
cd backend
pm2 restart anoudjob-backend
# or
pm2 start server.js --name anoudjob-backend
```

### 3. Rebuild Frontend
```bash
cd frontend
npm run build
```

### 4. Test API
```bash
node test-api.js production
```

### 5. Check Nginx Configuration
Ensure nginx is proxying to the correct port:
```nginx
location /api/ {
    proxy_pass http://localhost:3234;
    # ... other proxy settings
}
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check browser console for blocked origins
   - Verify nginx is forwarding requests correctly
   - Ensure backend is running on port 3234

2. **Application Submission Fails**:
   - Check if FormData is being sent correctly
   - Verify file upload limits in backend
   - Check backend logs for validation errors

3. **API Not Responding**:
   - Verify backend is running: `pm2 status`
   - Check port configuration: `netstat -tlnp | grep 3234`
   - Test direct API access: `curl http://localhost:3234/health`

### Logs to Check

1. **Backend Logs**:
   ```bash
   pm2 logs anoudjob-backend
   ```

2. **Nginx Logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

3. **Browser Console**:
   - Check for CORS errors
   - Check network tab for failed requests

## 📋 Verification Checklist

- [ ] Backend running on port 3234
- [ ] Nginx proxying `/api/` to `localhost:3234`
- [ ] CORS allowing production domains
- [ ] Frontend using correct API URLs
- [ ] File uploads working
- [ ] Application submission working
- [ ] Health check responding
- [ ] All API endpoints accessible

## 🔄 Rollback Plan

If issues persist, you can rollback by:

1. Reverting port to 3000 in all configuration files
2. Updating nginx to proxy to port 3000
3. Restarting services

## 📞 Support

If you continue to experience issues:

1. Run the test script and share results
2. Check backend logs for errors
3. Verify nginx configuration
4. Test API endpoints individually

The fixes ensure that:
- ✅ API and frontend communicate correctly
- ✅ CORS is properly configured
- ✅ File uploads work in production
- ✅ Application submissions are processed
- ✅ All environments (dev/prod) work consistently
