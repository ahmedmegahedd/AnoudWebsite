#!/usr/bin/env node

/**
 * API Endpoint Test Script
 * Tests the job creation API endpoint
 */

const http = require('http');

console.log('🧪 Testing Job Creation API Endpoint...\n');

// Test data
const testJobData = {
  title_en: 'API Test Job',
  title_ar: 'وظيفة اختبار API',
  company: '68bc97508cb21bcd89ee042e', // Use the company ID from our sample data
  location_en: 'Cairo, Egypt',
  location_ar: 'القاهرة، مصر',
  type: 'Full-Time',
  salary_en: '12,000 - 18,000 EGP',
  salary_ar: '12,000 - 18,000 جنيه',
  experience_en: '3+ years',
  experience_ar: '3+ سنوات',
  description_en: 'This is a test job created via API to verify the endpoint is working.',
  description_ar: 'هذه وظيفة اختبار تم إنشاؤها عبر API للتحقق من عمل النقطة النهائية.'
};

// Test without authentication (should fail)
console.log('🔒 Testing without authentication (should fail):');
testEndpoint(false);

// Test with authentication (should work if server is running)
setTimeout(() => {
  console.log('\n🔑 Testing with authentication (should work if server is running):');
  testEndpoint(true);
}, 2000);

function testEndpoint(withAuth) {
  const postData = JSON.stringify(testJobData);
  
  const options = {
    hostname: 'localhost',
    port: 3234,
    path: '/api/jobs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  if (withAuth) {
    // Note: In real usage, you'd need a valid JWT token
    options.headers['Authorization'] = 'Bearer fake-token-for-testing';
  }
  
  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`📄 Response:`, response);
        
        if (res.statusCode === 201) {
          console.log('✅ SUCCESS: Job creation endpoint is working!');
        } else if (res.statusCode === 401) {
          console.log('🔒 EXPECTED: Authentication required (this is correct)');
        } else if (res.statusCode === 500) {
          console.log('⚠️  SERVER ERROR: Backend might not be running or database connection issue');
        } else {
          console.log(`⚠️  UNEXPECTED: Status ${res.statusCode}`);
        }
      } catch (error) {
        console.log(`📄 Raw Response: ${data}`);
        console.log('⚠️  Could not parse JSON response');
      }
    });
  });
  
  req.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ CONNECTION REFUSED: Backend server is not running');
      console.log('💡 Start your backend server with: cd backend && npm start');
    } else {
      console.log(`❌ REQUEST ERROR: ${error.message}`);
    }
  });
  
  req.write(postData);
  req.end();
}

console.log('\n📝 Test Summary:');
console.log('================');
console.log('• First test: Without auth (should return 401)');
console.log('• Second test: With auth (should return 201 if server running)');
console.log('• If you see "CONNECTION REFUSED", start your backend server');
console.log('• If you see "SERVER ERROR", check your database connection');
console.log('\n🚀 To start your backend server:');
console.log('   cd backend && npm start');
