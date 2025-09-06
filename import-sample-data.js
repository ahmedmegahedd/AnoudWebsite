#!/usr/bin/env node

/**
 * Sample Data Import Script
 * Imports sample data into your local Anoud database
 */

const mongoose = require('mongoose');
const bcrypt = require('./backend/node_modules/bcryptjs');

// Connect to local MongoDB
const MONGO_URI = 'mongodb://localhost:27017/Anoud';

// Define schemas
const JobSchema = new mongoose.Schema({
  title: String,
  title_ar: String,
  description: String,
  description_ar: String,
  requirements: String,
  requirements_ar: String,
  location: String,
  location_ar: String,
  salary: String,
  salary_ar: String,
  type: String,
  type_ar: String,
  experience: String,
  experience_ar: String,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  postedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const CompanySchema = new mongoose.Schema({
  name: String,
  name_ar: String,
  description: String,
  description_ar: String,
  website: String,
  logo: String,
  industry: String,
  industry_ar: String,
  size: String,
  size_ar: String,
  location: String,
  location_ar: String,
  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', JobSchema);
const User = mongoose.model('User', UserSchema);
const Company = mongoose.model('Company', CompanySchema);

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

// Sample data
const sampleCompanies = [
  {
    name: 'Anoud Recruitment',
    name_ar: 'العنود للتوظيف',
    description: 'Leading recruitment agency in Egypt and the Gulf region',
    description_ar: 'وكالة توظيف رائدة في مصر ومنطقة الخليج',
    website: 'https://anoudjob.com',
    industry: 'Human Resources',
    industry_ar: 'الموارد البشرية',
    size: '50-100 employees',
    size_ar: '50-100 موظف',
    location: 'Cairo, Egypt',
    location_ar: 'القاهرة، مصر'
  },
  {
    name: 'Tech Solutions Inc',
    name_ar: 'حلول التقنية',
    description: 'Innovative technology solutions provider',
    description_ar: 'مزود حلول تقنية مبتكرة',
    website: 'https://techsolutions.com',
    industry: 'Technology',
    industry_ar: 'التكنولوجيا',
    size: '100-500 employees',
    size_ar: '100-500 موظف',
    location: 'Dubai, UAE',
    location_ar: 'دبي، الإمارات'
  }
];

const sampleJobs = [
  {
    title: 'Senior Software Engineer',
    title_ar: 'مهندس برمجيات أول',
    description: 'We are looking for an experienced software engineer to join our development team.',
    description_ar: 'نبحث عن مهندس برمجيات ذو خبرة للانضمام إلى فريق التطوير لدينا.',
    requirements: 'Bachelor\'s degree in Computer Science, 5+ years experience, Node.js, React',
    requirements_ar: 'بكالوريوس في علوم الحاسوب، خبرة 5+ سنوات، Node.js، React',
    location: 'Cairo, Egypt',
    location_ar: 'القاهرة، مصر',
    salary: '15,000 - 25,000 EGP',
    salary_ar: '15,000 - 25,000 جنيه',
    type: 'Full-time',
    type_ar: 'دوام كامل',
    experience: '5+ years',
    experience_ar: '5+ سنوات',
    isActive: true,
    isFeatured: true
  },
  {
    title: 'Marketing Manager',
    title_ar: 'مدير التسويق',
    description: 'Lead our marketing efforts and drive brand awareness.',
    description_ar: 'قيادة جهود التسويق وزيادة الوعي بالعلامة التجارية.',
    requirements: 'Bachelor\'s degree in Marketing, 3+ years experience, Digital marketing',
    requirements_ar: 'بكالوريوس في التسويق، خبرة 3+ سنوات، التسويق الرقمي',
    location: 'Dubai, UAE',
    location_ar: 'دبي، الإمارات',
    salary: '20,000 - 30,000 AED',
    salary_ar: '20,000 - 30,000 درهم',
    type: 'Full-time',
    type_ar: 'دوام كامل',
    experience: '3+ years',
    experience_ar: '3+ سنوات',
    isActive: true,
    isFeatured: false
  },
  {
    title: 'Data Analyst',
    title_ar: 'محلل بيانات',
    description: 'Analyze data to provide insights and support business decisions.',
    description_ar: 'تحليل البيانات لتقديم رؤى ودعم القرارات التجارية.',
    requirements: 'Bachelor\'s degree in Statistics/Mathematics, 2+ years experience, Python, SQL',
    requirements_ar: 'بكالوريوس في الإحصاء/الرياضيات، خبرة 2+ سنوات، Python، SQL',
    location: 'Riyadh, Saudi Arabia',
    location_ar: 'الرياض، المملكة العربية السعودية',
    salary: '12,000 - 18,000 SAR',
    salary_ar: '12,000 - 18,000 ريال',
    type: 'Full-time',
    type_ar: 'دوام كامل',
    experience: '2+ years',
    experience_ar: '2+ سنوات',
    isActive: true,
    isFeatured: false
  }
];

const sampleUsers = [
  {
    name: 'Ahmed Megahed',
    email: 'ahmedmegahedbis@gmail.com',
    phone: '1234567890',
    role: 'admin'
  },
  {
    name: 'M. Megahed',
    email: 'm.megahed@anoudjob.com',
    phone: '1234567890',
    role: 'superadmin'
  }
];

// Import function
async function importSampleData() {
  try {
    await connectDB();
    
    console.log('📊 Starting sample data import...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Job.deleteMany({});
    await User.deleteMany({});
    await Company.deleteMany({});
    console.log('✅ Existing data cleared');
    
    // Import Companies
    console.log('🏢 Importing companies...');
    const companies = await Company.insertMany(sampleCompanies);
    console.log(`✅ Imported ${companies.length} companies`);
    
    // Import Users
    console.log('👥 Importing users...');
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        return { ...user, password: hashedPassword };
      })
    );
    const users = await User.insertMany(hashedUsers);
    console.log(`✅ Imported ${users.length} users`);
    
    // Import Jobs
    console.log('📋 Importing jobs...');
    const jobsWithCompanies = sampleJobs.map((job, index) => ({
      ...job,
      company: companies[index % companies.length]._id
    }));
    const jobs = await Job.insertMany(jobsWithCompanies);
    console.log(`✅ Imported ${jobs.length} jobs`);
    
    console.log('\n📊 Import Summary:');
    console.log('==================');
    console.log(`🏢 Companies: ${companies.length}`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`📋 Jobs: ${jobs.length}`);
    
    console.log('\n🔐 Default Login Credentials:');
    console.log('=============================');
    console.log('Admin User:');
    console.log('  Email: ahmedmegahedbis@gmail.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Super Admin User:');
    console.log('  Email: m.megahed@anoudjob.com');
    console.log('  Password: password123');
    
    console.log('\n✅ Sample data import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the import
importSampleData();
