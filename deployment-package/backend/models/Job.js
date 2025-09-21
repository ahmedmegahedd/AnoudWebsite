const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  // English fields
  title_en: { type: String, required: true },
  location_en: { type: String, required: true },
  salary_en: { type: String, required: true },
  experience_en: { type: String, required: true },
  description_en: { type: String, required: true },
  
  // Arabic fields
  title_ar: { type: String, required: true },
  location_ar: { type: String, required: true },
  salary_ar: { type: String, required: true },
  experience_ar: { type: String, required: true },
  description_ar: { type: String, required: true },
  
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['Full-Time', 'Part-Time', 'Remote', 'Contract'],
    default: 'Full-Time'
  },
  featured: { type: Boolean, default: false }, // For home page display
  postedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', JobSchema); 