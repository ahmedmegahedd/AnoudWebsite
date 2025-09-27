const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Company = require('../models/Company');
const { body, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');

// GET all jobs with company data (only active jobs for public)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate('company', 'name_en name_ar location_en location_ar industry_en industry_ar')
      .sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("❌ Error in /api/jobs:", err);
    next(err); // send to global error handler
  }
});

// GET featured jobs for home page (max 6, only active)
router.get('/featured', async (req, res) => {
  try {
    const featuredJobs = await Job.find({ featured: true, isActive: true })
      .populate('company', 'name_en name_ar location_en location_ar industry_en industry_ar')
      .sort({ postedAt: -1 })
      .limit(6);
    res.json(featuredJobs);
  } catch (err) {
    console.error("❌ Error in /api/jobs/featured:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET jobs by company (only active)
router.get('/company/:companyId', async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.params.companyId, isActive: true })
      .populate('company', 'name_en name_ar location_en location_ar industry_en industry_ar')
      .sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("❌ Error in /company:", err);
    next(err); // send to global error handler
  }
});

// GET job by id with company data
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', 'name_en name_ar location_en location_ar industry_en industry_ar');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error("❌ Error in /api/jobs:", err);
    next(err); // send to global error handler
  }
});

// POST create job (admin only)
router.post('/', adminAuth, [
  body('title_en').notEmpty().withMessage('Job title (English) is required'),
  body('title_ar').notEmpty().withMessage('Job title (Arabic) is required'),
  body('company').notEmpty().withMessage('Company ID is required'),
  body('location_en').notEmpty().withMessage('Location (English) is required'),
  body('location_ar').notEmpty().withMessage('Location (Arabic) is required'),
  body('type').isIn(['Full-Time', 'Part-Time', 'Remote', 'Contract']).withMessage('Valid job type is required'),
  body('salary_en').notEmpty().withMessage('Salary range (English) is required'),
  body('salary_ar').notEmpty().withMessage('Salary range (Arabic) is required'),
  body('experience_en').notEmpty().withMessage('Experience requirement (English) is required'),
  body('experience_ar').notEmpty().withMessage('Experience requirement (Arabic) is required'),
  body('description_en').notEmpty().withMessage('Job description (English) is required'),
  body('description_ar').notEmpty().withMessage('Job description (Arabic) is required'),
  body('industry_en').notEmpty().withMessage('Industry (English) is required'),
  body('industry_ar').notEmpty().withMessage('Industry (Arabic) is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Verify company exists
    const company = await Company.findById(req.body.company);
    if (!company) {
      return res.status(400).json({ error: 'Company not found' });
    }

    const job = new Job({ ...req.body, postedAt: new Date() });
    await job.save();
    
    const populatedJob = await Job.findById(job._id).populate('company', 'name_en name_ar location_en location_ar industry_en industry_ar');
    res.status(201).json({
      message: 'Job created successfully',
      job: populatedJob
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update job (admin only)
router.put('/:id', adminAuth, [
  body('title_en').notEmpty().withMessage('Job title (English) is required'),
  body('title_ar').notEmpty().withMessage('Job title (Arabic) is required'),
  body('company').notEmpty().withMessage('Company ID is required'),
  body('location_en').notEmpty().withMessage('Location (English) is required'),
  body('location_ar').notEmpty().withMessage('Location (Arabic) is required'),
  body('type').isIn(['Full-Time', 'Part-Time', 'Remote', 'Contract']).withMessage('Valid job type is required'),
  body('salary_en').notEmpty().withMessage('Salary range (English) is required'),
  body('salary_ar').notEmpty().withMessage('Salary range (Arabic) is required'),
  body('experience_en').notEmpty().withMessage('Experience requirement (English) is required'),
  body('experience_ar').notEmpty().withMessage('Experience requirement (Arabic) is required'),
  body('description_en').notEmpty().withMessage('Job description (English) is required'),
  body('description_ar').notEmpty().withMessage('Job description (Arabic) is required'),
  body('industry_en').notEmpty().withMessage('Industry (English) is required'),
  body('industry_ar').notEmpty().withMessage('Industry (Arabic) is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Verify company exists
    const company = await Company.findById(req.body.company);
    if (!company) {
      return res.status(400).json({ error: 'Company not found' });
    }

    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('company', 'name_en name_ar location_en location_ar industry_en industry_ar');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all jobs for admin (including inactive) with applicant counts
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const Application = require('../models/Application');
    
    const jobs = await Job.find()
      .populate('company', 'name_en name_ar location_en location_ar industry_en industry_ar')
      .sort({ postedAt: -1 });
    
    // Get applicant counts for all jobs
    const counts = await Application.aggregate([
      {
        $group: {
          _id: '$job',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Convert counts to a map
    const countsMap = counts.reduce((acc, item) => {
      if (item._id) {
        acc[item._id.toString()] = item.count;
      }
      return acc;
    }, {});
    
    // Add applicant count to each job
    const jobsWithCounts = jobs.map(job => ({
      ...job.toObject(),
      applicantCount: countsMap[job._id.toString()] || 0
    }));
    
    res.json(jobsWithCounts);
  } catch (err) {
    console.error("❌ Error in /api/jobs/admin/all:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH job active status
router.patch('/:id/active', adminAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    job.isActive = !job.isActive;
    await job.save();
    
    const populatedJob = await Job.findById(job._id).populate('company', 'name_en name_ar location_en location_ar industry_en industry_ar');
    res.json({
      message: `Job ${job.isActive ? 'activated' : 'deactivated'}`,
      job: populatedJob
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/featured', adminAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    job.featured = !job.featured;
    await job.save();
    
    const populatedJob = await Job.findById(job._id).populate('company', 'name_en name_ar location_en location_ar industry_en industry_ar');
    res.json({
      message: `Job ${job.featured ? 'marked as' : 'unmarked from'} featured`,
      job: populatedJob
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE job (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 