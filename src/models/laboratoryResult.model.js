import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  testCode: {
    type: String,
    trim: true,
    required: true,
    maxlength: 50
  },
  testName: {
    type: String,
    trim: true,
    required: true,
    maxlength: 200
  },
  value: {
    type: String,
    trim: true,
    required: true,
    maxlength: 500
  },
  unit: {
    type: String,
    trim: true,
    maxlength: 50
  },
  referenceRange: {
    min: {
      type: String,
      trim: true
    },
    max: {
      type: String,
      trim: true
    },
    text: {
      type: String,
      trim: true,
      maxlength: 200
    }
  },
  isAbnormal: {
    type: Boolean,
    default: false
  },
  abnormalFlag: {
    type: String,
    enum: ['low', 'high', 'critical_low', 'critical_high', 'abnormal', null],
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { _id: false });

const laboratoryResultSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LaboratoryOrder',
      required: true,
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    results: {
      type: [testResultSchema],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one test result is required'
      }
    },
    status: {
      type: String,
      enum: ['preliminary', 'final', 'corrected', 'cancelled'],
      default: 'preliminary',
      required: true,
      index: true
    },
    reportDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    validatedAt: {
      type: Date,
      required: false
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    reportFileKey: {
      type: String,
      trim: true,
      required: false
    },
    reportFileName: {
      type: String,
      trim: true,
      required: false
    },
    reportFileSize: {
      type: Number,
      required: false
    },
    reportMimeType: {
      type: String,
      trim: true,
      required: false
    },
    interpretation: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    recommendations: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    technicalNotes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    reviewedAt: {
      type: Date,
      required: false
    },
    criticalValues: {
      type: Boolean,
      default: false
    },
    criticalValueNotifiedAt: {
      type: Date,
      required: false
    },
    criticalValueNotifiedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound indexes for efficient queries
laboratoryResultSchema.index({ patientId: 1, reportDate: -1 });
laboratoryResultSchema.index({ orderId: 1, status: 1 });
laboratoryResultSchema.index({ status: 1, reportDate: -1 });
laboratoryResultSchema.index({ criticalValues: 1, criticalValueNotifiedAt: 1 });

// Virtual for abnormal results count
laboratoryResultSchema.virtual('abnormalCount').get(function() {
  if (!this.results) return 0;
  return this.results.filter(r => r.isAbnormal).length;
});

// Virtual for critical results count
laboratoryResultSchema.virtual('criticalCount').get(function() {
  if (!this.results) return 0;
  return this.results.filter(r => 
    r.abnormalFlag === 'critical_low' || r.abnormalFlag === 'critical_high'
  ).length;
});

// Method to validate results
laboratoryResultSchema.methods.validate = function(userId) {
  if (this.status === 'cancelled') {
    throw new Error('Cancelled results cannot be validated');
  }
  if (this.status === 'final') {
    throw new Error('Results are already validated');
  }
  
  this.status = 'final';
  this.validatedAt = new Date();
  this.validatedBy = userId;
};

// Method to mark as corrected
laboratoryResultSchema.methods.correct = function(userId) {
  if (this.status !== 'final') {
    throw new Error('Only final results can be corrected');
  }
  
  this.status = 'corrected';
  this.updatedBy = userId;
};

// Method to check if has critical values
laboratoryResultSchema.methods.hasCriticalValues = function() {
  if (!this.results) return false;
  return this.results.some(r => 
    r.abnormalFlag === 'critical_low' || r.abnormalFlag === 'critical_high'
  );
};

// Method to mark critical value as notified
laboratoryResultSchema.methods.notifyCriticalValue = function(notifiedTo) {
  if (!this.hasCriticalValues()) {
    throw new Error('No critical values to notify');
  }
  
  this.criticalValues = true;
  this.criticalValueNotifiedAt = new Date();
  this.criticalValueNotifiedTo = notifiedTo;
};

// Method to attach report file
laboratoryResultSchema.methods.attachReport = function(fileKey, fileName, fileSize, mimeType) {
  this.reportFileKey = fileKey;
  this.reportFileName = fileName;
  this.reportFileSize = fileSize;
  this.reportMimeType = mimeType;
};

// Static method to get patient results
laboratoryResultSchema.statics.getPatientResults = async function(patientId, limit = 20) {
  return this.find({ patientId, status: { $in: ['final', 'corrected'] } })
    .sort({ reportDate: -1 })
    .limit(limit)
    .populate('orderId', 'orderNumber tests orderDate')
    .populate('validatedBy', 'firstName lastName');
};

// Static method to get pending validation
laboratoryResultSchema.statics.getPendingValidation = async function() {
  return this.find({ status: 'preliminary' })
    .sort({ reportDate: 1 })
    .populate('orderId', 'orderNumber priority')
    .populate('patientId', 'firstName lastName dateOfBirth')
    .populate('performedBy', 'firstName lastName');
};

// Static method to get critical results not notified
laboratoryResultSchema.statics.getCriticalNotNotified = async function() {
  return this.find({
    criticalValues: true,
    criticalValueNotifiedAt: null,
    status: { $in: ['preliminary', 'final'] }
  })
    .sort({ reportDate: 1 })
    .populate('orderId', 'orderNumber priority doctorId')
    .populate('patientId', 'firstName lastName phone');
};

export default mongoose.model('LaboratoryResult', laboratoryResultSchema);
