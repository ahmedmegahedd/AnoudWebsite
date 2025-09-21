const express = require('express');
const router = express.Router();

// API routes
router.use('/jobs', require('./jobs'));
router.use('/applications', require('./applications'));
router.use('/admin', require('./admin'));
router.use('/users', require('./users'));
router.use('/companies', require('./companies'));
router.use('/contact', require('./contact'));
router.use('/leads', require('./leads'));
router.use('/cv-upload', require('./cvUpload'));

module.exports = router;
