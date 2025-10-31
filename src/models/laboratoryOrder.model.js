import mongoose from 'mongoose';

const testItemSchema = new mongoose.Schema({
  code: {
    type: String,
    trim: true,
    required: true,
    maxlength: 50
  },
  name: {
    type: String,
    trim: true,
    required: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['hematology', 'biochemistry', 'microbiology', 'immunology', 'pathology', 'radiology', 'other'],
    required: true
  },
  specimenType: {
    type: String,
    enum: ['blood', 'urine', 'stool', 'saliva', 'tissue', 'swab', 'other'],
    required: true
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  }
}, { _id: false });

const laboratoryOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      trim: true,
      required: true,
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
      type: [testItemSchema],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one test is required'
      }
    },
    status: {
      type: String,
      enum: ['ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled'],
      default: 'ordered',
      required: true,
      index: true
    },
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine',
      index: true
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    sampleCollectedAt: {
      type: Date,
      required: false
    },
    sampleCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    inProgressAt: {
      type: Date,
      required: false
    },
    completedAt: {
      type: Date,
      required: false
    },
    cancelledAt: {
      type: Date,
      required: false
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500
    },
    clinicalNotes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    fastingRequired: {
      type: Boolean,
      default: false
    },
    expectedCompletionDate: {
      type: Date,
      required: false
    },
    laboratoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
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
laboratoryOrderSchema.index({ patientId: 1, orderDate: -1 });
laboratoryOrderSchema.index({ doctorId: 1, orderDate: -1 });
laboratoryOrderSchema.index({ status: 1, priority: 1, orderDate: 1 });
laboratoryOrderSchema.index({ laboratoryId: 1, status: 1 });

// Pre-save hook to generate order number
laboratoryOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count orders for today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    this.orderNumber = `LAB-${year}${month}${day}-${sequence}`;
  }
  next();
});

// Virtual for turnaround time
laboratoryOrderSchema.virtual('turnaroundTime').get(function() {
  if (!this.completedAt || !this.orderDate) return null;
  const diff = this.completedAt - this.orderDate;
  return Math.round(diff / (1000 * 60 * 60)); // hours
});

// Method to update status
laboratoryOrderSchema.methods.updateStatus = function(newStatus, userId) {
  const validTransitions = {
    ordered: ['sample_collected', 'cancelled'],
    sample_collected: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  this.updatedBy = userId;
  
  switch (newStatus) {
    case 'sample_collected':
      this.sampleCollectedAt = new Date();
      this.sampleCollectedBy = userId;
      break;
    case 'in_progress':
      this.inProgressAt = new Date();
      break;
    case 'completed':
      this.completedAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
  }
};

// Method to check if order is overdue
laboratoryOrderSchema.methods.isOverdue = function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false;
  if (!this.expectedCompletionDate) return false;
  return this.expectedCompletionDate < new Date();
};

// Static method to get pending orders
laboratoryOrderSchema.statics.getPendingOrders = async function(laboratoryId = null) {
  const query = {
    status: { $in: ['ordered', 'sample_collected', 'in_progress'] }
  };
  
  if (laboratoryId) {
    query.laboratoryId = laboratoryId;
  }
  
  return this.find(query)
    .sort({ priority: -1, orderDate: 1 })
    .populate('patientId', 'firstName lastName dateOfBirth')
    .populate('doctorId', 'firstName lastName specialization');
};

// Static method to get patient lab history
laboratoryOrderSchema.statics.getPatientHistory = async function(patientId, limit = 20) {
  return this.find({ patientId })
    .sort({ orderDate: -1 })
    .limit(limit)
    .populate('doctorId', 'firstName lastName specialization');
};

export default mongoose.model('LaboratoryOrder', laboratoryOrderSchema);
