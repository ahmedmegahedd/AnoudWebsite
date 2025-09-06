#!/usr/bin/env node

/**
 * API Test Script for Anoud Job Website
 * This script tests the API endpoints to ensure they're working correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  // Change these URLs based on your environment
  development: {
    baseUrl: 'http://localhost:3234',
    description: 'Local Development'
  },
  production: {
    baseUrl: 'https://anoudjob.com',
    description: 'Production'
  }
};

// Test cases
const testCases = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/health',
    expectedStatus: 200
  },
  {
    name: 'Root Endpoint',
    method: 'GET',
    path: '/',
    expectedStatus: 200
  },
  {
    name: 'Jobs API',
    method: 'GET',
    path: '/api/jobs',
    expectedStatus: 200
  },
  {
    name: 'Application Counts (Public)',
    method: 'GET',
    path: '/api/applications/counts/public',
    expectedStatus: 200
  }
];

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Run tests
async function runTests(environment) {
  const env = config[environment];
  if (!env) {
    console.error(`❌ Unknown environment: ${environment}`);
    process.exit(1);
  }

  console.log(`\n🧪 Testing ${env.description} API`);
  console.log(`📍 Base URL: ${env.baseUrl}`);
  console.log('=' .repeat(50));

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      console.log(`\n🔍 ${testCase.name}...`);
      
      const url = `${env.baseUrl}${testCase.path}`;
      const response = await makeRequest(url, {
        method: testCase.method
      });

      if (response.status === testCase.expectedStatus) {
        console.log(`✅ PASS - Status: ${response.status}`);
        if (response.data) {
          console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        }
        passed++;
      } else {
        console.log(`❌ FAIL - Expected: ${testCase.expectedStatus}, Got: ${response.status}`);
        console.log(`   Response: ${response.rawData.substring(0, 200)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the API configuration.');
  }

  return failed === 0;
}

// CORS test
async function testCORS(environment) {
  const env = config[environment];
  console.log(`\n🌐 Testing CORS for ${env.description}`);
  
  try {
    const response = await makeRequest(`${env.baseUrl}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.anoudjob.com',
        'Access-Control-Request-Method': 'GET'
      }
    });

    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers']
    };

    console.log('CORS Headers:', corsHeaders);
    
    if (corsHeaders['access-control-allow-origin']) {
      console.log('✅ CORS is configured');
    } else {
      console.log('❌ CORS headers missing');
    }
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
  }
}

// Main function
async function main() {
  const environment = process.argv[2] || 'development';
  
  console.log('🚀 Anoud Job API Test Suite');
  console.log(`Environment: ${environment}`);
  
  const success = await runTests(environment);
  await testCORS(environment);
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, testCORS };
