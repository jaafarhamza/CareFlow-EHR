import mongoose from 'mongoose';

const medicalDocumentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    category: {
      type: String,
      enum: ['imaging', 'report', 'prescription', 'insurance', 'consent', 'referral', 'discharge', 'other'],
      required: true,
      index: true
    },
    fileKey: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    fileName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 255
    },
    originalFileName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 255
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
      max: 20 * 1024 * 1024 // 20MB max
    },
    mimeType: {
      type: String,
      trim: true,
      required: true,
      enum: [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/svg+xml',
        'image/tiff'
      ]
    },
    documentDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.every(tag => tag.length <= 50);
        },
        message: 'Each tag must be 50 characters or less'
      }
    },
    relatedTo: {
      resourceType: {
        type: String,
        enum: ['consultation', 'prescription', 'laboratoryOrder', 'laboratoryResult', 'appointment', null],
        default: null
      },
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      }
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedByRole: {
      type: String,
      enum: ['doctor', 'patient', 'admin', 'lab_technician', 'pharmacist'],
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    verifiedAt: {
      type: Date,
      required: false
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      required: false
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    accessLog: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      accessedAt: {
        type: Date,
        default: Date.now
      },
      action: {
        type: String,
        enum: ['view', 'download'],
        required: true
      }
    }],
    metadata: {
      type: Map,
      of: String,
      default: {}
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound indexes for efficient queries
medicalDocumentSchema.index({ patientId: 1, documentDate: -1, isDeleted: 1 });
medicalDocumentSchema.index({ patientId: 1, category: 1, isDeleted: 1 });
medicalDocumentSchema.index({ uploadedBy: 1, createdAt: -1 });
medicalDocumentSchema.index({ tags: 1, isDeleted: 1 });
medicalDocumentSchema.index({ 'relatedTo.resourceType': 1, 'relatedTo.resourceId': 1 });

// Virtual for file extension
medicalDocumentSchema.virtual('fileExtension').get(function() {
  const parts = this.fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
});

// Virtual for human-readable file size
medicalDocumentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
});

// Method to verify document
medicalDocumentSchema.methods.verify = function(userId) {
  if (this.isVerified) {
    throw new Error('Document is already verified');
  }
  if (this.isDeleted) {
    throw new Error('Cannot verify deleted document');
  }
  
  this.isVerified = true;
  this.verifiedBy = userId;
  this.verifiedAt = new Date();
};

// Method to soft delete document
medicalDocumentSchema.methods.softDelete = function(userId) {
  if (this.isDeleted) {
    throw new Error('Document is already deleted');
  }
  
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
};

// Method to log access
medicalDocumentSchema.methods.logAccess = function(userId, action) {
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

// Method to check if user can access
medicalDocumentSchema.methods.canAccess = function(userId, userRole) {
  if (this.isDeleted) return false;
  
  // Admins can access all
  if (userRole === 'admin') return true;
  
  // Uploader can access
  if (this.uploadedBy.equals(userId)) return true;
  
  // Doctors can access their patients' documents
  if (userRole === 'doctor') return true;
  
  // Patients can access their own documents
  if (userRole === 'patient' && this.patientId.equals(userId)) return true;
  
  return false;
};

// Static method to get patient documents
medicalDocumentSchema.statics.getPatientDocuments = async function(patientId, filters = {}) {
  const query = {
    patientId,
    isDeleted: false,
    ...filters
  };
  
  return this.find(query)
    .sort({ documentDate: -1 })
    .populate('uploadedBy', 'firstName lastName role')
    .populate('verifiedBy', 'firstName lastName');
};

// Static method to search documents
medicalDocumentSchema.statics.searchDocuments = async function(searchParams) {
  const { patientId, category, tags, startDate, endDate, isVerified } = searchParams;
  
  const query = { isDeleted: false };
  
  if (patientId) query.patientId = patientId;
  if (category) query.category = category;
  if (tags && tags.length > 0) query.tags = { $in: tags };
  if (isVerified !== undefined) query.isVerified = isVerified;
  
  if (startDate || endDate) {
    query.documentDate = {};
    if (startDate) query.documentDate.$gte = new Date(startDate);
    if (endDate) query.documentDate.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ documentDate: -1 })
    .populate('uploadedBy', 'firstName lastName')
    .populate('patientId', 'firstName lastName');
};

// Static method to get documents by related resource
medicalDocumentSchema.statics.getByRelatedResource = async function(resourceType, resourceId) {
  return this.find({
    'relatedTo.resourceType': resourceType,
    'relatedTo.resourceId': resourceId,
    isDeleted: false
  })
    .sort({ documentDate: -1 })
    .populate('uploadedBy', 'firstName lastName');
};

export default mongoose.model('MedicalDocument', medicalDocumentSchema);
