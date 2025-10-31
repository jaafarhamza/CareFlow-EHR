import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    maxlength: 200
  },
  genericName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  dosage: {
    type: String,
    trim: true,
    required: true,
    maxlength: 100
  },
  route: {
    type: String,
    enum: ['oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous', 'inhalation', 'rectal', 'ophthalmic', 'otic', 'nasal', 'transdermal', 'sublingual'],
    required: true
  },
  frequency: {
    type: String,
    trim: true,
    required: true,
    maxlength: 100
  },
  duration: {
    value: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      required: true
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  refills: {
    type: Number,
    default: 0,
    min: 0,
    max: 12
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
  {
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
    medications: {
      type: [medicationSchema],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one medication is required'
      }
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: false,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'signed', 'sent', 'dispensed', 'cancelled'],
      default: 'draft',
      required: true,
      index: true
    },
    prescriptionDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    expiryDate: {
      type: Date,
      required: false
    },
    signedAt: {
      type: Date,
      required: false
    },
    sentAt: {
      type: Date,
      required: false
    },
    dispensedAt: {
      type: Date,
      required: false
    },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    pharmacyNotes: {
      type: String,
      trim: true,
      maxlength: 1000
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
prescriptionSchema.index({ patientId: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctorId: 1, prescriptionDate: -1 });
prescriptionSchema.index({ pharmacyId: 1, status: 1, sentAt: -1 });
prescriptionSchema.index({ status: 1, prescriptionDate: -1 });

// Virtual for active status
prescriptionSchema.virtual('isActive').get(function() {
  if (this.status === 'cancelled') return false;
  if (!this.expiryDate) return true;
  return this.expiryDate > new Date();
});

// Method to sign prescription
prescriptionSchema.methods.sign = function() {
  if (this.status !== 'draft') {
    throw new Error('Only draft prescriptions can be signed');
  }
  this.status = 'signed';
  this.signedAt = new Date();
  
  // Set expiry date (default 30 days from signing)
  if (!this.expiryDate) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.expiryDate = expiryDate;
  }
};

// Method to assign to pharmacy
prescriptionSchema.methods.assignToPharmacy = function(pharmacyId) {
  if (this.status !== 'signed') {
    throw new Error('Only signed prescriptions can be assigned to pharmacy');
  }
  this.pharmacyId = pharmacyId;
  this.status = 'sent';
  this.sentAt = new Date();
};

// Method to mark as dispensed
prescriptionSchema.methods.dispense = function(dispensedBy) {
  if (this.status !== 'sent') {
    throw new Error('Only sent prescriptions can be dispensed');
  }
  if (this.expiryDate && this.expiryDate < new Date()) {
    throw new Error('Prescription has expired');
  }
  this.status = 'dispensed';
  this.dispensedAt = new Date();
  this.dispensedBy = dispensedBy;
};

// Method to cancel prescription
prescriptionSchema.methods.cancel = function(reason) {
  if (this.status === 'dispensed') {
    throw new Error('Dispensed prescriptions cannot be cancelled');
  }
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
};

// Static method to get active prescriptions for patient
prescriptionSchema.statics.getActiveForPatient = async function(patientId) {
  return this.find({
    patientId,
    status: { $in: ['signed', 'sent', 'dispensed'] },
    $or: [
      { expiryDate: { $gt: new Date() } },
      { expiryDate: null }
    ]
  })
    .sort({ prescriptionDate: -1 })
    .populate('doctorId', 'firstName lastName specialization')
    .populate('pharmacyId', 'name address phone');
};

// Static method to get pending prescriptions for pharmacy
prescriptionSchema.statics.getPendingForPharmacy = async function(pharmacyId) {
  return this.find({
    pharmacyId,
    status: 'sent'
  })
    .sort({ sentAt: 1 })
    .populate('patientId', 'firstName lastName dateOfBirth phone')
    .populate('doctorId', 'firstName lastName specialization');
};

export default mongoose.model('Prescription', prescriptionSchema);
