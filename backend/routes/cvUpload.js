const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CVParser = require('../utils/cvParser');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

// Configure multer for ZIP file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/cv-uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-batch-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only allow ZIP files
    if (file.mimetype === 'application/zip' || 
        file.mimetype === 'application/x-zip-compressed' ||
        path.extname(file.originalname).toLowerCase() === '.zip') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// POST /api/cv-upload/process-zip - Process ZIP file containing CVs
router.post('/process-zip', adminAuth, upload.single('cvZip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ZIP file is required' });
    }

    console.log('Processing CV ZIP file:', req.file.originalname);

    // Initialize CV parser
    const cvParser = new CVParser();

    // Process the ZIP archive
    const result = await cvParser.processZipArchive(req.file.path);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error('Error cleaning up uploaded file:', cleanupError);
    }

    res.json({
      success: true,
      message: `Successfully processed ${result.processedFiles} out of ${result.totalFiles} CV files`,
      totalFiles: result.totalFiles,
      processedFiles: result.processedFiles,
      results: result.results
    });

  } catch (error) {
    console.error('Error processing CV ZIP:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded file:', cleanupError);
      }
    }

    res.status(500).json({ 
      error: 'Failed to process CV files',
      details: error.message 
    });
  }
});

// POST /api/cv-upload/create-users - Create user accounts from parsed CV data
router.post('/create-users', adminAuth, async (req, res) => {
  try {
    const { cvData } = req.body;

    if (!cvData || !Array.isArray(cvData)) {
      return res.status(400).json({ error: 'CV data array is required' });
    }

    const results = [];
    const errors = [];

    for (const cv of cvData) {
      try {
        // Skip if no email (required for user account)
        if (!cv.email) {
          errors.push({
            fileName: cv.fileName,
            error: 'Email is required to create user account'
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: cv.email.toLowerCase() });
        if (existingUser) {
          errors.push({
            fileName: cv.fileName,
            error: 'User with this email already exists'
          });
          continue;
        }

        // Create user account
        const userData = {
          name: cv.fullName || 'Unknown',
          email: cv.email.toLowerCase(),
          phone: cv.phone || '',
          role: 'user',
          // Generate a random password (user can reset it later)
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
          // Store additional CV information
          cvInfo: {
            currentJobTitle: cv.currentJobTitle,
            yearsOfExperience: cv.yearsOfExperience,
            skills: cv.skills || [],
            education: cv.education,
            location: cv.location,
            summary: cv.summary,
            parsedFrom: cv.fileName,
            parsedAt: cv.parsedAt
          }
        };

        const newUser = new User(userData);
        await newUser.save();

        results.push({
          success: true,
          fileName: cv.fileName,
          userId: newUser._id,
          email: newUser.email,
          name: newUser.name
        });

      } catch (error) {
        console.error('Error creating user from CV:', error);
        errors.push({
          fileName: cv.fileName,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully created ${results.length} user accounts`,
      created: results.length,
      errors: errors.length,
      results: results,
      errorDetails: errors
    });

  } catch (error) {
    console.error('Error creating users from CV data:', error);
    res.status(500).json({ 
      error: 'Failed to create user accounts',
      details: error.message 
    });
  }
});

// GET /api/cv-upload/supported-formats - Get supported file formats
router.get('/supported-formats', (req, res) => {
  res.json({
    supportedFormats: {
      archive: ['ZIP'],
      documents: ['PDF', 'DOCX', 'DOC'],
      maxFileSize: '50MB',
      maxFilesPerArchive: 'Unlimited'
    }
  });
});

module.exports = router; 