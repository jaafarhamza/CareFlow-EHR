import mongoose from 'mongoose';

const vitalSignsSchema = new mongoose.Schema({
  bloodPressure: {
    systolic: {
      type: Number,
      min: 60,
      max: 250,
      required: false
    },
    diastolic: {
      type: Number,
      min: 40,
      max: 150,
      required: false
    }
  },
  heartRate: {
    type: Number,
    min: 40,
    max: 200,
    required: false
  },
  temperature: {
    value: {
      type: Number,
      min: 35,
      max: 42,
      required: false
    },
    unit: {
      type: String,
      enum: ['celsius', 'fahrenheit'],
      default: 'celsius'
    }
  },
  weight: {
    value: {
      type: Number,
      min: 0,
      required: false
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  height: {
    value: {
      type: Number,
      min: 0,
      required: false
    },
    unit: {
      type: String,
      enum: ['cm', 'inches'],
      default: 'cm'
    }
  },
  respiratoryRate: {
    type: Number,
    min: 8,
    max: 60,
    required: false
  },
  oxygenSaturation: {
    type: Number,
    min: 0,
    max: 100,
    required: false
  },
  bloodGlucose: {
    value: {
      type: Number,
      min: 0,
      required: false
    },
    unit: {
      type: String,
      enum: ['mg/dL', 'mmol/L'],
      default: 'mg/dL'
    }
  }
}, { _id: false });

const diagnosisSchema = new mongoose.Schema({
  code: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    trim: true,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['primary', 'secondary'],
    default: 'primary'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, { _id: false });

const procedureSchema = new mongoose.Schema({
  code: {
    type: String,
    trim: true,
    required: true
  },
  name: {
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
  performedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const consultationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
      unique: true
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
    consultationDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    chiefComplaint: {
      type: String,
      trim: true,
      required: true,
      maxlength: 500
    },
    historyOfPresentIllness: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    vitalSigns: {
      type: vitalSignsSchema,
      required: false
    },
    physicalExamination: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    diagnoses: {
      type: [diagnosisSchema],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one diagnosis is required'
      }
    },
    procedures: {
      type: [procedureSchema],
      default: []
    },
    treatmentPlan: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 3000
    },
    followUpInstructions: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    followUpDate: {
      type: Date,
      required: false
    },
    status: {
      type: String,
      enum: ['draft', 'completed', 'amended'],
      default: 'draft',
      index: true
    },
    completedAt: {
      type: Date,
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
consultationSchema.index({ patientId: 1, consultationDate: -1 });
consultationSchema.index({ doctorId: 1, consultationDate: -1 });
consultationSchema.index({ appointmentId: 1, status: 1 });

// Virtual for BMI calculation
consultationSchema.virtual('bmi').get(function() {
  if (!this.vitalSigns?.weight?.value || !this.vitalSigns?.height?.value) {
    return null;
  }
  
  let weightKg = this.vitalSigns.weight.value;
  let heightM = this.vitalSigns.height.value;
  
  // Convert to metric if needed
  if (this.vitalSigns.weight.unit === 'lbs') {
    weightKg = weightKg * 0.453592;
  }
  if (this.vitalSigns.height.unit === 'inches') {
    heightM = heightM * 0.0254;
  } else {
    heightM = heightM / 100; // cm to m
  }
  
  return (weightKg / (heightM * heightM)).toFixed(2);
});

// Method to check if consultation can be edited
consultationSchema.methods.canBeEdited = function() {
  return this.status === 'draft';
};

// Method to complete consultation
consultationSchema.methods.complete = function() {
  if (this.status !== 'draft') {
    throw new Error('Only draft consultations can be completed');
  }
  this.status = 'completed';
  this.completedAt = new Date();
};

// Static method to get patient consultation history
consultationSchema.statics.getPatientHistory = async function(patientId, limit = 10) {
  return this.find({ patientId, status: 'completed' })
    .sort({ consultationDate: -1 })
    .limit(limit)
    .populate('doctorId', 'firstName lastName specialization')
    .populate('appointmentId', 'startAt type');
};

export default mongoose.model('Consultation', consultationSchema);
