import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true,
    trim: true
  },
  testCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    trim: true
  },
  referenceRange: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    text: {
      type: String,
      trim: true
    }
  },
  isAbnormal: {
    type: Boolean,
    default: false
  },
  isCritical: {
    type: Boolean,
    default: false
  },
  flag: {
    type: String,
    enum: ['normal', 'low', 'high', 'critical_low', 'critical_high', 'abnormal'],
    default: 'normal'
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: false });

const labResultSchema = new mongoose.Schema({
  labOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabOrder',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  results: {
    type: [testResultSchema],
    required: true,
    validate: {
      validator: function(results) {
        return results && results.length > 0;
      },
      message: 'At least one test result is required'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending_validation', 'validated', 'released'],
    default: 'draft',
    index: true
  },
  overallInterpretation: {
    type: String,
    trim: true
  },
  technicalNotes: {
    type: String,
    trim: true
  },
  hasCriticalValues: {
    type: Boolean,
    default: false,
    index: true
  },
  hasAbnormalValues: {
    type: Boolean,
    default: false,
    index: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedDate: {
    type: Date,
    index: true
  },
  releasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  releasedDate: {
    type: Date,
    index: true
  },
  pdfReport: {
    fileName: {
      type: String,
      trim: true
    },
    fileUrl: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number
    },
    uploadedAt: {
      type: Date
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
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
labResultSchema.index({ labOrderId: 1, status: 1 });
labResultSchema.index({ patientId: 1, status: 1 });
labResultSchema.index({ doctorId: 1, status: 1 });
labResultSchema.index({ hasCriticalValues: 1, status: 1 });
labResultSchema.index({ performedDate: -1 });
labResultSchema.index({ releasedDate: -1 });

// Pre-save middleware to check for abnormal and critical values
labResultSchema.pre('save', function(next) {
  let hasAbnormal = false;
  let hasCritical = false;

  this.results.forEach(result => {
    if (result.isAbnormal) {
      hasAbnormal = true;
    }
    if (result.isCritical) {
      hasCritical = true;
    }
  });

  this.hasAbnormalValues = hasAbnormal;
  this.hasCriticalValues = hasCritical;

  next();
});

// Instance methods
labResultSchema.methods.validateResult = function(userId) {
  if (this.status !== 'draft' && this.status !== 'pending_validation') {
    throw new Error('Only draft or pending validation results can be validated');
  }
  this.status = 'validated';
  this.validatedBy = userId;
  this.validatedDate = new Date();
};

labResultSchema.methods.release = function(userId) {
  if (this.status !== 'validated') {
    throw new Error('Only validated results can be released');
  }
  this.status = 'released';
  this.releasedBy = userId;
  this.releasedDate = new Date();
};

labResultSchema.methods.attachPdfReport = function(fileData, userId) {
  this.pdfReport = {
    fileName: fileData.fileName,
    fileUrl: fileData.fileUrl,
    fileSize: fileData.fileSize,
    uploadedAt: new Date(),
    uploadedBy: userId
  };
};

labResultSchema.methods.markForValidation = function() {
  if (this.status !== 'draft') {
    throw new Error('Only draft results can be marked for validation');
  }
  this.status = 'pending_validation';
};

// Static methods
labResultSchema.statics.findByLabOrderId = function(labOrderId) {
  return this.findOne({ labOrderId })
    .populate({
      path: 'labOrderId',
      populate: {
        path: 'consultationId doctorId patientId'
      }
    })
    .populate({
      path: 'patientId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email phone'
      }
    })
    .populate({
      path: 'doctorId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate('performedBy', 'firstName lastName email')
    .populate('validatedBy', 'firstName lastName email')
    .populate('releasedBy', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName')
    .populate('pdfReport.uploadedBy', 'firstName lastName');
};

labResultSchema.statics.findCritical = function(options = {}) {
  const { limit = 50, status = 'released' } = options;
  return this.find({ 
    hasCriticalValues: true,
    status: status
  })
    .sort({ performedDate: -1 })
    .limit(limit)
    .populate('patientId', 'userId')
    .populate('doctorId', 'userId')
    .populate('labOrderId', 'orderNumber priority');
};

labResultSchema.statics.findPendingValidation = function(options = {}) {
  const { limit = 50 } = options;
  return this.find({ status: 'pending_validation' })
    .sort({ performedDate: 1 })
    .limit(limit)
    .populate('patientId', 'userId')
    .populate('labOrderId', 'orderNumber priority')
    .populate('performedBy', 'firstName lastName');
};

labResultSchema.statics.findByStatus = function(status, options = {}) {
  const { limit = 50, skip = 0 } = options;
  return this.find({ status })
    .sort({ performedDate: -1 })
    .skip(skip)
    .limit(limit)
    .populate('patientId', 'userId')
    .populate('doctorId', 'userId')
    .populate('labOrderId', 'orderNumber');
};

const LabResult = mongoose.model('LabResult', labResultSchema);

export default LabResult;
