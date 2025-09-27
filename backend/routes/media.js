const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');
const { body, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/media');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Allow video formats
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      req.fileValidationError = 'Invalid file type. Only video files are allowed.';
      cb(null, false);
    }
  }
});

// GET all media (public access)
router.get('/', async (req, res) => {
  try {
    const media = await Media.find({ isActive: true })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });
    res.json(media);
  } catch (err) {
    console.error("❌ Error in /api/media:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET featured media (public access)
router.get('/featured', async (req, res) => {
  try {
    const featuredMedia = await Media.find({ isActive: true, featured: true })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 })
      .limit(6);
    res.json(featuredMedia);
  } catch (err) {
    console.error("❌ Error in /api/media/featured:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET media by ID (public access)
router.get('/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('uploadedBy', 'name email');
    
    if (!media || !media.isActive) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    res.json(media);
  } catch (err) {
    console.error("❌ Error in /api/media/:id:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create media (admin only)
router.post('/', adminAuth, upload.single('mediaFile'), [
  body('title_en').notEmpty().withMessage('Title (English) is required'),
  body('title_ar').notEmpty().withMessage('Title (Arabic) is required'),
  body('description_en').notEmpty().withMessage('Description (English) is required'),
  body('description_ar').notEmpty().withMessage('Description (Arabic) is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Media file is required' });
  }

  try {
    const mediaData = {
      title_en: req.body.title_en,
      title_ar: req.body.title_ar,
      description_en: req.body.description_en,
      description_ar: req.body.description_ar,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      featured: req.body.featured === 'true',
      uploadedBy: req.user._id
    };

    const media = new Media(mediaData);
    await media.save();
    
    // Populate the uploadedBy field for response
    await media.populate('uploadedBy', 'name email');
    
    res.status(201).json(media);
  } catch (err) {
    console.error('Error creating media:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update media (admin only)
router.put('/:id', adminAuth, [
  body('title_en').notEmpty().withMessage('Title (English) is required'),
  body('title_ar').notEmpty().withMessage('Title (Arabic) is required'),
  body('description_en').notEmpty().withMessage('Description (English) is required'),
  body('description_ar').notEmpty().withMessage('Description (Arabic) is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    media.title_en = req.body.title_en;
    media.title_ar = req.body.title_ar;
    media.description_en = req.body.description_en;
    media.description_ar = req.body.description_ar;
    media.featured = req.body.featured === 'true';
    media.isActive = req.body.isActive !== 'false';

    await media.save();
    await media.populate('uploadedBy', 'name email');
    
    res.json(media);
  } catch (err) {
    console.error('Error updating media:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE media (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Delete the file from filesystem
    const filePath = path.join(__dirname, '../uploads/media', media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'Media deleted successfully' });
  } catch (err) {
    console.error('Error deleting media:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all media for admin (admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const media = await Media.find()
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });
    res.json(media);
  } catch (err) {
    console.error("❌ Error in /api/media/admin/all:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
