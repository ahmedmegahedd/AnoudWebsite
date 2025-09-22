// XAMPP-Compatible Server Configuration for Anoud Job Website
// This is a modified version of server.js optimized for XAMPP deployment

const fs = require("fs");
const express = require("express");
const https = require("https");
const WebSocket = require("ws");
const path = require("path");
const bcrypt = require('bcryptjs');
const multer = require('multer');
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const cors = require('cors');

// XAMPP Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const isXAMPP = process.env.DEPLOYMENT_ENV === 'xampp';
const PORT = process.env.PORT || 3234;
const HOST = process.env.HOST || 'localhost';

// XAMPP-specific paths
const XAMPP_PATH = process.env.XAMPP_PATH || 'C:/xampp';
const LOG_DIR = path.join(__dirname, process.env.LOG_DIR || 'logs');
const UPLOAD_DIR = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');

// Create necessary directories
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// XAMPP-optimized CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost',
            'http://localhost:3000',
            'http://anoudjob.local',
            'https://anoudjob.local',
            'http://127.0.0.1',
            'http://127.0.0.1:3000'
        ];
        
        // Add custom origins from environment
        if (process.env.CORS_ORIGINS) {
            const customOrigins = process.env.CORS_ORIGINS.split(',');
            allowedOrigins.push(...customOrigins);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// XAMPP-optimized middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// XAMPP-specific logging
const morgan = require('morgan');
const accessLogStream = fs.createWriteStream(path.join(LOG_DIR, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// XAMPP security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (isProduction) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// XAMPP static files configuration
app.use('/uploads', express.static(UPLOAD_DIR));

// XAMPP health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        deployment: 'xampp',
        port: PORT,
        host: HOST,
        xampp_path: XAMPP_PATH
    });
});

// XAMPP root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Anoud Job API is running on XAMPP',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        deployment: 'xampp',
        port: PORT,
        host: HOST,
        version: '1.0.0'
    });
});

// Multer error handler middleware (XAMPP-optimized)
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: error.message });
    }
    
    if (error.message === 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.') {
        return res.status(400).json({ error: error.message });
    }
    
    // Log error for XAMPP debugging
    const errorLog = fs.createWriteStream(path.join(LOG_DIR, 'error.log'), { flags: 'a' });
    errorLog.write(`${new Date().toISOString()} - ${error.message}\n`);
    errorLog.write(`${error.stack}\n\n`);
    
    next(error);
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

// 404 handler for API routes (before static file serving)
app.use('/api/*', (req, res) => {
    console.log(`🚫 404 - API route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'API route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        deployment: 'xampp'
    });
});

// XAMPP static file serving (for development/testing)
if (!isProduction || isXAMPP) {
    const frontendPath = process.env.FRONTEND_BUILD_PATH || path.join(__dirname, '../frontend/build');
    
    if (fs.existsSync(frontendPath)) {
        // Serve static files from frontend build
        app.use(express.static(frontendPath));
        
        // Handle all other routes by serving the React app
        app.get('*', (req, res) => {
            res.sendFile(path.join(frontendPath, 'index.html'));
        });
    } else {
        // Fallback for when frontend build doesn't exist
        app.get('*', (req, res) => {
            res.status(404).json({
                error: 'Frontend not found',
                message: 'Please build the frontend and place it in the correct directory',
                expected_path: frontendPath,
                deployment: 'xampp'
            });
        });
    }
}

// XAMPP admin user seeding
const seedAdminUsers = async () => {
    try {
    const User = require('./models/User');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'ahmedmegahedbis@gmail.com' });
    
    if (existingAdmin) {
        console.log('✅ Admin user already exists:', existingAdmin.email);
    } else {
        // Hash password for admin
        const salt1 = await bcrypt.genSalt(10);
        const hashedPassword1 = await bcrypt.hash('ahmed123', salt1);
        
        // Create admin user
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

// XAMPP MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is required');
    }
    
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 Connection string:', process.env.MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 10000
      }
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Seed admin users after successful connection
    await seedAdminUsers();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// XAMPP WebSocket server (optional)
let wss = null;
if (process.env.WEBSOCKET_ENABLED === 'true') {
  const server = require('http').createServer(app);
  wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws) => {
    console.log('🔌 New WebSocket connection');
    ws.send("👋 Hello from XAMPP WebSocket server");

    ws.on('message', (message) => {
      console.log("📩 Received:", message.toString());
      ws.send(`You said: ${message}`);
    });

    ws.on('close', () => {
      console.log('❌ WebSocket client disconnected');
    });
  });
  
  // Start server with WebSocket
  const startServer = async () => {
    try {
      await connectDB();
      
      server.listen(PORT, HOST, () => {
        console.log(`🚀 XAMPP Server running on http://${HOST}:${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
        console.log(`🔌 WebSocket: ws://${HOST}:${process.env.WEBSOCKET_PORT || 3235}`);
        console.log(`📁 XAMPP Path: ${XAMPP_PATH}`);
        console.log(`📝 Logs: ${LOG_DIR}`);
        console.log(`📁 Uploads: ${UPLOAD_DIR}`);
        
        if (isProduction) {
          console.log('🔒 Production mode enabled');
        }
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  };
  
  startServer();
} else {
  // Start server without WebSocket
  const startServer = async () => {
    try {
      await connectDB();
      
      app.listen(PORT, HOST, () => {
        console.log(`🚀 XAMPP Server running on http://${HOST}:${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
        console.log(`📁 XAMPP Path: ${XAMPP_PATH}`);
        console.log(`📝 Logs: ${LOG_DIR}`);
        console.log(`📁 Uploads: ${UPLOAD_DIR}`);
        
        if (isProduction) {
          console.log('🔒 Production mode enabled');
        }
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  };
  
  startServer();
}

// XAMPP graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  if (wss) {
    wss.close(() => {
      console.log('✅ WebSocket server closed');
    });
  }
  mongoose.connection.close(false, () => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  if (wss) {
    wss.close(() => {
      console.log('✅ WebSocket server closed');
    });
  }
  mongoose.connection.close(false, () => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

// XAMPP error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  const errorLog = fs.createWriteStream(path.join(LOG_DIR, 'error.log'), { flags: 'a' });
  errorLog.write(`${new Date().toISOString()} - Uncaught Exception: ${error.message}\n`);
  errorLog.write(`${error.stack}\n\n`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  const errorLog = fs.createWriteStream(path.join(LOG_DIR, 'error.log'), { flags: 'a' });
  errorLog.write(`${new Date().toISOString()} - Unhandled Rejection: ${reason}\n`);
  errorLog.write(`${promise}\n\n`);
});

module.exports = app;
