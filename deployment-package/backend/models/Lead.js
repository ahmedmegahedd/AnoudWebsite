const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Discussion', 'Converted', 'Lost'],
    default: 'New'
  },
  customColumnId: {
    type: String,
    default: null
  },
  leadSource: {
    type: String,
    enum: ['Website Form', 'Manual', 'Referral', 'Other'],
    default: 'Manual'
  },
  notes: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  },
  followUpStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  emailHistory: [{
    subject: String,
    body: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    opened: {
      type: Boolean,
      default: false
    },
    clicked: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Audit tracking fields
  auditHistory: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'status_changed', 'deleted'],
      required: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    adminEmail: {
      type: String,
      required: true
    },
    adminName: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: String,
      trim: true
    },
    previousValue: {
      type: String
    },
    newValue: {
      type: String
    }
  }],
  lastModifiedBy: {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    adminEmail: {
      type: String
    },
    adminName: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
});

// Update the updatedAt field before saving
LeadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', LeadSchema); 