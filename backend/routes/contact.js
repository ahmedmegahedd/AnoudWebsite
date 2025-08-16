const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// POST /api/contact - Submit contact form
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('message').notEmpty().withMessage('Message is required'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, email, phone, message } = req.body;

    // Log the contact form submission (in a real app, you might save to database or send email)
    console.log('Contact Form Submission:', {
      name,
      email,
      phone,
      message,
      submittedAt: new Date().toISOString()
    });

    // For now, we'll just return success
    // In a production app, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with CRM system
    
    res.status(200).json({ 
      message: 'Contact form submitted successfully',
      data: {
        name,
        email,
        phone,
        message
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to submit contact form'
    });
  }
});

module.exports = router; 