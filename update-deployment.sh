#!/bin/bash

# Deployment Update Script for Anoud Job Website
# This script updates the deployment package with the latest code

echo "🚀 Updating deployment package with latest code..."

# Update deployment package
echo "📦 Copying latest backend code to deployment package..."
cp -r backend/* deployment-package/backend/

# Verify the public route exists
echo "✅ Verifying /api/applications/public route exists..."
if grep -q "router.post('/public'" deployment-package/backend/routes/applications.js; then
    echo "✅ Public route found in deployment package"
else
    echo "❌ Public route NOT found in deployment package"
    exit 1
fi

# Test the deployment package locally
echo "🧪 Testing deployment package locally..."
cd deployment-package/backend
npm install --production

# Start the server in background for testing
echo "🔧 Starting test server..."
node server.js &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test the public route
echo "📋 Testing /api/applications/public route..."
RESPONSE=$(curl -s -X POST http://localhost:3234/api/applications/public \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"1234567890","education":"Bachelor","selfIntro":"This is a test application with more than 30 characters","jobId":"68cfd8e2198252618bbdad76"}')

if echo "$RESPONSE" | grep -q "Application submitted successfully"; then
    echo "✅ Public route test PASSED"
else
    echo "❌ Public route test FAILED"
    echo "Response: $RESPONSE"
fi

# Stop the test server
kill $SERVER_PID
cd ../..

echo "🎉 Deployment package updated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Upload the deployment-package/backend/ folder to your production server"
echo "2. Restart your production server"
echo "3. Run 'node test-deployment-apis.js' to verify the fix"
echo ""
echo "🔍 The issue was that the production server was running an older version"
echo "   of the code that didn't include the /api/applications/public route."

