#!/usr/bin/env node

/**
 * Comprehensive API Test Script
 * Tests all GET and POST endpoints to ensure they're working properly
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTION_DOMAIN = 'anoudjob.com';
const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test data
const TEST_APPLICATION = {
  name: 'Test User API',
  email: 'testapi@example.com',
  phone: '1234567890',
  education: "Bachelor's Degree",
  selfIntro: 'This is a test application with more than 30 characters to meet the minimum requirement for testing the API endpoints.',
  jobId: null // Will be set from first job found
};

// Utility function to make HTTP requests
function makeRequest(protocol, hostname, path, options = {}) {
  return new Promise((resolve, reject) => {
    const client = protocol === 'https' ? https : http;
    const url = `${protocol}://${hostname}${path}`;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Script/1.0',
        ...options.headers
      }
    };

    const req = client.request(url, requestOptions, (res) => {
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
          parsedData = data.substring(0, 200) + (data.length > 200 ? '...' : '');
        }
        
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          data: parsedData,
          isJson,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test function
async function runTest(testName, testFunction) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log('='.repeat(50));
  
  try {
    const result = await testFunction();
    if (result.success) {
      console.log(`✅ PASSED: ${testName}`);
      TEST_RESULTS.passed++;
    } else {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Error: ${result.data}`);
      TEST_RESULTS.failed++;
    }
    TEST_RESULTS.tests.push({ name: testName, ...result });
    return result;
  } catch (error) {
    console.log(`❌ ERROR: ${testName}`);
    console.log(`   Error: ${error.message}`);
    TEST_RESULTS.failed++;
    TEST_RESULTS.tests.push({ name: testName, error: error.message, success: false });
    return { success: false, error: error.message };
  }
}

// Individual test functions
async function testHealthEndpoint() {
  return await makeRequest('https', PRODUCTION_DOMAIN, '/health');
}

async function testApplicationsHealth() {
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/applications/health');
}

async function testJobsAPI() {
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/jobs');
}

async function testCompaniesAPI() {
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/companies');
}

async function testPublicApplicantCounts() {
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/applications/counts/public');
}

async function testAuthenticatedApplicantCounts() {
  // This will fail without auth token, but we want to test the endpoint exists
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/applications/counts');
}

async function testApplicationSubmission() {
  // First, get a job ID
  const jobsResult = await makeRequest('https', PRODUCTION_DOMAIN, '/api/jobs');
  if (!jobsResult.success || !jobsResult.data || !Array.isArray(jobsResult.data) || jobsResult.data.length === 0) {
    return { success: false, error: 'No jobs available for testing' };
  }
  
  const jobId = jobsResult.data[0]._id;
  TEST_APPLICATION.jobId = jobId;
  
  console.log(`   Using job ID: ${jobId}`);
  
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/applications', {
    method: 'POST',
    body: TEST_APPLICATION
  });
}

async function testPublicApplicationSubmission() {
  if (!TEST_APPLICATION.jobId) {
    return { success: false, error: 'No job ID available' };
  }
  
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/applications/public', {
    method: 'POST',
    body: TEST_APPLICATION
  });
}

async function testContactAPI() {
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/contact', {
    method: 'POST',
    body: {
      name: 'Test Contact',
      email: 'contact@test.com',
      phone: '1234567890',
      message: 'This is a test contact message'
    }
  });
}

async function testLeadsAPI() {
  // Test GET leads (will fail without auth, but tests endpoint exists)
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/leads');
}

async function testAdminAPI() {
  // Test admin endpoint (will fail without auth, but tests endpoint exists)
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/admin');
}

async function testUsersAPI() {
  // Test users endpoint (will fail without auth, but tests endpoint exists)
  return await makeRequest('https', PRODUCTION_DOMAIN, '/api/users');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Comprehensive API Testing for Anoud Job Website');
  console.log('==================================================');
  console.log(`🌐 Testing domain: ${PRODUCTION_DOMAIN}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  // GET API Tests
  console.log('\n📡 GET API Tests');
  console.log('================');
  
  await runTest('Health Endpoint', testHealthEndpoint);
  await runTest('Applications Health', testApplicationsHealth);
  await runTest('Jobs API', testJobsAPI);
  await runTest('Companies API', testCompaniesAPI);
  await runTest('Public Applicant Counts', testPublicApplicantCounts);
  await runTest('Authenticated Applicant Counts (Expected 401)', testAuthenticatedApplicantCounts);
  
  // POST API Tests
  console.log('\n📤 POST API Tests');
  console.log('=================');
  
  await runTest('Application Submission', testApplicationSubmission);
  await runTest('Public Application Submission', testPublicApplicationSubmission);
  await runTest('Contact API', testContactAPI);
  
  // Admin API Tests (Expected to fail without auth)
  console.log('\n🔐 Admin API Tests (Expected 401/403)');
  console.log('=====================================');
  
  await runTest('Leads API (Expected 401)', testLeadsAPI);
  await runTest('Admin API (Expected 401)', testAdminAPI);
  await runTest('Users API (Expected 401)', testUsersAPI);
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${TEST_RESULTS.passed}`);
  console.log(`❌ Failed: ${TEST_RESULTS.failed}`);
  console.log(`📈 Success Rate: ${Math.round((TEST_RESULTS.passed / (TEST_RESULTS.passed + TEST_RESULTS.failed)) * 100)}%`);
  
  // Detailed results
  console.log('\n📋 Detailed Results');
  console.log('===================');
  
  TEST_RESULTS.tests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    const statusCode = test.status || 'ERROR';
    console.log(`${status} ${test.name} - ${statusCode}`);
    
    if (!test.success && test.error) {
      console.log(`   Error: ${test.error}`);
    } else if (!test.success && test.data) {
      console.log(`   Response: ${typeof test.data === 'string' ? test.data.substring(0, 100) : JSON.stringify(test.data).substring(0, 100)}`);
    }
  });
  
  // Recommendations
  console.log('\n💡 Recommendations');
  console.log('==================');
  
  const criticalFailures = TEST_RESULTS.tests.filter(t => 
    !t.success && 
    (t.name.includes('Health') || t.name.includes('Jobs') || t.name.includes('Application Submission'))
  );
  
  if (criticalFailures.length > 0) {
    console.log('🚨 Critical Issues Found:');
    criticalFailures.forEach(test => {
      console.log(`   - ${test.name}: ${test.error || 'Failed'}`);
    });
    console.log('\n🔧 Action Required: Deploy the backend fixes immediately!');
  } else {
    console.log('✅ All critical endpoints are working properly!');
  }
  
  const authFailures = TEST_RESULTS.tests.filter(t => 
    !t.success && 
    (t.name.includes('Expected 401') || t.name.includes('Expected 403'))
  );
  
  if (authFailures.length === 0) {
    console.log('⚠️  Warning: Admin endpoints should return 401/403 without authentication');
  }
  
  console.log('\n🏁 Testing completed!');
  console.log(`⏰ Finished at: ${new Date().toISOString()}`);
}

// Run the tests
runAllTests().catch(console.error);
