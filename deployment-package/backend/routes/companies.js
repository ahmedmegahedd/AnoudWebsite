const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const Job = require('../models/Job');
const adminAuth = require('../middleware/adminAuth');

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new company (admin only)
router.post('/', [
  adminAuth,
  body('name_en').notEmpty().withMessage('Company name (English) is required'),
  body('name_ar').notEmpty().withMessage('Company name (Arabic) is required'),
  body('location_en').notEmpty().withMessage('Location (English) is required'),
  body('location_ar').notEmpty().withMessage('Location (Arabic) is required'),
  body('industry_en').optional(),
  body('industry_ar').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name_en, name_ar, location_en, location_ar, industry_en, industry_ar } = req.body;

    // Check if company already exists (check both English and Arabic names)
    const existingCompany = await Company.findOne({ 
      $or: [
        { name_en },
        { name_ar }
      ]
    });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company already exists' });
    }

    const company = new Company({
      name_en,
      name_ar,
      location_en,
      location_ar,
      industry_en,
      industry_ar
    });

    await company.save();
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (err) {
    console.error('Error creating company:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update company (admin only)
router.put('/:id', [
  adminAuth,
  body('name_en').notEmpty().withMessage('Company name (English) is required'),
  body('name_ar').notEmpty().withMessage('Company name (Arabic) is required'),
  body('location_en').notEmpty().withMessage('Location (English) is required'),
  body('location_ar').notEmpty().withMessage('Location (Arabic) is required'),
  body('industry_en').optional(),
  body('industry_ar').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name_en, name_ar, location_en, location_ar, industry_en, industry_ar } = req.body;

    // Check if company exists
    const existingCompany = await Company.findById(id);
    if (!existingCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if names are being changed and if new names already exist
    if (name_en !== existingCompany.name_en || name_ar !== existingCompany.name_ar) {
      const nameExists = await Company.findOne({ 
        $or: [
          { name_en, _id: { $ne: id } },
          { name_ar, _id: { $ne: id } }
        ]
      });
      if (nameExists) {
        return res.status(400).json({ error: 'Company name already exists' });
      }
    }

    const company = await Company.findByIdAndUpdate(
      id,
      { name_en, name_ar, location_en, location_ar, industry_en, industry_ar },
      { new: true }
    );

    res.json({ message: 'Company updated successfully', company });
  } catch (err) {
    console.error('Error updating company:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete company (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company exists
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if company has associated jobs
    const jobsCount = await Job.countDocuments({ company: id });
    if (jobsCount > 0) {
      return res.status(403).json({ 
        error: 'This company has job listings and cannot be deleted. Please remove the jobs first.',
        jobsCount 
      });
    }

    // Delete the company
    await Company.findByIdAndDelete(id);
    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    console.error('Error deleting company:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 