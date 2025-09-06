#!/usr/bin/env node

/**
 * Test Applicant Status Update APIs
 * Tests all APIs related to updating applicant status, flagging, and notes
 */

const http = require('http');

console.log('🧪 Testing Applicant Status Update APIs...\n');

// Test data
const testApplicationId = '68bc97508cb21bcd89ee0434'; // Use a real application ID from your database
const testJobId = '68bc97508cb21bcd89ee0434'; // Use a real job ID

// Test endpoints
const endpoints = [
  {
    name: 'Update Status',
    path: `/api/applications/${testApplicationId}/status`,
    method: 'PATCH',
    data: { status: 'Shortlisted' },
    description: 'Update applicant status'
  },
  {
    name: 'Toggle Flag',
    path: `/api/applications/${testApplicationId}/flag`,
    method: 'PATCH',
    data: null,
    description: 'Toggle applicant flag'
  },
  {
    name: 'Toggle Star',
    path: `/api/applications/${testApplicationId}/star`,
    method: 'PATCH',
    data: null,
    description: 'Toggle applicant star'
  },
  {
    name: 'Update Notes',
    path: `/api/applications/${testApplicationId}/notes`,
    method: 'PATCH',
    data: { notes: 'Test note from API test' },
    description: 'Update applicant notes'
  },
  {
    name: 'Get Applications',
    path: `/api/applications/job/${testJobId}`,
    method: 'GET',
    data: null,
    description: 'Get applications for a job'
  },
  {
    name: 'Get Application Counts',
    path: '/api/applications/counts',
    method: 'GET',
    data: null,
    description: 'Get application counts (admin)'
  },
  {
    name: 'Get Public Counts',
    path: '/api/applications/counts/public',
    method: 'GET',
    data: null,
    description: 'Get public application counts'
  }
];

// Test each endpoint
async function testEndpoints() {
  console.log('🔍 Testing each endpoint...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    console.log(''); // Add spacing between tests
  }
  
  console.log('📊 Test Summary:');
  console.log('================');
  console.log('• Check the results above for each endpoint');
  console.log('• 200/201 = Success');
  console.log('• 401 = Authentication required (expected for admin endpoints)');
  console.log('• 404 = Endpoint not found or server not running');
  console.log('• 500 = Server error');
}

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    console.log(`🧪 Testing: ${endpoint.name}`);
    console.log(`📋 Description: ${endpoint.description}`);
    console.log(`🔗 Endpoint: ${endpoint.method} ${endpoint.path}`);
    
    const postData = endpoint.data ? JSON.stringify(endpoint.data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3234,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-testing' // This will cause 401 for admin endpoints
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = http.request(options, (res) => {
      console.log(`📡 Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`📄 Response:`, response);
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ SUCCESS: Endpoint is working!');
          } else if (res.statusCode === 401) {
            console.log('🔒 EXPECTED: Authentication required (this is correct for admin endpoints)');
          } else if (res.statusCode === 404) {
            console.log('❌ NOT FOUND: Endpoint not found or server not running');
          } else if (res.statusCode === 500) {
            console.log('⚠️  SERVER ERROR: Backend error - check server logs');
          } else {
            console.log(`⚠️  UNEXPECTED: Status ${res.statusCode}`);
          }
        } catch (error) {
          console.log(`📄 Raw Response: ${data.substring(0, 200)}...`);
          console.log('⚠️  Could not parse JSON response');
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ CONNECTION REFUSED: Backend server is not running');
        console.log('💡 Start your backend server with: cd backend && npm start');
      } else {
        console.log(`❌ REQUEST ERROR: ${error.message}`);
      }
      resolve();
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Run the tests
testEndpoints();
