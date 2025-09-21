const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// CORS configuration - automatically handles different environments
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://www.anoudjob.com',
      'https://anoudjob.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Seed admin users function
const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    
    // Check if first admin already exists
    const existingAdmin = await User.findOne({ email: 'ahmedmegahedbis@gmail.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
    } else {
      // Hash password for first admin
      const salt1 = await bcrypt.genSalt(10);
      const hashedPassword1 = await bcrypt.hash('testt1', salt1);
      
      // Create first admin user
      const adminUser = new User({
        name: 'Ahmed Megahed',
        email: 'ahmedmegahedbis@gmail.com',
        phone: '1234567890',
        password: hashedPassword1,
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully:', adminUser.email);
    }
    
    // Check if second superadmin already exists
    const existingSuperAdmin = await User.findOne({ email: 'm.megahed@anoudjob.com' });
    
    if (existingSuperAdmin) {
      console.log('✅ Super Admin user already exists:', existingSuperAdmin.email);
    } else {
      // Hash password for superadmin
      const salt2 = await bcrypt.genSalt(10);
      const hashedPassword2 = await bcrypt.hash('moh123', salt2);
      
      // Create superadmin user
      const superAdminUser = new User({
        name: 'M. Megahed',
        email: 'm.megahed@anoudjob.com',
        phone: '1234567890',
        password: hashedPassword2,
        role: 'superadmin'
      });
      
      await superAdminUser.save();
      console.log('✅ Super Admin user created successfully:', superAdminUser.email);
    }
  } catch (error) {
    console.error('❌ Error seeding admin users:', error.message);
  }
};

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB connected');
  // Seed admin user after database connection
  await seedAdmin();
}).catch(err => console.error(err));
 
// Routes
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/cv-upload', require('./routes/cvUpload'));

// Health check
app.get('/', (req, res) => res.send('API running'));

module.exports = app;
