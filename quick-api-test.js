#!/usr/bin/env node

/**
 * Quick API Test Script
 * Tests key API endpoints to verify they're working correctly
 */

const http = require('http');

// Test results
let passed = 0;
let failed = 0;

function logTest(testName, success, details = '') {
  if (success) {
    passed++;
    console.log(`✅ ${testName}`);
  } else {
    failed++;
    console.log(`❌ ${testName}: ${details}`);
  }
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            rawData: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            rawData: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoint(method, path, data = null, expectedStatus = 200) {
  try {
    const options = {
      hostname: 'localhost',
      port: 3234,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const response = await makeRequest(options, data);
    return {
      success: response.statusCode === expectedStatus,
      statusCode: response.statusCode,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 0,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🚀 Quick API Test - Verifying Key Endpoints');
  console.log('='.repeat(50));
  
  // Test 1: GET /api/jobs
  const jobsTest = await testEndpoint('GET', '/api/jobs');
  logTest('GET /api/jobs', jobsTest.success, `Status: ${jobsTest.statusCode}`);
  
  // Test 2: GET /api/jobs/featured
  const featuredTest = await testEndpoint('GET', '/api/jobs/featured');
  logTest('GET /api/jobs/featured', featuredTest.success, `Status: ${featuredTest.statusCode}`);
  
  // Test 3: GET /api/companies
  const companiesTest = await testEndpoint('GET', '/api/companies');
  logTest('GET /api/companies', companiesTest.success, `Status: ${companiesTest.statusCode}`);
  
  // Test 4: GET /api/applications/counts/public
  const countsTest = await testEndpoint('GET', '/api/applications/counts/public');
  logTest('GET /api/applications/counts/public', countsTest.success, `Status: ${countsTest.statusCode}`);
  
  // Test 5: POST /api/contact
  const contactData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+966501234567',
    message: 'This is a test message'
  };
  const contactTest = await testEndpoint('POST', '/api/contact', contactData, 200);
  logTest('POST /api/contact', contactTest.success, `Status: ${contactTest.statusCode}`);
  
  // Test 6: POST /api/applications/public
  const applicationData = {
    name: 'Test Applicant',
    email: 'applicant@example.com',
    phone: '+966501234567',
    education: 'Bachelor\'s Degree',
    selfIntro: 'I am a test applicant with 5 years of experience.',
    jobId: jobsTest.data && jobsTest.data[0] ? jobsTest.data[0]._id : '507f1f77bcf86cd799439011'
  };
  const applicationTest = await testEndpoint('POST', '/api/applications/public', applicationData, 201);
  logTest('POST /api/applications/public', applicationTest.success, `Status: ${applicationTest.statusCode}`);
  
  // Test 7: GET /api/cv-upload/supported-formats
  const cvFormatsTest = await testEndpoint('GET', '/api/cv-upload/supported-formats');
  logTest('GET /api/cv-upload/supported-formats', cvFormatsTest.success, `Status: ${cvFormatsTest.statusCode}`);
  
  // Test 8: Test 404 handling
  const notFoundTest = await testEndpoint('GET', '/api/nonexistent', null, 404);
  logTest('GET /api/nonexistent (404)', notFoundTest.success, `Status: ${notFoundTest.statusCode}`);
  
  // Test 9: Test admin login (should fail without proper credentials)
  const adminLoginTest = await testEndpoint('POST', '/api/admin/login', { email: 'test@test.com', password: 'wrong' }, 400);
  logTest('POST /api/admin/login (Invalid)', adminLoginTest.success, `Status: ${adminLoginTest.statusCode}`);
  
  // Test 10: Test unauthorized access
  const unauthorizedTest = await testEndpoint('GET', '/api/users', null, 401);
  logTest('GET /api/users (Unauthorized)', unauthorizedTest.success, `Status: ${unauthorizedTest.statusCode}`);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  console.log('\n🎯 DEPLOYMENT READINESS:');
  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED - Ready for deployment!');
  } else if (failed <= 2) {
    console.log('⚠️ Minor issues detected - Review failed tests before deployment');
  } else {
    console.log('❌ Multiple issues detected - Fix before deployment');
  }
  
  // Database verification
  if (jobsTest.success && jobsTest.data) {
    console.log(`\n📊 Database Status:`);
    console.log(`   - Jobs in database: ${jobsTest.data.length}`);
    if (countsTest.success && countsTest.data) {
      const totalApps = Object.values(countsTest.data).reduce((sum, count) => sum + count, 0);
      console.log(`   - Applications in database: ${totalApps}`);
    }
  }
}

// Run tests
runTests().catch(console.error);
