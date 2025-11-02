import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Pathology', 'Radiology', 'Other'],
    default: 'Other'
  },
  specimenType: {
    type: String,
    required: true,
    enum: ['Blood', 'Urine', 'Stool', 'Saliva', 'Tissue', 'Swab', 'Other']
  },
  instructions: {
    type: String,
    trim: true
  }
}, { _id: false });

const labOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    index: true
  },
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
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
  tests: {
    type: [labTestSchema],
    required: true,
    validate: {
      validator: function(tests) {
        return tests && tests.length > 0;
      },
      message: 'At least one test is required'
    }
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine',
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'collected', 'processing', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  clinicalNotes: {
    type: String,
    trim: true
  },
  diagnosis: {
    type: String,
    trim: true
  },
  collectionDate: {
    type: Date,
    index: true
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processingDate: {
    type: Date
  },
  completedDate: {
    type: Date,
    index: true
  },
  cancelledDate: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
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
labOrderSchema.index({ status: 1, priority: 1 });
labOrderSchema.index({ patientId: 1, status: 1 });
labOrderSchema.index({ doctorId: 1, status: 1 });
labOrderSchema.index({ createdAt: -1 });

// Virtual for results
labOrderSchema.virtual('results', {
  ref: 'LabResult',
  localField: '_id',
  foreignField: 'labOrderId'
});

// Generate order number before saving
labOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const orderNum = count + 1;
      this.orderNumber = `LAB-${String(orderNum).padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Instance methods
labOrderSchema.methods.markAsCollected = function(userId) {
  if (this.status !== 'pending') {
    throw new Error('Only pending orders can be marked as collected');
  }
  this.status = 'collected';
  this.collectionDate = new Date();
  this.collectedBy = userId;
};

labOrderSchema.methods.startProcessing = function(userId) {
  if (this.status !== 'collected') {
    throw new Error('Only collected orders can be processed');
  }
  this.status = 'processing';
  this.processingDate = new Date();
  if (userId) {
    this.assignedTo = userId;
  }
};

labOrderSchema.methods.markAsCompleted = function() {
  if (this.status !== 'processing') {
    throw new Error('Only processing orders can be marked as completed');
  }
  this.status = 'completed';
  this.completedDate = new Date();
};

labOrderSchema.methods.cancel = function(reason) {
  if (this.status === 'completed') {
    throw new Error('Completed orders cannot be cancelled');
  }
  this.status = 'cancelled';
  this.cancelledDate = new Date();
  this.cancellationReason = reason;
};

labOrderSchema.methods.assignTechnician = function(technicianId) {
  this.assignedTo = technicianId;
};

// Static methods
labOrderSchema.statics.findByOrderNumber = function(orderNumber) {
  return this.findOne({ orderNumber })
    .populate('consultationId', 'consultationDate chiefComplaint')
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
    .populate('collectedBy', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .populate('createdBy', 'firstName lastName')
    .populate('results');
};

labOrderSchema.statics.findPending = function(options = {}) {
  const { limit = 50, priority } = options;
  const query = { status: 'pending' };
  
  if (priority) {
    query.priority = priority;
  }
  
  return this.find(query)
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit)
    .populate('patientId', 'userId')
    .populate('doctorId', 'userId');
};

labOrderSchema.statics.findByStatus = function(status, options = {}) {
  const { limit = 50, skip = 0 } = options;
  return this.find({ status })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('patientId', 'userId')
    .populate('doctorId', 'userId')
    .populate('assignedTo', 'firstName lastName');
};

labOrderSchema.statics.findUrgent = function() {
  return this.find({ 
    priority: { $in: ['urgent', 'stat'] },
    status: { $in: ['pending', 'collected', 'processing'] }
  })
    .sort({ priority: -1, createdAt: 1 })
    .populate('patientId', 'userId')
    .populate('doctorId', 'userId');
};

const LabOrder = mongoose.model('LabOrder', labOrderSchema);

export default LabOrder;
