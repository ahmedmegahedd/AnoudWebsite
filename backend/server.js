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
          'http://anoudjob.com',
          'https://anoudjob.com:443',  // Add explicit port
          'http://anoudjob.com:80'     // Add explicit port
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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'} - User-Agent: ${req.headers['user-agent'] || 'none'}`);
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

// Multer error handler middleware
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
app.use('/api/media', require('./routes/media'));

// Serve uploaded media files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from frontend build (production only)
if (isProduction) {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle all other routes by serving the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Admin users are now managed manually through database
// See user-seeds.json for initial admin and superadmin users

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is required');
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 10000
      },
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// 404 handler (only for API routes, not for static files)
app.use('/api/*', (req, res) => {
  console.log(`🚫 404 - API route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'API route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
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