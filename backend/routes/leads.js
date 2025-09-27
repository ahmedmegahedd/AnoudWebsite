const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { Parser } = require('json2csv');
const Lead = require('../models/Lead');
const { body, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User'); // Added for custom columns

// Configure multer for CSV uploads
const upload = multer({ dest: 'uploads/' });

// Get all leads with filtering and sorting
router.get('/', adminAuth, async (req, res) => {
  try {
    const { 
      status, 
      leadSource, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 50,
      adminId, // New filter for superadmins to select specific admin
      dateFrom, // New filter for date range
      dateTo // New filter for date range
    } = req.query;

    let query = {};

    // Admin ownership filter - regular admins only see their own leads
    if (req.user.role === 'admin') {
      query['createdBy.adminId'] = req.user._id;
    } else if (req.user.role === 'superadmin' && adminId && adminId !== 'all') {
      // Superadmins can filter by specific admin
      query['createdBy.adminId'] = adminId;
    }
    // Superadmins can see all leads (no filter applied) if no adminId specified

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Lead source filter
    if (leadSource && leadSource !== 'all') {
      query.leadSource = leadSource;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.updatedAt = {};
      if (dateFrom) {
        query.updatedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.updatedAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Search functionality
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { companyName: searchRegex },
        { contactPerson: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { notes: searchRegex }
      ];
    }

    // Sort options
    let sortOptions = {};
    if (sortBy === 'companyName') {
      sortOptions.companyName = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'status') {
      sortOptions.status = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'followUpDate') {
      sortOptions.followUpDate = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leads = await Lead.find(query)
      .populate('createdBy.adminId', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(query);

    res.json({
      leads,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalLeads: total
      }
    });
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get lead analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // Build base match for admin ownership
    let baseMatch = {};
    if (req.user.role === 'admin') {
      baseMatch['createdBy.adminId'] = req.user._id;
    }

    // Status breakdown
    const statusStats = await Lead.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Lead source breakdown
    const sourceStats = await Lead.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$leadSource',
          count: { $sum: 1 }
        }
      }
    ]);

    // Follow-up reminders
    const today = new Date();
    const upcomingFollowUps = await Lead.find({
      ...baseMatch,
      followUpDate: { $gte: today },
      followUpStatus: 'Pending'
    }).sort({ followUpDate: 1 }).limit(10);

    const overdueFollowUps = await Lead.find({
      ...baseMatch,
      followUpDate: { $lt: today },
      followUpStatus: 'Pending'
    }).sort({ followUpDate: 1 }).limit(10);

    // Recent activity
    const recentLeads = await Lead.find(baseMatch)
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      statusStats,
      sourceStats,
      upcomingFollowUps,
      overdueFollowUps,
      recentLeads
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get custom columns for the current admin
router.get('/custom-columns', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ customColumns: user.customColumns || [] });
  } catch (error) {
    console.error('Error fetching custom columns:', error);
    res.status(500).json({ error: 'Failed to fetch custom columns' });
  }
});

// Save custom columns for the current admin
router.post('/custom-columns', adminAuth, async (req, res) => {
  try {
    const { customColumns } = req.body;
    
    if (!Array.isArray(customColumns)) {
      return res.status(400).json({ error: 'customColumns must be an array' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate custom columns
    const validatedColumns = customColumns.map((col, index) => ({
      id: col.id || `custom-${Date.now()}-${index}`,
      title: col.title || `Column ${index + 1}`,
      order: col.order || index
    }));

    user.customColumns = validatedColumns;
    await user.save();

    res.json({ 
      message: 'Custom columns saved successfully',
      customColumns: user.customColumns 
    });
  } catch (error) {
    console.error('Error saving custom columns:', error);
    res.status(500).json({ error: 'Failed to save custom columns' });
  }
});

// Delete a custom column
router.delete('/custom-columns/:columnId', adminAuth, async (req, res) => {
  try {
    const { columnId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.customColumns = user.customColumns.filter(col => col.id !== columnId);
    await user.save();

    res.json({ 
      message: 'Custom column deleted successfully',
      customColumns: user.customColumns 
    });
  } catch (error) {
    console.error('Error deleting custom column:', error);
    res.status(500).json({ error: 'Failed to delete custom column' });
  }
});

// Get all admins for superadmin filter dropdown
router.get('/admins', adminAuth, async (req, res) => {
  try {
    // Only superadmins can see all admins for filtering
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. Superadmin role required.' });
    }

    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } })
      .select('_id name email role')
      .sort({ name: 1 });

    res.json({ admins });
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific lead by ID
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (err) {
    console.error('Error fetching lead:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new lead
router.post('/', adminAuth, [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('contactPerson').notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('status').optional().isIn(['New', 'Contacted', 'In Discussion', 'Converted', 'Lost']),
  body('leadSource').optional().isIn(['Website Form', 'Manual', 'Referral', 'Other']),
  body('notes').optional(),
  body('followUpDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add audit tracking
    const auditEntry = {
      action: 'created',
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      timestamp: new Date(),
      details: `Created new lead for ${req.body.companyName}`
    };

    const lead = new Lead({
      ...req.body,
      createdBy: {
        adminId: req.user._id,
        adminEmail: req.user.email,
        adminName: req.user.name
      },
      auditHistory: [auditEntry],
      lastModifiedBy: {
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name,
        timestamp: new Date()
      }
    });
    await lead.save();

    res.status(201).json(lead);
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a lead
router.patch('/:id', adminAuth, [
  body('companyName').optional().notEmpty().withMessage('Company name cannot be empty'),
  body('contactPerson').optional().notEmpty().withMessage('Contact person cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('status').optional().isIn(['New', 'Contacted', 'In Discussion', 'Converted', 'Lost']),
  body('customColumnId').optional().custom((value) => {
    if (value === null || value === undefined || typeof value === 'string') {
      return true;
    }
    throw new Error('customColumnId must be a string or null');
  }),
  body('leadSource').optional().isIn(['Website Form', 'Manual', 'Referral', 'Other']),
  body('notes').optional(),
  body('followUpDate').optional().isISO8601(),
  body('followUpStatus').optional().isIn(['Pending', 'Completed', 'Overdue'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get the current lead to compare changes
    const currentLead = await Lead.findById(req.params.id);
    if (!currentLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check if admin can modify this lead (only creator or superadmin)
    if (req.user.role === 'admin' && currentLead.createdBy.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only modify leads you created' });
    }

    // Prepare audit entry
    const changes = [];
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== currentLead[key]) {
        changes.push(`${key}: ${currentLead[key]} → ${req.body[key]}`);
      }
    });

    const auditEntry = {
      action: 'updated',
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      timestamp: new Date(),
      details: changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'Lead updated',
      previousValue: JSON.stringify(currentLead.toObject()),
      newValue: JSON.stringify(req.body)
    };

    // Update lead with audit tracking
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        $push: { auditHistory: auditEntry },
        lastModifiedBy: {
          adminId: req.user.id,
          adminEmail: req.user.email,
          adminName: req.user.name,
          timestamp: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    res.json(lead);
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a lead
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check if admin can delete this lead (only creator or superadmin)
    if (req.user.role === 'admin' && lead.createdBy.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete leads you created' });
    }

    // Add audit entry before deletion
    const auditEntry = {
      action: 'deleted',
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      timestamp: new Date(),
      details: `Deleted lead for ${lead.companyName}`,
      previousValue: JSON.stringify(lead.toObject())
    };

    // Update the lead with audit entry before deleting
    await Lead.findByIdAndUpdate(req.params.id, {
      $push: { auditHistory: auditEntry }
    });

    // Now delete the lead
    await Lead.findByIdAndDelete(req.params.id);

    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send email campaign
router.post('/send-email', adminAuth, [
  body('leadIds').isArray().withMessage('Lead IDs array is required'),
  body('subject').notEmpty().withMessage('Email subject is required'),
  body('body').notEmpty().withMessage('Email body is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leadIds, subject, body } = req.body;

    // Update leads with email history
    const updatePromises = leadIds.map(leadId => 
      Lead.findByIdAndUpdate(leadId, {
        $push: {
          emailHistory: {
            subject,
            body,
            sentAt: new Date()
          }
        }
      })
    );

    await Promise.all(updatePromises);

    // Mock email sending (in real implementation, you'd use nodemailer or similar)
    console.log(`Mock email sent to ${leadIds.length} leads:`, { subject, body });

    res.json({ 
      message: `Email campaign sent to ${leadIds.length} leads`,
      sentAt: new Date()
    });
  } catch (err) {
    console.error('Error sending email campaign:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Import leads from CSV
router.post('/import-csv', adminAuth, upload.single('csv'), async (req, res) => {
  console.log('=== CSV IMPORT REQUEST RECEIVED ===');
  console.log('Auth check passed, proceeding with import...');
  try {
    console.log('CSV Import Request:', {
      hasFile: !!req.file,
      fileSize: req.file ? req.file.size : 0,
      fileName: req.file ? req.file.originalname : 'none',
      filePath: req.file ? req.file.path : 'none',
      headers: Object.keys(req.headers),
      authorization: req.headers.authorization ? 'Bearer token present' : 'No authorization'
    });
    
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const leads = [];
    const errors = [];

    // Read and parse CSV file
    const csvData = fs.readFileSync(req.file.path, 'utf8');
    const lines = csvData.split('\n').filter(line => line.trim()); // Remove empty lines
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Handle CSV parsing more robustly
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add the last value
      
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Map CSV columns to lead fields with flexible column names
      const lead = {
        companyName: row['Company Name'] || row['CompanyName'] || row['Company'] || row['company name'] || row['companyname'] || row['company'] || '',
        contactPerson: row['Contact Person'] || row['ContactPerson'] || row['Contact'] || row['contact person'] || row['contactperson'] || row['contact'] || row['Name'] || row['name'] || '',
        email: row['Email'] || row['email'] || row['E-mail'] || row['e-mail'] || '',
        phone: row['Phone'] || row['Phone Number'] || row['PhoneNumber'] || row['phone'] || row['phone number'] || row['phonenumber'] || row['Telephone'] || row['telephone'] || '',
        status: (() => {
          const status = row['Status'] || row['status'] || 'New';
          // Map common variations to valid enum values
          const statusMap = {
            'New': 'New',
            'new': 'New',
            'Contacted': 'Contacted',
            'contacted': 'Contacted',
            'In Discussion': 'In Discussion',
            'in discussion': 'In Discussion',
            'In discussion': 'In Discussion',
            'Converted': 'Converted',
            'converted': 'Converted',
            'Lost': 'Lost',
            'lost': 'Lost'
          };
          return statusMap[status] || 'New';
        })(),
        leadSource: (() => {
          const source = row['Lead Source'] || row['LeadSource'] || row['Source'] || row['lead source'] || row['leadsource'] || row['source'] || 'Manual';
          // Map common variations to valid enum values
          const sourceMap = {
            'Website': 'Website Form',
            'website': 'Website Form',
            'Website Form': 'Website Form',
            'website form': 'Website Form',
            'Manual': 'Manual',
            'manual': 'Manual',
            'Referral': 'Referral',
            'referral': 'Referral',
            'Other': 'Other',
            'other': 'Other'
          };
          return sourceMap[source] || 'Manual';
        })(),
        notes: row['Notes'] || row['notes'] || row['Comments'] || row['comments'] || row['Description'] || row['description'] || '',
        followUpDate: row['Follow-up Date'] || row['FollowUpDate'] || row['Follow Up Date'] || row['follow-up date'] || row['followupdate'] || row['follow up date'] ? new Date(row['Follow-up Date'] || row['FollowUpDate'] || row['Follow Up Date'] || row['follow-up date'] || row['followupdate'] || row['follow up date']) : null
      };

      // Validate required fields
      if (!lead.companyName || !lead.contactPerson || !lead.email) {
        errors.push(`Row ${i + 1}: Missing required fields (Company Name, Contact Person, Email) for ${lead.companyName || 'Unknown'}`);
        continue;
      }

      // Validate email format - more lenient
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(lead.email)) {
        console.log(`Row ${i + 1}: Skipping invalid email "${lead.email}" for ${lead.companyName}`);
        errors.push(`Row ${i + 1}: Invalid email format "${lead.email}" for ${lead.companyName}`);
        continue; // Skip this row instead of failing the entire import
      }

              // Log the mapped lead for debugging
        console.log(`Row ${i + 1} mapped lead:`, {
          companyName: lead.companyName,
          contactPerson: lead.contactPerson,
          email: lead.email,
          status: lead.status,
          leadSource: lead.leadSource
        });
        
        leads.push(lead);
      }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (errors.length > 0 && leads.length === 0) {
      return res.status(400).json({ 
        error: 'CSV import failed - no valid data found', 
        errors 
      });
    }

    if (leads.length === 0) {
      return res.status(400).json({ 
        error: 'No valid leads found in CSV file' 
      });
    }

    // Add createdBy information to each lead
    const leadsWithOwnership = leads.map(lead => ({
      ...lead,
      createdBy: {
        adminId: req.user._id,
        adminEmail: req.user.email,
        adminName: req.user.name
      }
    }));

    // Insert leads
    const insertedLeads = await Lead.insertMany(leadsWithOwnership);

    res.json({ 
      message: `Successfully imported ${insertedLeads.length} leads${errors.length > 0 ? ` (${errors.length} rows had errors)` : ''}`,
      imported: insertedLeads.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('Error processing CSV:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Export leads to CSV
router.post('/export-csv', adminAuth, [
  body('leadIds').optional().isArray(),
  body('filters').optional().isObject()
], async (req, res) => {
  try {
    const { leadIds, filters } = req.body;
    
    let query = {};

    // Admin ownership filter - regular admins only see their own leads
    if (req.user.role === 'admin') {
      query['createdBy.adminId'] = req.user._id;
    }

    // If specific lead IDs provided, use those
    if (leadIds && leadIds.length > 0) {
      query._id = { $in: leadIds };
    } else if (filters) {
      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      if (filters.leadSource && filters.leadSource !== 'all') {
        query.leadSource = filters.leadSource;
      }
      if (filters.search) {
        const searchRegex = { $regex: filters.search, $options: 'i' };
        query.$or = [
          { companyName: searchRegex },
          { contactPerson: searchRegex },
          { email: searchRegex }
        ];
      }
    }

    const leads = await Lead.find(query)
      .populate('createdBy.adminId', 'name email')
      .sort({ createdAt: -1 });

    if (leads.length === 0) {
      return res.status(404).json({ error: 'No leads found for export' });
    }

    // Transform data for CSV
    const csvData = leads.map(lead => ({
      'Company Name': lead.companyName,
      'Contact Person': lead.contactPerson,
      'Email': lead.email,
      'Phone': lead.phone,
      'Status': lead.status,
      'Lead Source': lead.leadSource,
      'Notes': lead.notes || '',
      'Follow-Up Date': lead.followUpDate ? lead.followUpDate.toISOString().split('T')[0] : '',
      'Date Added': lead.createdAt.toISOString().split('T')[0],
      'Created By': req.user.role === 'superadmin' ? lead.createdBy.adminName : 'You'
    }));

    // Configure CSV parser
    const fields = [
      'Company Name',
      'Contact Person',
      'Email',
      'Phone',
      'Status',
      'Lead Source',
      'Notes',
      'Follow-Up Date',
      'Date Added',
      'Created By'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `leads_export_${timestamp}.csv`;

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csv);

  } catch (err) {
    console.error('Error exporting leads:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 