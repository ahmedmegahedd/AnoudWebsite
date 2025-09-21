const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Create transporter for sending emails
// You can configure this for different email services
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured. Contact form will only log submissions.');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail', // or 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

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

    // Log the contact form submission
    console.log('📧 Contact Form Submission:', {
      name,
      email,
      phone,
      message,
      submittedAt: new Date().toISOString()
    });

    // Try to send email if transporter is available
    const transporter = createTransporter();
    if (transporter) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: 'm.megahed@anoudjob.com',
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to m.megahed@anoudjob.com');
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Continue with the response even if email fails
      }
    }

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
    console.error('❌ Contact form submission error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to submit contact form'
    });
  }
});

module.exports = router; 