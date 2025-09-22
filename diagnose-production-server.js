#!/usr/bin/env node

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://www.anoudjob.com';

console.log('🔍 Production Server Diagnostic Tool');
console.log('====================================');
console.log(`Testing: ${PRODUCTION_URL}`);
console.log('');

// Helper function to make requests
function makeRequest(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      timeout: timeout,
      headers: {
        'User-Agent': 'Diagnostic-Tool/1.0'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });

    req.on('error', (err) => {
      reject({
        error: err.message,
        code: err.code,
        url: url
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        code: 'TIMEOUT',
        url: url
      });
    });

    req.end();
  });
}

// Test functions
async function testMainSite() {
  try {
    console.log('🌐 Testing main website...');
    const response = await makeRequest(PRODUCTION_URL);
    
    if (response.status === 200) {
      console.log('✅ Main website: ACCESSIBLE');
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
    } else {
      console.log('⚠️  Main website: UNEXPECTED STATUS');
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
    }
    return true;
  } catch (error) {
    console.log('❌ Main website: ERROR');
    console.log(`   Error: ${error.error}`);
    console.log(`   Code: ${error.code}`);
    return false;
  }
}

async function testAPIHealth() {
  try {
    console.log('🔍 Testing API health endpoint...');
    const response = await makeRequest(`${PRODUCTION_URL}/api/health`);
    
    if (response.status === 200) {
      console.log('✅ API Health: WORKING');
      console.log(`   Status: ${response.status}`);
      try {
        const data = JSON.parse(response.data);
        console.log(`   Response: ${JSON.stringify(data)}`);
      } catch (e) {
        console.log(`   Response: ${response.data.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ API Health: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${response.data.substring(0, 200)}...`);
    }
    return response.status === 200;
  } catch (error) {
    console.log('❌ API Health: ERROR');
    console.log(`   Error: ${error.error}`);
    console.log(`   Code: ${error.code}`);
    return false;
  }
}

async function testAPIRoot() {
  try {
    console.log('🔍 Testing API root endpoint...');
    const response = await makeRequest(`${PRODUCTION_URL}/api/`);
    
    if (response.status === 200) {
      console.log('✅ API Root: WORKING');
      console.log(`   Status: ${response.status}`);
      try {
        const data = JSON.parse(response.data);
        console.log(`   Response: ${JSON.stringify(data)}`);
      } catch (e) {
        console.log(`   Response: ${response.data.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ API Root: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${response.data.substring(0, 200)}...`);
    }
    return response.status === 200;
  } catch (error) {
    console.log('❌ API Root: ERROR');
    console.log(`   Error: ${error.error}`);
    console.log(`   Code: ${error.code}`);
    return false;
  }
}

async function testJobsEndpoint() {
  try {
    console.log('🔍 Testing jobs endpoint...');
    const response = await makeRequest(`${PRODUCTION_URL}/api/jobs`);
    
    if (response.status === 200) {
      console.log('✅ Jobs endpoint: WORKING');
      console.log(`   Status: ${response.status}`);
      try {
        const data = JSON.parse(response.data);
        console.log(`   Jobs count: ${data.length || 'Unknown'}`);
      } catch (e) {
        console.log(`   Response: ${response.data.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ Jobs endpoint: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${response.data.substring(0, 200)}...`);
    }
    return response.status === 200;
  } catch (error) {
    console.log('❌ Jobs endpoint: ERROR');
    console.log(`   Error: ${error.error}`);
    console.log(`   Code: ${error.code}`);
    return false;
  }
}

async function testCompaniesEndpoint() {
  try {
    console.log('🔍 Testing companies endpoint...');
    const response = await makeRequest(`${PRODUCTION_URL}/api/companies`);
    
    if (response.status === 200) {
      console.log('✅ Companies endpoint: WORKING');
      console.log(`   Status: ${response.status}`);
      try {
        const data = JSON.parse(response.data);
        console.log(`   Companies count: ${data.length || 'Unknown'}`);
      } catch (e) {
        console.log(`   Response: ${response.data.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ Companies endpoint: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${response.data.substring(0, 200)}...`);
    }
    return response.status === 200;
  } catch (error) {
    console.log('❌ Companies endpoint: ERROR');
    console.log(`   Error: ${error.error}`);
    console.log(`   Code: ${error.code}`);
    return false;
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log('Starting production server diagnostics...\n');
  
  const tests = [
    { name: 'Main Website', fn: testMainSite },
    { name: 'API Health', fn: testAPIHealth },
    { name: 'API Root', fn: testAPIRoot },
    { name: 'Jobs Endpoint', fn: testJobsEndpoint },
    { name: 'Companies Endpoint', fn: testCompaniesEndpoint }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) passed++;
    console.log(''); // Add spacing between tests
  }
  
  console.log('================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('================================');
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${total - passed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('');
  
  if (passed === 0) {
    console.log('🚨 CRITICAL: Server appears to be completely down!');
    console.log('');
    console.log('🔧 IMMEDIATE ACTIONS NEEDED:');
    console.log('1. Check if your server is running');
    console.log('2. Check server logs for errors');
    console.log('3. Restart the server process');
    console.log('4. Check if the domain is pointing to the right server');
  } else if (passed < total) {
    console.log('⚠️  PARTIAL FAILURE: Some services are down');
    console.log('');
    console.log('🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check if the backend server process is running');
    console.log('2. Check server logs for specific errors');
    console.log('3. Verify database connection');
    console.log('4. Check if all required environment variables are set');
  } else {
    console.log('✅ ALL TESTS PASSED: Server is working correctly!');
  }
  
  console.log('');
  console.log('🔗 Production URL: https://www.anoudjob.com');
  console.log('📋 Check your server logs for more details.');
}

// Run the diagnostics
runDiagnostics().catch(console.error);
