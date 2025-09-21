const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  // English fields
  name_en: { type: String, required: true, unique: true },
  location_en: { type: String, required: true },
  industry_en: { type: String },
  
  // Arabic fields
  name_ar: { type: String, required: true, unique: true },
  location_ar: { type: String, required: true },
  industry_ar: { type: String },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Company', CompanySchema); 