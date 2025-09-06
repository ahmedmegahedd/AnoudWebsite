const fs = require("fs");
const express = require("express");
const https = require("https");
const WebSocket = require("ws");
const path = require("path");
const bcrypt = require('bcryptjs');
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const cors = require('cors');

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3234;

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = isProduction 
      ? [
          'https://www.anoudjob.com', 
          'https://anoudjob.com',
          'http://www.anoudjob.com',  // Allow HTTP for development/testing
          'http://anoudjob.com'
        ]
      : [
          'http://localhost:3000', 
          'http://localhost:3001', 
          'http://127.0.0.1:3000', 
          'http://127.0.0.1:3001',
          'http://localhost:3234',  // Add backend port for direct testing
          'http://127.0.0.1:3234'
        ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked request from: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// HTTPS redirect middleware (production only)
if (isProduction) {
  app.use((req, res, next) => {
    // Check if request is HTTP and redirect to HTTPS (preserve original domain)
    if (req.headers['x-forwarded-proto'] !== 'https' && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    
    next();
  });
}

// Middleware
app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Anoud Job API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// API routes
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/cv-upload', require('./routes/cvUpload'));

// Serve static files from frontend build (production only)
if (isProduction) {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle all other routes by serving the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

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
    
    // Seed admin users after successful connection
    await seedAdmin();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.stack || err);
  
  // Don't leak error details in production
  const errorMessage = isProduction ? 'Internal Server Error' : err.message;
  
  res.status(err.status || 500).json({
    error: errorMessage,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

// Create HTTP server
const server = require("http").createServer(app);

// WebSocket setup (optional for production)
if (!isProduction) {
  const wss = new WebSocket.Server({ server });
  
  wss.on("connection", (ws) => {
    console.log("🔌 Client connected (WebSocket)");
    ws.send("👋 Hello from WebSocket server");

    ws.on("message", (message) => {
      console.log("📩 Received:", message.toString());
      ws.send(`You said: ${message}`);
    });

    ws.on("close", () => {
      console.log("❌ Client disconnected");
    });
  });
}

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      
      if (isProduction) {
        console.log('🔒 Production mode enabled');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start the server
startServer();

module.exports = app;