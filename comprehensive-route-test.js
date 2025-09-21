#!/usr/bin/env node

/**
 * Comprehensive Route Testing Script
 * Tests all API endpoints to ensure they're working correctly and ready for deployment
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:3234/api',
  testData: {
    // Test job data
    job: {
      title_en: 'Test Software Engineer',
      title_ar: 'مهندس برمجيات تجريبي',
      company: '', // Will be set after creating a company
      location_en: 'Riyadh, Saudi Arabia',
      location_ar: 'الرياض، المملكة العربية السعودية',
      type: 'Full-Time',
      salary_en: '8000-12000 SAR',
      salary_ar: '8000-12000 ريال سعودي',
      experience_en: '2-5 years',
      experience_ar: '2-5 سنوات',
      description_en: 'We are looking for a skilled software engineer to join our team.',
      description_ar: 'نبحث عن مهندس برمجيات ماهر للانضمام إلى فريقنا.'
    },
    // Test company data
    company: {
      name_en: 'Test Company Ltd',
      name_ar: 'شركة الاختبار المحدودة',
      location_en: 'Riyadh, Saudi Arabia',
      location_ar: 'الرياض، المملكة العربية السعودية',
      industry_en: 'Technology',
      industry_ar: 'التكنولوجيا'
    },
    // Test application data
    application: {
      name: 'Test Applicant',
      email: 'test@example.com',
      phone: '+966501234567',
      education: 'Bachelor\'s Degree',
      selfIntro: 'I am a highly motivated software engineer with 5 years of experience in web development and a passion for creating innovative solutions.',
      jobId: '' // Will be set after creating a job
    },
    // Test contact data
    contact: {
      name: 'Test Contact',
      email: 'contact@example.com',
      phone: '+966501234567',
      message: 'This is a test contact form submission.'
    },
    // Test lead data
    lead: {
      companyName: 'Test Lead Company',
      contactPerson: 'John Doe',
      email: 'john@testcompany.com',
      phone: '+966501234567',
      status: 'New',
      leadSource: 'Website Form',
      notes: 'Test lead for API testing'
    },
    // Test admin credentials
    admin: {
      email: 'ahmedmegahedbis@gmail.com',
      password: 'testpassword123'
    }
  }
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
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
            headers: res.headers,
            data: parsedData,
            rawData: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
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

// Test result logging
function logTest(testName, success, details = '') {
  testResults.total++;
  if (success) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${details}`);
  }
  testResults.details.push({ testName, success, details });
}

// Test individual endpoint
async function testEndpoint(method, endpoint, data = null, expectedStatus = 200, authToken = null) {
  try {
    const url = new URL(endpoint, config.baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 3234,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await makeRequest(options, data);
    const success = response.statusCode === expectedStatus;
    
    return {
      success,
      response,
      statusCode: response.statusCode,
      expectedStatus
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      statusCode: 0,
      expectedStatus
    };
  }
}

// Test file upload
async function testFileUpload(endpoint, filePath, formData, authToken = null) {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    
    // Add file
    if (filePath && fs.existsSync(filePath)) {
      form.append('resume', fs.createReadStream(filePath));
    }
    
    // Add other form data
    Object.keys(formData).forEach(key => {
      form.append(key, formData[key]);
    });
    
    const url = new URL(endpoint, config.baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 3234,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Accept': 'application/json'
      }
    };
    
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
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
              success: res.statusCode === 200 || res.statusCode === 201,
              response: parsedData,
              statusCode: res.statusCode
            });
          } catch (error) {
            resolve({
              success: false,
              response: responseData,
              statusCode: res.statusCode,
              error: error.message
            });
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      form.pipe(req);
    });
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Main test functions
async function testHealthChecks() {
  console.log('\n🔍 Testing Health Checks...');
  
  // Test server health
  const healthTest = await testEndpoint('GET', '/health');
  logTest('Server Health Check', healthTest.success, healthTest.error || `Status: ${healthTest.statusCode}`);
  
  // Test applications health
  const appHealthTest = await testEndpoint('GET', '/applications/health');
  logTest('Applications Health Check', appHealthTest.success, appHealthTest.error || `Status: ${appHealthTest.statusCode}`);
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  // Test admin login
  const loginTest = await testEndpoint('POST', '/admin/login', config.testData.admin, 200);
  logTest('Admin Login', loginTest.success, loginTest.error || `Status: ${loginTest.statusCode}`);
  
  if (loginTest.success) {
    config.authToken = loginTest.response.token;
    console.log('✅ Authentication token obtained');
  } else {
    console.log('❌ Authentication failed - some tests will be skipped');
  }
}

async function testCompanyRoutes() {
  console.log('\n🏢 Testing Company Routes...');
  
  // GET all companies
  const getCompaniesTest = await testEndpoint('GET', '/companies');
  logTest('GET /companies', getCompaniesTest.success, getCompaniesTest.error || `Status: ${getCompaniesTest.statusCode}`);
  
  // POST create company (admin only)
  const createCompanyTest = await testEndpoint('POST', '/companies', config.testData.company, 201, config.authToken);
  logTest('POST /companies (Create)', createCompanyTest.success, createCompanyTest.error || `Status: ${createCompanyTest.statusCode}`);
  
  if (createCompanyTest.success) {
    config.testData.job.company = createCompanyTest.response.company._id;
    console.log('✅ Company created, ID stored for job creation');
  }
  
  // PUT update company (admin only)
  if (createCompanyTest.success && createCompanyTest.response.company) {
    const updateData = { ...config.testData.company, name_en: 'Updated Test Company' };
    const updateCompanyTest = await testEndpoint('PUT', `/companies/${createCompanyTest.response.company._id}`, updateData, 200, config.authToken);
    logTest('PUT /companies/:id (Update)', updateCompanyTest.success, updateCompanyTest.error || `Status: ${updateCompanyTest.statusCode}`);
  }
}

async function testJobRoutes() {
  console.log('\n💼 Testing Job Routes...');
  
  // GET all jobs
  const getJobsTest = await testEndpoint('GET', '/jobs');
  logTest('GET /jobs', getJobsTest.success, getJobsTest.error || `Status: ${getJobsTest.statusCode}`);
  
  // GET featured jobs
  const getFeaturedJobsTest = await testEndpoint('GET', '/jobs/featured');
  logTest('GET /jobs/featured', getFeaturedJobsTest.success, getFeaturedJobsTest.error || `Status: ${getFeaturedJobsTest.statusCode}`);
  
  // POST create job (admin only)
  if (config.testData.job.company) {
    const createJobTest = await testEndpoint('POST', '/jobs', config.testData.job, 201, config.authToken);
    logTest('POST /jobs (Create)', createJobTest.success, createJobTest.error || `Status: ${createJobTest.statusCode}`);
    
    if (createJobTest.success) {
      config.testData.application.jobId = createJobTest.response.job._id;
      console.log('✅ Job created, ID stored for application testing');
      
      // GET job by ID
      const getJobTest = await testEndpoint('GET', `/jobs/${createJobTest.response.job._id}`);
      logTest('GET /jobs/:id', getJobTest.success, getJobTest.error || `Status: ${getJobTest.statusCode}`);
      
      // PUT update job (admin only)
      const updateData = { ...config.testData.job, title_en: 'Updated Test Job' };
      const updateJobTest = await testEndpoint('PUT', `/jobs/${createJobTest.response.job._id}`, updateData, 200, config.authToken);
      logTest('PUT /jobs/:id (Update)', updateJobTest.success, updateJobTest.error || `Status: ${updateJobTest.statusCode}`);
      
      // PATCH toggle featured (admin only)
      const toggleFeaturedTest = await testEndpoint('PATCH', `/jobs/${createJobTest.response.job._id}/featured`, {}, 200, config.authToken);
      logTest('PATCH /jobs/:id/featured', toggleFeaturedTest.success, toggleFeaturedTest.error || `Status: ${toggleFeaturedTest.statusCode}`);
    }
  } else {
    logTest('POST /jobs (Create)', false, 'No company ID available');
  }
}

async function testApplicationRoutes() {
  console.log('\n📝 Testing Application Routes...');
  
  // GET application counts (public)
  const getCountsTest = await testEndpoint('GET', '/applications/counts/public');
  logTest('GET /applications/counts/public', getCountsTest.success, getCountsTest.error || `Status: ${getCountsTest.statusCode}`);
  
  // GET application counts (admin)
  const getAdminCountsTest = await testEndpoint('GET', '/applications/counts', null, 200, config.authToken);
  logTest('GET /applications/counts (Admin)', getAdminCountsTest.success, getAdminCountsTest.error || `Status: ${getAdminCountsTest.statusCode}`);
  
  // POST public application
  if (config.testData.application.jobId) {
    const publicAppTest = await testEndpoint('POST', '/applications/public', config.testData.application, 201);
    logTest('POST /applications/public', publicAppTest.success, publicAppTest.error || `Status: ${publicAppTest.statusCode}`);
    
    // POST application with file upload (if test file exists)
    const testCvPath = path.join(__dirname, 'backend', 'test-cvs', 'sample-cv-1.txt');
    if (fs.existsSync(testCvPath)) {
      const fileUploadTest = await testFileUpload('/applications', testCvPath, config.testData.application);
      logTest('POST /applications (File Upload)', fileUploadTest.success, fileUploadTest.error || `Status: ${fileUploadTest.statusCode}`);
    } else {
      logTest('POST /applications (File Upload)', false, 'Test CV file not found');
    }
    
    // GET applications by job ID (admin)
    const getJobAppsTest = await testEndpoint('GET', `/applications/job/${config.testData.application.jobId}`, null, 200, config.authToken);
    logTest('GET /applications/job/:jobId (Admin)', getJobAppsTest.success, getJobAppsTest.error || `Status: ${getJobAppsTest.statusCode}`);
  } else {
    logTest('POST /applications/public', false, 'No job ID available');
  }
}

async function testContactRoutes() {
  console.log('\n📧 Testing Contact Routes...');
  
  // POST contact form
  const contactTest = await testEndpoint('POST', '/contact', config.testData.contact, 200);
  logTest('POST /contact', contactTest.success, contactTest.error || `Status: ${contactTest.statusCode}`);
}

async function testLeadRoutes() {
  console.log('\n🎯 Testing Lead Routes...');
  
  // GET leads (admin)
  const getLeadsTest = await testEndpoint('GET', '/leads', null, 200, config.authToken);
  logTest('GET /leads (Admin)', getLeadsTest.success, getLeadsTest.error || `Status: ${getLeadsTest.statusCode}`);
  
  // GET lead analytics (admin)
  const getAnalyticsTest = await testEndpoint('GET', '/leads/analytics', null, 200, config.authToken);
  logTest('GET /leads/analytics (Admin)', getAnalyticsTest.success, getAnalyticsTest.error || `Status: ${getAnalyticsTest.statusCode}`);
  
  // POST create lead (admin)
  const createLeadTest = await testEndpoint('POST', '/leads', config.testData.lead, 201, config.authToken);
  logTest('POST /leads (Create)', createLeadTest.success, createLeadTest.error || `Status: ${createLeadTest.statusCode}`);
  
  if (createLeadTest.success) {
    // PATCH update lead (admin)
    const updateData = { ...config.testData.lead, status: 'Contacted' };
    const updateLeadTest = await testEndpoint('PATCH', `/leads/${createLeadTest.response._id}`, updateData, 200, config.authToken);
    logTest('PATCH /leads/:id (Update)', updateLeadTest.success, updateLeadTest.error || `Status: ${updateLeadTest.statusCode}`);
  }
}

async function testUserRoutes() {
  console.log('\n👥 Testing User Routes...');
  
  // GET users (admin)
  const getUsersTest = await testEndpoint('GET', '/users', null, 200, config.authToken);
  logTest('GET /users (Admin)', getUsersTest.success, getUsersTest.error || `Status: ${getUsersTest.statusCode}`);
  
  if (getUsersTest.success && getUsersTest.response.users && getUsersTest.response.users.length > 0) {
    const userId = getUsersTest.response.users[0]._id;
    
    // GET user by ID (admin)
    const getUserTest = await testEndpoint('GET', `/users/${userId}`, null, 200, config.authToken);
    logTest('GET /users/:id (Admin)', getUserTest.success, getUserTest.error || `Status: ${getUserTest.statusCode}`);
  }
}

async function testCvUploadRoutes() {
  console.log('\n📄 Testing CV Upload Routes...');
  
  // GET supported formats
  const getFormatsTest = await testEndpoint('GET', '/cv-upload/supported-formats');
  logTest('GET /cv-upload/supported-formats', getFormatsTest.success, getFormatsTest.error || `Status: ${getFormatsTest.statusCode}`);
  
  // Test ZIP file upload (if test ZIP exists)
  const testZipPath = path.join(__dirname, 'backend', 'test-cvs.zip');
  if (fs.existsSync(testZipPath)) {
    const zipUploadTest = await testFileUpload('/cv-upload/process-zip', testZipPath, {}, config.authToken);
    logTest('POST /cv-upload/process-zip', zipUploadTest.success, zipUploadTest.error || `Status: ${zipUploadTest.statusCode}`);
  } else {
    logTest('POST /cv-upload/process-zip', false, 'Test ZIP file not found');
  }
}

async function testErrorHandling() {
  console.log('\n⚠️ Testing Error Handling...');
  
  // Test 404 for non-existent job
  const notFoundTest = await testEndpoint('GET', '/jobs/507f1f77bcf86cd799439011', null, 404);
  logTest('GET /jobs/:id (404)', notFoundTest.success, `Expected 404, got ${notFoundTest.statusCode}`);
  
  // Test validation error for job creation
  const invalidJobTest = await testEndpoint('POST', '/jobs', {}, 400, config.authToken);
  logTest('POST /jobs (Validation Error)', invalidJobTest.success, `Expected 400, got ${invalidJobTest.statusCode}`);
  
  // Test unauthorized access
  const unauthorizedTest = await testEndpoint('GET', '/users', null, 401);
  logTest('GET /users (Unauthorized)', unauthorizedTest.success, `Expected 401, got ${unauthorizedTest.statusCode}`);
}

async function testDatabaseIntegration() {
  console.log('\n🗄️ Testing Database Integration...');
  
  // Test that data is actually saved
  const jobsTest = await testEndpoint('GET', '/jobs');
  if (jobsTest.success && jobsTest.response.length > 0) {
    logTest('Database Integration - Jobs', true, `Found ${jobsTest.response.length} jobs in database`);
  } else {
    logTest('Database Integration - Jobs', false, 'No jobs found in database');
  }
  
  const applicationsTest = await testEndpoint('GET', '/applications/counts/public');
  if (applicationsTest.success) {
    const totalApps = Object.values(applicationsTest.response).reduce((sum, count) => sum + count, 0);
    logTest('Database Integration - Applications', true, `Found ${totalApps} applications in database`);
  } else {
    logTest('Database Integration - Applications', false, 'Could not retrieve application counts');
  }
}

// Cleanup function
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  if (config.authToken) {
    // Delete test job
    if (config.testData.application.jobId) {
      const deleteJobTest = await testEndpoint('DELETE', `/jobs/${config.testData.application.jobId}`, null, 200, config.authToken);
      logTest('DELETE /jobs/:id (Cleanup)', deleteJobTest.success, deleteJobTest.error || `Status: ${deleteJobTest.statusCode}`);
    }
    
    // Delete test company
    if (config.testData.job.company) {
      const deleteCompanyTest = await testEndpoint('DELETE', `/companies/${config.testData.job.company}`, null, 200, config.authToken);
      logTest('DELETE /companies/:id (Cleanup)', deleteCompanyTest.success, deleteCompanyTest.error || `Status: ${deleteCompanyTest.statusCode}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Route Testing...');
  console.log(`📍 Testing against: ${config.baseUrl}`);
  console.log('=' * 60);
  
  try {
    await testHealthChecks();
    await testAuthentication();
    await testCompanyRoutes();
    await testJobRoutes();
    await testApplicationRoutes();
    await testContactRoutes();
    await testLeadRoutes();
    await testUserRoutes();
    await testCvUploadRoutes();
    await testErrorHandling();
    await testDatabaseIntegration();
    
    // Cleanup
    await cleanup();
    
    // Print summary
    console.log('\n' + '=' * 60);
    console.log('📊 TEST SUMMARY');
    console.log('=' * 60);
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.details
        .filter(test => !test.success)
        .forEach(test => console.log(`  - ${test.testName}: ${test.details}`));
    }
    
    console.log('\n🎯 DEPLOYMENT READINESS:');
    if (testResults.failed === 0) {
      console.log('✅ ALL TESTS PASSED - Ready for deployment!');
    } else if (testResults.failed <= 3) {
      console.log('⚠️ Minor issues detected - Review failed tests before deployment');
    } else {
      console.log('❌ Multiple issues detected - Fix before deployment');
    }
    
  } catch (error) {
    console.error('❌ Test runner error:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testEndpoint,
  testFileUpload,
  config
};
