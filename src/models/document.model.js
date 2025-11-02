import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  documentType: {
    type: String,
    enum: [
      'lab_report',
      'radiology_report',
      'prescription',
      'medical_certificate',
      'discharge_summary',
      'consent_form',
      'insurance_document',
      'referral_letter',
      'vaccination_record',
      'other'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  mimeType: {
    type: String,
    required: true,
    trim: true
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags) {
        return tags.every(tag => tag.length <= 50);
      },
      message: 'Each tag must be 50 characters or less'
    }
  },
  relatedTo: {
    type: String,
    enum: ['consultation', 'appointment', 'lab_order', 'prescription', 'none'],
    default: 'none'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  verificationNotes: {
    type: String,
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date
  },
  deletionReason: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date,
    index: true
  },
  accessLog: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessedAt: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['view', 'download', 'share']
    }
  }],
  metadata: {
    type: Map,
    of: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
documentSchema.index({ patientId: 1, documentType: 1 });
documentSchema.index({ patientId: 1, isDeleted: 1 });
documentSchema.index({ uploadedBy: 1, createdAt: -1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ isVerified: 1, isDeleted: 1 });
documentSchema.index({ expiresAt: 1 }, { sparse: true });
documentSchema.index({ 'relatedTo': 1, 'relatedId': 1 });

// Virtual for file extension
documentSchema.virtual('fileExtension').get(function() {
  return this.fileName.split('.').pop().toLowerCase();
});

// Virtual for size in MB
documentSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Instance methods
documentSchema.methods.softDelete = function(userId, reason) {
  this.isDeleted = true;
  this.deletedBy = userId;
  this.deletedAt = new Date();
  this.deletionReason = reason;
};

documentSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedBy = undefined;
  this.deletedAt = undefined;
  this.deletionReason = undefined;
};

documentSchema.methods.verify = function(userId, notes) {
  this.isVerified = true;
  this.verifiedBy = userId;
  this.verifiedAt = new Date();
  if (notes) {
    this.verificationNotes = notes;
  }
};

documentSchema.methods.unverify = function() {
  this.isVerified = false;
  this.verifiedBy = undefined;
  this.verifiedAt = undefined;
  this.verificationNotes = undefined;
};

documentSchema.methods.logAccess = function(userId, action) {
  this.accessLog.push({
    userId,
    action,
    accessedAt: new Date()
  });
  
  // Keep only last 100 access logs
  if (this.accessLog.length > 100) {
    this.accessLog = this.accessLog.slice(-100);
  }
};

documentSchema.methods.addTags = function(newTags) {
  const uniqueTags = new Set([...this.tags, ...newTags]);
  this.tags = Array.from(uniqueTags);
};

documentSchema.methods.removeTags = function(tagsToRemove) {
  this.tags = this.tags.filter(tag => !tagsToRemove.includes(tag));
};

// Static methods
documentSchema.statics.findByPatientId = function(patientId, options = {}) {
  const { includeDeleted = false, limit = 50 } = options;
  const query = { patientId };
  
  if (!includeDeleted) {
    query.isDeleted = false;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('uploadedBy', 'firstName lastName email')
    .populate('verifiedBy', 'firstName lastName')
    .populate('deletedBy', 'firstName lastName');
};

documentSchema.statics.findByType = function(documentType, options = {}) {
  const { limit = 50, skip = 0 } = options;
  return this.find({ documentType, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('patientId', 'userId')
    .populate('uploadedBy', 'firstName lastName');
};

documentSchema.statics.findByTags = function(tags, options = {}) {
  const { limit = 50 } = options;
  return this.find({ 
    tags: { $in: tags },
    isDeleted: false 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('patientId', 'userId')
    .populate('uploadedBy', 'firstName lastName');
};

documentSchema.statics.findUnverified = function(options = {}) {
  const { limit = 50 } = options;
  return this.find({ 
    isVerified: false,
    isDeleted: false 
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('patientId', 'userId')
    .populate('uploadedBy', 'firstName lastName');
};

documentSchema.statics.findExpired = function() {
  return this.find({
    expiresAt: { $lte: new Date() },
    isDeleted: false
  })
    .populate('patientId', 'userId');
};

const Document = mongoose.model('Document', documentSchema);

export default Document;
