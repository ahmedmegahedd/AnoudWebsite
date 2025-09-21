#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test configuration
const config = {
  // Local development
  local: {
    baseUrl: 'http://localhost:3234',
    description: 'Local Development'
  },
  // Production (replace with your actual domain)
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
    name: 'Jobs List',
    method: 'GET',
    path: '/api/jobs',
    expectedStatus: 200
  },
  {
    name: 'Contact Form (POST)',
    method: 'POST',
    path: '/api/contact',
    expectedStatus: 200,
    data: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      message: 'Test message from deployment test'
    }
  },
  {
    name: 'Application Submission (Public)',
    method: 'POST',
    path: '/api/applications/public',
    expectedStatus: 200,
    data: {
      name: 'Test Applicant',
      email: 'applicant@example.com',
      phone: '1234567890',
      education: 'Bachelor',
      selfIntro: 'This is a test application with more than 30 characters to meet the validation requirements',
      jobId: '68cfd8e2198252618bbdad76' // Use a real job ID from your database
    }
  }
];

// Helper function to make HTTP requests
function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test function
async function runTests(environment) {
  console.log(`\n🧪 Testing ${environment.description} (${environment.baseUrl})`);
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const testCase of testCases) {
    try {
      console.log(`\n📋 ${testCase.name}...`);
      
      const url = `${environment.baseUrl}${testCase.path}`;
      const options = {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Deployment Test Script'
        }
      };
      
      // Add CORS headers for production testing
      if (environment.baseUrl.includes('anoudjob.com')) {
        options.headers['Origin'] = 'https://anoudjob.com';
      }
      
      const response = await makeRequest(url, options, testCase.data);
      
      const success = response.statusCode === testCase.expectedStatus;
      const status = success ? '✅ PASS' : '❌ FAIL';
      
      console.log(`   ${status} - Status: ${response.statusCode} (Expected: ${testCase.expectedStatus})`);
      
      if (!success) {
        console.log(`   Response: ${response.data.substring(0, 200)}...`);
        
        // Check for CORS errors
        if (response.data.includes('CORS') || response.data.includes('Not allowed by CORS')) {
          console.log(`   🚫 CORS Error detected!`);
        }
        
        // Check for database errors
        if (response.data.includes('MongoDB') || response.data.includes('database')) {
          console.log(`   🗄️  Database Error detected!`);
        }
      }
      
      results.push({
        name: testCase.name,
        success,
        statusCode: response.statusCode,
        expectedStatus: testCase.expectedStatus,
        response: response.data.substring(0, 200)
      });
      
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      results.push({
        name: testCase.name,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Main execution
async function main() {
  console.log('🚀 Anoud Job API Deployment Test');
  console.log('==================================');
  
  // Test local environment
  const localResults = await runTests(config.local);
  
  // Test production environment
  const productionResults = await runTests(config.production);
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  console.log('\n🏠 Local Development:');
  const localPassed = localResults.filter(r => r.success).length;
  const localTotal = localResults.length;
  console.log(`   ${localPassed}/${localTotal} tests passed`);
  
  console.log('\n🌐 Production:');
  const prodPassed = productionResults.filter(r => r.success).length;
  const prodTotal = productionResults.length;
  console.log(`   ${prodPassed}/${prodTotal} tests passed`);
  
  // Detailed failure analysis
  console.log('\n🔍 FAILURE ANALYSIS');
  console.log('===================');
  
  const failures = productionResults.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n❌ Production Failures:');
    failures.forEach(failure => {
      console.log(`   • ${failure.name}: ${failure.error || `Status ${failure.statusCode}`}`);
      if (failure.response) {
        console.log(`     Response: ${failure.response}`);
      }
    });
  } else {
    console.log('\n✅ All production tests passed!');
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  
  if (prodPassed < prodTotal) {
    console.log('1. Check CORS configuration in production');
    console.log('2. Verify environment variables (MONGO_URI, NODE_ENV)');
    console.log('3. Check server logs for detailed error messages');
    console.log('4. Ensure database is accessible from production server');
    console.log('5. Verify SSL certificate and HTTPS configuration');
  } else {
    console.log('✅ All systems are working correctly!');
  }
}

// Run the tests
main().catch(console.error);

