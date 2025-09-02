const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const archiver = require('archiver');
const fs = require('fs');
const { Parser } = require('json2csv');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { body, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const { extractCVText, cleanCVText } = require('../utils/cvParser');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Simple health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Applications route is working' });
});

// Get applicant count for all jobs (admin only)
router.get('/counts', adminAuth, async (req, res) => {
  try {
    const counts = await Application.aggregate([
      {
        $group: {
          _id: '$job',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Convert to object with job ID as key and count as value
    const countsMap = counts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});
    
    res.json(countsMap);
  } catch (err) {
    console.error('Error fetching application counts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test route without multer
router.post('/test', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('education').notEmpty().withMessage('Educational level is required'),
  body('selfIntro').notEmpty().isLength({ min: 30 }).withMessage('Self introduction must be at least 30 characters'),
  body('jobId').notEmpty().withMessage('Job ID is required'),
], async (req, res) => {
  console.log('=== TEST ROUTE DEBUG ===');
  console.log('Request body:', req.body);
  console.log('JobId from request:', req.body.jobId);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const application = new Application({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      education: req.body.education,
      selfIntro: req.body.selfIntro,
      resume: null,
      cvText: null, // Add cvText field for test
      job: new mongoose.Types.ObjectId(req.body.jobId),
      appliedAt: new Date(),
    });
    console.log('Saving test application with job ID:', req.body.jobId);
    await application.save();
    res.status(201).json({ message: 'Test application submitted' });
  } catch (err) {
    console.error('Error saving test application:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit application
router.post('/', upload.single('resume'), [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('education').notEmpty().withMessage('Educational level is required'),
  body('selfIntro').notEmpty().isLength({ min: 30 }).withMessage('Self introduction must be at least 30 characters'),
  body('jobId').notEmpty().withMessage('Job ID is required'),
], async (req, res) => {
  console.log('=== APPLICATION SUBMISSION DEBUG ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  console.log('Request file:', req.file);
  console.log('JobId from request:', req.body.jobId);
  console.log('JobId type:', typeof req.body.jobId);
  console.log('JobId length:', req.body.jobId ? req.body.jobId.length : 'undefined');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Validate that the job exists
    const job = await Job.findById(req.body.jobId);
    if (!job) {
      console.log('Job not found for ID:', req.body.jobId);
      return res.status(400).json({ error: 'Job not found' });
    }
    console.log('Job found:', job.title);
    
    // Extract CV text if resume is uploaded (make it optional to prevent submission failures)
    let cvText = null;
    if (req.file) {
      try {
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        console.log('Attempting to extract CV text from:', filePath);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.log('CV file not found at path:', filePath);
        } else {
          const extractedText = await extractCVText(filePath);
          if (extractedText) {
            cvText = cleanCVText(extractedText);
            console.log('CV text extracted successfully, length:', cvText.length);
          } else {
            console.log('Failed to extract CV text - extractedText is null/empty');
          }
        }
      } catch (cvError) {
        console.error('Error during CV text extraction:', cvError);
        // Don't fail the application submission if CV extraction fails
        console.log('Continuing with application submission without CV text extraction');
      }
    }
    
    // Create application object
    const applicationData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      education: req.body.education,
      selfIntro: req.body.selfIntro,
      resume: req.file ? req.file.filename : null,
      cvText: cvText, // Store extracted CV text (null if extraction failed)
      job: new mongoose.Types.ObjectId(req.body.jobId), // Explicitly convert to ObjectId
      appliedAt: new Date(),
    };
    
    console.log('Application data to save:', applicationData);
    
    const application = new Application(applicationData);
    console.log('Saving application with job ID:', req.body.jobId);
    console.log('Application object before save:', application);
    
    // Validate the application object
    const validationError = application.validateSync();
    if (validationError) {
      console.error('Application validation error:', validationError);
      return res.status(400).json({ error: 'Application validation failed', details: validationError.message });
    }
    
    await application.save();
    console.log('Application saved successfully');
    res.status(201).json({ message: 'Application submitted' });
  } catch (err) {
    console.error('Error saving application:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    
    // Provide more specific error messages
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: err.message });
    } else if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid data format', details: err.message });
    } else {
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
});

// Get applications by job ID with ATS features (admin only)
router.get('/job/:jobId', adminAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { search, status, sortBy = 'appliedAt', sortOrder = 'desc', flagged, starred } = req.query;
    
    // Validate jobId format
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    let query = { job: jobId };

    // Enhanced search functionality including CV text
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { education: searchRegex },
        { selfIntro: searchRegex },
        { cvText: searchRegex } // Include CV text in search
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Flagged filter
    if (flagged === 'true') {
      query.isFlagged = true;
    }

    // Starred filter
    if (starred === 'true') {
      query.isStarred = true;
    }

    // Sort options
    let sortOptions = {};
    if (sortBy === 'name') {
      sortOptions.name = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'status') {
      sortOptions.status = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.appliedAt = sortOrder === 'desc' ? -1 : 1;
    }

    const applications = await Application.find(query)
      .populate('job', 'title company')
      .sort(sortOptions);

    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update application status (admin only)
router.patch('/:id/status', adminAuth, [
  body('status').isIn(['New', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired']).withMessage('Valid status is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('job', 'title company');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Status updated successfully', application });
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle application flag (admin only)
router.patch('/:id/flag', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.isFlagged = !application.isFlagged;
    await application.save();

    res.json({ 
      message: `Application ${application.isFlagged ? 'flagged' : 'unflagged'} successfully`,
      isFlagged: application.isFlagged 
    });
  } catch (err) {
    console.error('Error toggling application flag:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle application star (admin only)
router.patch('/:id/star', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.isStarred = !application.isStarred;
    await application.save();

    res.json({ 
      message: `Application ${application.isStarred ? 'starred' : 'unstarred'} successfully`,
      isStarred: application.isStarred 
    });
  } catch (err) {
    console.error('Error toggling application star:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update application notes (admin only)
router.patch('/:id/notes', adminAuth, [
  body('notes').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { notes } = req.body;

    const application = await Application.findByIdAndUpdate(
      id,
      { notes },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Notes updated successfully', application });
  } catch (err) {
    console.error('Error updating application notes:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk download CVs (admin only)
router.post('/download-cvs', adminAuth, [
  body('applicantIds').isArray().withMessage('Applicant IDs must be an array'),
  body('applicantIds.*').isMongoId().withMessage('Invalid applicant ID format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { applicantIds } = req.body;

    if (!applicantIds || applicantIds.length === 0) {
      return res.status(400).json({ error: 'No applicant IDs provided' });
    }

    // Fetch applications with resume files
    const applications = await Application.find({
      _id: { $in: applicantIds },
      resume: { $exists: true, $ne: null }
    }).select('name email resume');

    if (applications.length === 0) {
      return res.status(404).json({ error: 'No applications with CVs found' });
    }

    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Set response headers
    res.attachment('Selected_CVs.zip');
    res.setHeader('Content-Type', 'application/zip');

    // Pipe archive to response
    archive.pipe(res);

    // Add files to archive
    for (const application of applications) {
      if (application.resume) {
        const filePath = path.join(__dirname, '../uploads', application.resume);
        
        // Check if file exists
        if (fs.existsSync(filePath)) {
          // Create a safe filename
          const safeName = application.name.replace(/[^a-zA-Z0-9]/g, '_');
          const fileExtension = path.extname(application.resume);
          const archiveFileName = `${safeName}_${application.email}${fileExtension}`;
          
          archive.file(filePath, { name: archiveFileName });
        }
      }
    }

    // Finalize the archive
    await archive.finalize();

  } catch (err) {
    console.error('Error creating CV archive:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Utility route to extract CV text from existing applications (admin only)
router.post('/extract-cv-text', adminAuth, async (req, res) => {
  try {
    const { applicationId } = req.body;
    
    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (!application.resume) {
      return res.status(400).json({ error: 'No resume file found for this application' });
    }

    // Extract CV text
    const filePath = path.join(__dirname, '../uploads', application.resume);
    const extractedText = await extractCVText(filePath);
    
    if (extractedText) {
      const cleanedText = cleanCVText(extractedText);
      application.cvText = cleanedText;
      await application.save();
      
      res.json({ 
        message: 'CV text extracted successfully',
        textLength: cleanedText.length
      });
    } else {
      res.status(400).json({ error: 'Failed to extract text from CV' });
    }
  } catch (err) {
    console.error('Error extracting CV text:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk extract CV text from all applications without cvText (admin only)
router.post('/extract-all-cv-text', adminAuth, async (req, res) => {
  try {
    // Find all applications with resume but without cvText
    const applications = await Application.find({
      resume: { $exists: true, $ne: null },
      cvText: { $exists: false }
    });

    let successCount = 0;
    let errorCount = 0;

    for (const application of applications) {
      try {
        const filePath = path.join(__dirname, '../uploads', application.resume);
        const extractedText = await extractCVText(filePath);
        
        if (extractedText) {
          const cleanedText = cleanCVText(extractedText);
          application.cvText = cleanedText;
          await application.save();
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        console.error(`Error extracting CV text for application ${application._id}:`, err);
        errorCount++;
      }
    }

    res.json({ 
      message: 'CV text extraction completed',
      totalProcessed: applications.length,
      successCount,
      errorCount
    });
  } catch (err) {
    console.error('Error in bulk CV text extraction:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export applicants data as CSV (admin only)
router.post('/export-data', adminAuth, [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('search').optional(),
  body('status').optional(),
  body('flagged').optional(),
  body('starred').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, search, status, flagged, starred } = req.body;
    
    // Validate jobId format
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    // Build query based on filters
    let query = { job: jobId };

    // Enhanced search functionality including CV text
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { education: searchRegex },
        { selfIntro: searchRegex },
        { cvText: searchRegex }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Flagged filter
    if (flagged === 'true') {
      query.isFlagged = true;
    }

    // Starred filter
    if (starred === 'true') {
      query.isStarred = true;
    }

    // Fetch applications with job details
    const applications = await Application.find(query)
      .populate('job', 'title company')
      .sort({ appliedAt: -1 });

    if (applications.length === 0) {
      return res.status(404).json({ error: 'No applications found for export' });
    }

    // Transform data for CSV export
    const csvData = applications.map(app => ({
      'Name': app.name,
      'Email': app.email,
      'Phone': app.phone,
      'Education': app.education,
      'Job Title': app.job?.title || 'N/A',
      'Company': app.job?.company?.name || 'N/A',
      'Status': app.status,
      'Flagged': app.isFlagged ? 'Yes' : 'No',
      'Starred': app.isStarred ? 'Yes' : 'No',
      'Date Applied': new Date(app.appliedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Notes': app.notes || '',
      'Self Introduction': app.selfIntro
    }));

    // Configure CSV parser
    const fields = [
      'Name',
      'Email', 
      'Phone',
      'Education',
      'Job Title',
      'Company',
      'Status',
      'Flagged',
      'Starred',
      'Date Applied',
      'Notes',
      'Self Introduction'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `applicants_export_${timestamp}.csv`;

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csv);

  } catch (err) {
    console.error('Error exporting applicants data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 