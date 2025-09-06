#!/usr/bin/env node

/**
 * Test script to verify API endpoints after deployment
 * Run with: node test-deployment-api.js
 */

const https = require('https');
const http = require('http');

// Configuration
const PRODUCTION_DOMAIN = 'anoudjob.com';
const TEST_ENDPOINTS = [
  '/health',
  '/api/applications/counts/public',
  '/api/jobs',
  '/api/companies'
];

// Test function
async function testEndpoint(protocol, hostname, path) {
  return new Promise((resolve, reject) => {
    const client = protocol === 'https' ? https : http;
    const url = `${protocol}://${hostname}${path}`;
    
    console.log(`\n🔍 Testing: ${url}`);
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let parsedData = null;
        let isJson = false;
        
        try {
          if (data.length > 0) {
            parsedData = JSON.parse(data);
            isJson = true;
          }
        } catch (e) {
          // Not JSON, probably HTML or other content
          parsedData = data.substring(0, 200) + (data.length > 200 ? '...' : '');
        }
        
        const result = {
          url,
          status: res.statusCode,
          headers: res.headers,
          data: parsedData,
          isJson,
          success: res.statusCode >= 200 && res.statusCode < 300
        };
        
        if (result.success) {
          if (isJson) {
            console.log(`✅ ${res.statusCode} - ${path} (JSON)`);
          } else {
            console.log(`⚠️  ${res.statusCode} - ${path} (HTML/Other - might be serving React app)`);
          }
        } else {
          console.log(`❌ ${res.statusCode} - ${path}`);
          console.log(`   Error: ${data.substring(0, 100)}...`);
        }
        
        resolve(result);
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Network Error - ${path}: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout - ${path}`);
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Testing Anoud Job API Endpoints');
  console.log('=====================================');
  
  const results = [];
  
  // Test both HTTP and HTTPS
  const protocols = ['https', 'http'];
  
  for (const protocol of protocols) {
    console.log(`\n📡 Testing ${protocol.toUpperCase()} endpoints:`);
    
    for (const endpoint of TEST_ENDPOINTS) {
      try {
        const result = await testEndpoint(protocol, PRODUCTION_DOMAIN, endpoint);
        results.push(result);
      } catch (error) {
        console.log(`❌ Failed to test ${endpoint}: ${error.message}`);
        results.push({
          url: `${protocol}://${PRODUCTION_DOMAIN}${endpoint}`,
          status: 'ERROR',
          error: error.message,
          success: false
        });
      }
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((successful / results.length) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n🔍 Failed Tests:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   ${result.url} - ${result.status} ${result.error || ''}`);
    });
  }
  
  // CORS Test
  console.log('\n🌐 CORS Test');
  console.log('============');
  
  try {
    const corsResult = await testEndpoint('https', PRODUCTION_DOMAIN, '/api/applications/counts/public');
    const corsHeaders = corsResult.headers;
    
    console.log('CORS Headers:');
    console.log(`   Access-Control-Allow-Origin: ${corsHeaders['access-control-allow-origin'] || 'Not set'}`);
    console.log(`   Access-Control-Allow-Methods: ${corsHeaders['access-control-allow-methods'] || 'Not set'}`);
    console.log(`   Access-Control-Allow-Headers: ${corsHeaders['access-control-allow-headers'] || 'Not set'}`);
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
  }
  
  console.log('\n🏁 Test completed!');
}

// Run the tests
runTests().catch(console.error);
