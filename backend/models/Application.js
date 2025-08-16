const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  education: { type: String, required: true },
  selfIntro: { type: String, required: true },
  resume: { type: String },
  cvText: { type: String }, // Extracted text content from CV for search
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  status: { 
    type: String, 
    enum: ['New', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired'],
    default: 'New'
  },
  isFlagged: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  notes: { type: String },
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', ApplicationSchema); 