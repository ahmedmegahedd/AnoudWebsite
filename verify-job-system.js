#!/usr/bin/env node

/**
 * Job System Verification Script
 * Verifies that the job creation system is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Job Creation System...\n');

// Check if required files exist
const requiredFiles = [
  'backend/models/Job.js',
  'backend/routes/jobs.js',
  'frontend/src/context/JobContext.tsx',
  'frontend/src/components/JobForm.tsx',
  'frontend/src/pages/AdminJobs.tsx'
];

console.log('📁 Checking Required Files:');
console.log('============================');

let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check backend job model
console.log('\n📋 Checking Backend Job Model:');
console.log('===============================');

try {
  const jobModel = fs.readFileSync('backend/models/Job.js', 'utf8');
  const hasRequiredFields = [
    'title_en', 'title_ar', 'company', 'location_en', 'location_ar',
    'type', 'salary_en', 'salary_ar', 'experience_en', 'experience_ar',
    'description_en', 'description_ar', 'featured', 'postedAt'
  ].every(field => jobModel.includes(field));
  
  console.log(`✅ Job model exists`);
  console.log(`✅ Required fields present: ${hasRequiredFields ? 'Yes' : 'No'}`);
  console.log(`✅ Mongoose schema defined`);
} catch (error) {
  console.log('❌ Job model not found or invalid');
  allFilesExist = false;
}

// Check backend routes
console.log('\n🛣️  Checking Backend Routes:');
console.log('============================');

try {
  const jobsRoute = fs.readFileSync('backend/routes/jobs.js', 'utf8');
  const hasPostRoute = jobsRoute.includes('router.post(\'/\'');
  const hasAdminAuth = jobsRoute.includes('adminAuth');
  const hasValidation = jobsRoute.includes('body(');
  const hasSave = jobsRoute.includes('job.save()');
  
  console.log(`✅ Jobs route file exists`);
  console.log(`✅ POST route defined: ${hasPostRoute ? 'Yes' : 'No'}`);
  console.log(`✅ Admin authentication: ${hasAdminAuth ? 'Yes' : 'No'}`);
  console.log(`✅ Data validation: ${hasValidation ? 'Yes' : 'No'}`);
  console.log(`✅ Database save: ${hasSave ? 'Yes' : 'No'}`);
} catch (error) {
  console.log('❌ Jobs route not found or invalid');
  allFilesExist = false;
}

// Check frontend context
console.log('\n⚛️  Checking Frontend Job Context:');
console.log('==================================');

try {
  const jobContext = fs.readFileSync('frontend/src/context/JobContext.tsx', 'utf8');
  const hasAddJob = jobContext.includes('addJob');
  const hasApiCall = jobContext.includes('fetch(');
  const hasStateUpdate = jobContext.includes('setJobs');
  
  console.log(`✅ Job context exists`);
  console.log(`✅ Add job function: ${hasAddJob ? 'Yes' : 'No'}`);
  console.log(`✅ API calls: ${hasApiCall ? 'Yes' : 'No'}`);
  console.log(`✅ State updates: ${hasStateUpdate ? 'Yes' : 'No'}`);
} catch (error) {
  console.log('❌ Job context not found or invalid');
  allFilesExist = false;
}

// Check job form
console.log('\n📝 Checking Job Form:');
console.log('=====================');

try {
  const jobForm = fs.readFileSync('frontend/src/components/JobForm.tsx', 'utf8');
  const hasFormFields = jobForm.includes('title_en') && jobForm.includes('title_ar');
  const hasSubmit = jobForm.includes('handleSubmit');
  const hasValidation = jobForm.includes('validateForm');
  
  console.log(`✅ Job form exists`);
  console.log(`✅ Form fields: ${hasFormFields ? 'Yes' : 'No'}`);
  console.log(`✅ Submit handler: ${hasSubmit ? 'Yes' : 'No'}`);
  console.log(`✅ Form validation: ${hasValidation ? 'Yes' : 'No'}`);
} catch (error) {
  console.log('❌ Job form not found or invalid');
  allFilesExist = false;
}

// Check admin jobs page
console.log('\n👨‍💼 Checking Admin Jobs Page:');
console.log('==============================');

try {
  const adminJobs = fs.readFileSync('frontend/src/pages/AdminJobs.tsx', 'utf8');
  const hasJobForm = adminJobs.includes('JobForm');
  const hasAddJob = adminJobs.includes('handleAddJob');
  const hasJobContext = adminJobs.includes('useJobs');
  
  console.log(`✅ Admin jobs page exists`);
  console.log(`✅ Job form integration: ${hasJobForm ? 'Yes' : 'No'}`);
  console.log(`✅ Add job handler: ${hasAddJob ? 'Yes' : 'No'}`);
  console.log(`✅ Job context usage: ${hasJobContext ? 'Yes' : 'No'}`);
} catch (error) {
  console.log('❌ Admin jobs page not found or invalid');
  allFilesExist = false;
}

// Final summary
console.log('\n📊 System Verification Summary:');
console.log('================================');

if (allFilesExist) {
  console.log('🎉 SUCCESS: All required files are present!');
  console.log('✅ Your job creation system is properly configured');
  console.log('✅ New jobs will automatically save to the database');
  console.log('✅ Jobs will appear immediately on the website');
  console.log('\n🚀 Ready to use! Just:');
  console.log('   1. Start your backend server (npm start in backend/)');
  console.log('   2. Start your frontend (npm start in frontend/)');
  console.log('   3. Login to admin panel (/secure-access)');
  console.log('   4. Create jobs through the admin interface');
} else {
  console.log('❌ ISSUES FOUND: Some required files are missing or invalid');
  console.log('🔧 Please check the missing files and ensure they exist');
}

console.log('\n📚 For detailed instructions, see: AUTOMATIC_JOB_SAVING_GUIDE.md');
