#!/bin/bash

# Simple backend deployment script
echo "🚀 Deploying backend fixes to server..."

# Configuration
SERVER_HOST="anoudjob.com"
SERVER_USER="root"  # Adjust if different
BACKEND_DIR="/var/www/anoudjob/backend"

echo "📁 Files to deploy:"
echo "  - backend/routes/applications.js"
echo "  - backend/middleware/adminAuth.js" 
echo "  - backend/server.js"

echo ""
echo "🔧 Manual deployment steps:"
echo "1. Upload these files to your server:"
echo "   scp backend/routes/applications.js $SERVER_USER@$SERVER_HOST:$BACKEND_DIR/routes/"
echo "   scp backend/middleware/adminAuth.js $SERVER_USER@$SERVER_HOST:$BACKEND_DIR/middleware/"
echo "   scp backend/server.js $SERVER_USER@$SERVER_HOST:$BACKEND_DIR/"

echo ""
echo "2. Restart the backend service:"
echo "   ssh $SERVER_USER@$SERVER_HOST 'pm2 restart anoud-backend'"
echo "   # OR if using systemd:"
echo "   ssh $SERVER_USER@$SERVER_HOST 'sudo systemctl restart anoud-backend'"

echo ""
echo "3. Test the deployment:"
echo "   node test-deployment-api.js"

echo ""
echo "✅ Deployment instructions ready!"
