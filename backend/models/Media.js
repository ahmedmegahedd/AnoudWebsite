const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  // English fields
  title_en: { type: String, required: true },
  description_en: { type: String, required: true },
  
  // Arabic fields
  title_ar: { type: String, required: true },
  description_ar: { type: String, required: true },
  
  // Media file information
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  
  // Media metadata
  duration: { type: Number }, // Duration in seconds for videos
  thumbnail: { type: String }, // Thumbnail image path
  
  // Status and visibility
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  
  // Admin tracking
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Timestamps
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
MediaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Media', MediaSchema);
