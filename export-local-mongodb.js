#!/usr/bin/env node

/**
 * Local MongoDB Data Export Script
 * Exports all data from local "Anoud" database
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to local MongoDB
const MONGO_URI = 'mongodb://localhost:27017/Anoud';

// Simple schemas for export
const JobSchema = new mongoose.Schema({}, { strict: false });
const UserSchema = new mongoose.Schema({}, { strict: false });

const Job = mongoose.model('Job', JobSchema);
const User = mongoose.model('User', UserSchema);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to local MongoDB database: Anoud');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Export function
async function exportData() {
  try {
    await connectDB();
    
    console.log('📊 Starting data export from Anoud database...');
    
    // Create exports directory
    const exportsDir = path.join(__dirname, 'mongodb-exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Export Jobs
    console.log('📋 Exporting Jobs collection...');
    const jobs = await Job.find({});
    const jobsData = {
      collection: 'Jobs',
      database: 'Anoud',
      count: jobs.length,
      exportedAt: new Date().toISOString(),
      data: jobs
    };
    
    const jobsFile = path.join(exportsDir, `jobs-export-${timestamp}.json`);
    fs.writeFileSync(jobsFile, JSON.stringify(jobsData, null, 2));
    console.log(`✅ Jobs exported: ${jobs.length} records to ${jobsFile}`);
    
    // Export Users
    console.log('👥 Exporting Users collection...');
    const users = await User.find({});
    const usersData = {
      collection: 'Users',
      database: 'Anoud',
      count: users.length,
      exportedAt: new Date().toISOString(),
      data: users
    };
    
    const usersFile = path.join(exportsDir, `users-export-${timestamp}.json`);
    fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2));
    console.log(`✅ Users exported: ${users.length} records to ${usersFile}`);
    
    // Create summary file
    const summary = {
      database: 'Anoud',
      exportDate: new Date().toISOString(),
      collections: {
        Jobs: jobs.length,
        Users: users.length
      },
      files: {
        jobs: jobsFile,
        users: usersFile
      }
    };
    
    const summaryFile = path.join(exportsDir, `export-summary-${timestamp}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log('\n📊 Export Summary:');
    console.log('==================');
    console.log(`📋 Jobs: ${jobs.length} records`);
    console.log(`👥 Users: ${users.length} records`);
    console.log(`\n📁 All files saved to: ${exportsDir}`);
    console.log(`📄 Summary file: ${summaryFile}`);
    
    // Show sample data
    if (jobs.length > 0) {
      console.log('\n📋 Sample Job Data:');
      console.log('===================');
      console.log(JSON.stringify(jobs[0], null, 2));
    }
    
    if (users.length > 0) {
      console.log('\n👥 Sample User Data:');
      console.log('====================');
      // Hide sensitive data
      const sampleUser = { ...users[0].toObject() };
      if (sampleUser.password) {
        sampleUser.password = '[HIDDEN]';
      }
      console.log(JSON.stringify(sampleUser, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the export
exportData();
