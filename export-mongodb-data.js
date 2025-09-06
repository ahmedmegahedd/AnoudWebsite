#!/usr/bin/env node

/**
 * MongoDB Data Export Script
 * Exports all data from Anoud database - Jobs and Users collections
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Job = require('./backend/models/Job');
const User = require('./backend/models/User');
const Application = require('./backend/models/Application');
const Company = require('./backend/models/Company');
const Lead = require('./backend/models/Lead');

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is required');
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Export function
async function exportData() {
  try {
    await connectDB();
    
    console.log('📊 Starting data export...');
    
    // Create exports directory
    const exportsDir = path.join(__dirname, 'mongodb-exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Export Jobs
    console.log('📋 Exporting Jobs...');
    const jobs = await Job.find({}).populate('company');
    const jobsData = {
      collection: 'Jobs',
      count: jobs.length,
      exportedAt: new Date().toISOString(),
      data: jobs
    };
    
    const jobsFile = path.join(exportsDir, `jobs-export-${timestamp}.json`);
    fs.writeFileSync(jobsFile, JSON.stringify(jobsData, null, 2));
    console.log(`✅ Jobs exported: ${jobs.length} records to ${jobsFile}`);
    
    // Export Users
    console.log('👥 Exporting Users...');
    const users = await User.find({});
    const usersData = {
      collection: 'Users',
      count: users.length,
      exportedAt: new Date().toISOString(),
      data: users
    };
    
    const usersFile = path.join(exportsDir, `users-export-${timestamp}.json`);
    fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2));
    console.log(`✅ Users exported: ${users.length} records to ${usersFile}`);
    
    // Export Applications (if exists)
    console.log('📝 Exporting Applications...');
    const applications = await Application.find({}).populate('job');
    const applicationsData = {
      collection: 'Applications',
      count: applications.length,
      exportedAt: new Date().toISOString(),
      data: applications
    };
    
    const applicationsFile = path.join(exportsDir, `applications-export-${timestamp}.json`);
    fs.writeFileSync(applicationsFile, JSON.stringify(applicationsData, null, 2));
    console.log(`✅ Applications exported: ${applications.length} records to ${applicationsFile}`);
    
    // Export Companies (if exists)
    console.log('🏢 Exporting Companies...');
    const companies = await Company.find({});
    const companiesData = {
      collection: 'Companies',
      count: companies.length,
      exportedAt: new Date().toISOString(),
      data: companies
    };
    
    const companiesFile = path.join(exportsDir, `companies-export-${timestamp}.json`);
    fs.writeFileSync(companiesFile, JSON.stringify(companiesData, null, 2));
    console.log(`✅ Companies exported: ${companies.length} records to ${companiesFile}`);
    
    // Export Leads (if exists)
    console.log('🎯 Exporting Leads...');
    const leads = await Lead.find({});
    const leadsData = {
      collection: 'Leads',
      count: leads.length,
      exportedAt: new Date().toISOString(),
      data: leads
    };
    
    const leadsFile = path.join(exportsDir, `leads-export-${timestamp}.json`);
    fs.writeFileSync(leadsFile, JSON.stringify(leadsData, null, 2));
    console.log(`✅ Leads exported: ${leads.length} records to ${leadsFile}`);
    
    // Create summary file
    const summary = {
      database: 'Anoud',
      exportDate: new Date().toISOString(),
      collections: {
        Jobs: jobs.length,
        Users: users.length,
        Applications: applications.length,
        Companies: companies.length,
        Leads: leads.length
      },
      files: {
        jobs: jobsFile,
        users: usersFile,
        applications: applicationsFile,
        companies: companiesFile,
        leads: leadsFile
      }
    };
    
    const summaryFile = path.join(exportsDir, `export-summary-${timestamp}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log('\n📊 Export Summary:');
    console.log('==================');
    console.log(`📋 Jobs: ${jobs.length} records`);
    console.log(`👥 Users: ${users.length} records`);
    console.log(`📝 Applications: ${applications.length} records`);
    console.log(`🏢 Companies: ${companies.length} records`);
    console.log(`🎯 Leads: ${leads.length} records`);
    console.log(`\n📁 All files saved to: ${exportsDir}`);
    console.log(`📄 Summary file: ${summaryFile}`);
    
    // Create a backup archive
    const archiver = require('archiver');
    const output = fs.createWriteStream(path.join(__dirname, `mongodb-backup-${timestamp}.zip`));
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log(`\n📦 Backup archive created: mongodb-backup-${timestamp}.zip (${archive.pointer()} bytes)`);
    });
    
    archive.pipe(output);
    archive.directory(exportsDir, false);
    await archive.finalize();
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the export
exportData();
