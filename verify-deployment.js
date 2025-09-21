#!/usr/bin/env node

/**
 * Post-Deployment Verification Script
 * Run this after deploying to verify all routes are working in production
 */

const http = require('http');
const https = require('https');

// Configuration - Update these for your production environment
const config = {
  // For local testing
  local: {
    hostname: 'localhost',
    port: 3234,
    protocol: 'http'
  },
  // For production testing (update with your domain)
  production: {
    hostname: 'anoudjob.com', // Update with your actual domain
    port: 443,
    protocol: 'https'
  }
};

// Test results
let passed = 0;
let failed = 0;
const results = [];

function logTest(testName, success, details = '', environment = '') {
  const status = success ? '✅' : '❌';
  const env = environment ? `[${environment}] ` : '';
  console.log(`${status} ${env}${testName}${details ? ': ' + details : ''}`);
  
  if (success) {
    passed++;
  } else {
    failed++;
  }
  
  results.push({ testName, success, details, environment });
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https' ? https : http;
    
    const req = protocol.request(options, (res) => {
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

async function testEndpoint(environment, method, path, data = null, expectedStatus = 200) {
  try {
    const env = config[environment];
    const options = {
      hostname: env.hostname,
      port: env.port,
      path: path,
      method: method,
      protocol: env.protocol + ':',
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

async function testEnvironment(environment) {
  console.log(`\n🔍 Testing ${environment.toUpperCase()} Environment`);
  console.log('='.repeat(50));
  
  // Test 1: Basic connectivity
  const jobsTest = await testEndpoint(environment, 'GET', '/api/jobs');
  logTest('GET /api/jobs', jobsTest.success, `Status: ${jobsTest.statusCode}`, environment);
  
  // Test 2: Featured jobs
  const featuredTest = await testEndpoint(environment, 'GET', '/api/jobs/featured');
  logTest('GET /api/jobs/featured', featuredTest.success, `Status: ${featuredTest.statusCode}`, environment);
  
  // Test 3: Companies
  const companiesTest = await testEndpoint(environment, 'GET', '/api/companies');
  logTest('GET /api/companies', companiesTest.success, `Status: ${companiesTest.statusCode}`, environment);
  
  // Test 4: Application counts
  const countsTest = await testEndpoint(environment, 'GET', '/api/applications/counts/public');
  logTest('GET /api/applications/counts/public', countsTest.success, `Status: ${countsTest.statusCode}`, environment);
  
  // Test 5: Contact form
  const contactData = {
    name: 'Deployment Test',
    email: 'test@deployment.com',
    phone: '+966501234567',
    message: 'This is a deployment verification test'
  };
  const contactTest = await testEndpoint(environment, 'POST', '/api/contact', contactData, 200);
  logTest('POST /api/contact', contactTest.success, `Status: ${contactTest.statusCode}`, environment);
  
  // Test 6: Application submission
  const applicationData = {
    name: 'Deployment Test Applicant',
    email: 'applicant@deployment.com',
    phone: '+966501234567',
    education: 'Bachelor\'s Degree',
    selfIntro: 'This is a deployment verification test application.',
    jobId: jobsTest.data && jobsTest.data[0] ? jobsTest.data[0]._id : '507f1f77bcf86cd799439011'
  };
  const applicationTest = await testEndpoint(environment, 'POST', '/api/applications/public', applicationData, 201);
  logTest('POST /api/applications/public', applicationTest.success, `Status: ${applicationTest.statusCode}`, environment);
  
  // Test 7: CV upload formats
  const cvFormatsTest = await testEndpoint(environment, 'GET', '/api/cv-upload/supported-formats');
  logTest('GET /api/cv-upload/supported-formats', cvFormatsTest.success, `Status: ${cvFormatsTest.statusCode}`, environment);
  
  // Test 8: Error handling
  const notFoundTest = await testEndpoint(environment, 'GET', '/api/nonexistent', null, 404);
  logTest('GET /api/nonexistent (404)', notFoundTest.success, `Status: ${notFoundTest.statusCode}`, environment);
  
  // Test 9: Unauthorized access
  const unauthorizedTest = await testEndpoint(environment, 'GET', '/api/users', null, 401);
  logTest('GET /api/users (Unauthorized)', unauthorizedTest.success, `Status: ${unauthorizedTest.statusCode}`, environment);
  
  return { jobsTest, countsTest };
}

async function runVerification() {
  console.log('🚀 Post-Deployment Verification');
  console.log('='.repeat(60));
  
  // Test local environment
  const localResults = await testEnvironment('local');
  
  // Test production environment (if configured)
  let productionResults = null;
  try {
    productionResults = await testEnvironment('production');
  } catch (error) {
    console.log('\n⚠️ Production environment not accessible or not configured');
    console.log('   Update the production hostname in the script if needed');
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  // Environment-specific results
  if (localResults) {
    console.log('\n📊 Local Environment Data:');
    if (localResults.jobsTest.success && localResults.jobsTest.data) {
      console.log(`   - Jobs in database: ${localResults.jobsTest.data.length}`);
    }
    if (localResults.countsTest.success && localResults.countsTest.data) {
      const totalApps = Object.values(localResults.countsTest.data).reduce((sum, count) => sum + count, 0);
      console.log(`   - Applications in database: ${totalApps}`);
    }
  }
  
  if (productionResults) {
    console.log('\n📊 Production Environment Data:');
    if (productionResults.jobsTest.success && productionResults.jobsTest.data) {
      console.log(`   - Jobs in database: ${productionResults.jobsTest.data.length}`);
    }
    if (productionResults.countsTest.success && productionResults.countsTest.data) {
      const totalApps = Object.values(productionResults.countsTest.data).reduce((sum, count) => sum + count, 0);
      console.log(`   - Applications in database: ${totalApps}`);
    }
  }
  
  console.log('\n🎯 DEPLOYMENT STATUS:');
  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED - Deployment successful!');
  } else if (failed <= 2) {
    console.log('⚠️ Minor issues detected - Review failed tests');
  } else {
    console.log('❌ Multiple issues detected - Deployment may have problems');
  }
  
  // Failed tests details
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(test => !test.success)
      .forEach(test => {
        const env = test.environment ? `[${test.environment}] ` : '';
        console.log(`   - ${env}${test.testName}: ${test.details}`);
      });
  }
}

// Run verification
runVerification().catch(console.error);
