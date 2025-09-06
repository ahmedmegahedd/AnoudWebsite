#!/usr/bin/env node

/**
 * Test Job Creation Script
 * Tests that new jobs are automatically saved to the database
 */

const mongoose = require('mongoose');
const Job = require('./backend/models/Job');
const Company = require('./backend/models/Company');

// Connect to local MongoDB
const MONGO_URI = 'mongodb://localhost:27017/Anoud';

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to local MongoDB database: Anoud');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Test job creation
async function testJobCreation() {
  try {
    await connectDB();
    
    console.log('🧪 Testing automatic job creation...');
    
    // Get a company to use for the test job
    const company = await Company.findOne();
    if (!company) {
      console.log('❌ No companies found. Please run the import-sample-data.js script first.');
      return;
    }
    
    console.log(`📋 Using company: ${company.name_en} (${company._id})`);
    
    // Count existing jobs
    const initialJobCount = await Job.countDocuments();
    console.log(`📊 Initial job count: ${initialJobCount}`);
    
    // Create a test job
    const testJobData = {
      title_en: 'Test Software Developer',
      title_ar: 'مطور برمجيات تجريبي',
      company: company._id,
      location_en: 'Cairo, Egypt',
      location_ar: 'القاهرة، مصر',
      type: 'Full-Time',
      salary_en: '10,000 - 15,000 EGP',
      salary_ar: '10,000 - 15,000 جنيه',
      experience_en: '2+ years',
      experience_ar: '2+ سنوات',
      description_en: 'This is a test job created to verify automatic database saving.',
      description_ar: 'هذه وظيفة تجريبية تم إنشاؤها للتحقق من الحفظ التلقائي في قاعدة البيانات.',
      featured: false,
      postedAt: new Date()
    };
    
    console.log('📝 Creating test job...');
    const newJob = new Job(testJobData);
    await newJob.save();
    
    // Populate the company data
    const populatedJob = await Job.findById(newJob._id).populate('company', 'name_en name_ar location_en location_ar industry_en industry_ar');
    
    // Count jobs after creation
    const finalJobCount = await Job.countDocuments();
    console.log(`📊 Final job count: ${finalJobCount}`);
    
    console.log('\n✅ Test Results:');
    console.log('================');
    console.log(`📈 Jobs increased by: ${finalJobCount - initialJobCount}`);
    console.log(`🆔 New job ID: ${newJob._id}`);
    console.log(`📋 Job title: ${populatedJob.title_en} / ${populatedJob.title_ar}`);
    console.log(`🏢 Company: ${populatedJob.company.name_en}`);
    console.log(`📍 Location: ${populatedJob.location_en}`);
    console.log(`💰 Salary: ${populatedJob.salary_en}`);
    console.log(`⏰ Posted at: ${populatedJob.postedAt}`);
    
    // Verify the job is in the database
    const savedJob = await Job.findById(newJob._id);
    if (savedJob) {
      console.log('\n🎉 SUCCESS: Job was automatically saved to the database!');
      console.log('✅ The system is working correctly.');
    } else {
      console.log('\n❌ ERROR: Job was not found in the database!');
    }
    
    // Show all jobs in the database
    console.log('\n📋 All Jobs in Database:');
    console.log('========================');
    const allJobs = await Job.find({}).populate('company', 'name_en name_ar').sort({ postedAt: -1 });
    allJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title_en} at ${job.company.name_en} (${job.postedAt.toISOString()})`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the test
testJobCreation();
