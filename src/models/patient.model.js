import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(v) {
          return !v || v < new Date();
        },
        message: 'Date of birth must be in the past'
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      lowercase: true
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      uppercase: true
    },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true }
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relationship: { type: String, trim: true }
    },
    insurance: {
      provider: { type: String, trim: true },
      policyNumber: { type: String, trim: true },
      groupNumber: { type: String, trim: true }
    },
    allergies: [{ type: String, trim: true }],
    chronicConditions: [{ type: String, trim: true }],
    medications: [{ type: String, trim: true }],
    consents: {
      dataProcessing: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
      care: { type: Boolean, default: true }
    },
    preferences: {
      language: { type: String, default: 'en' },
      communication: { type: String, enum: ['email', 'sms', 'phone'], default: 'email' }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

patientSchema.index({ userId: 1 }, { unique: true });
patientSchema.index({ dateOfBirth: 1 });
patientSchema.index({ createdAt: -1 });

export default mongoose.model('Patient', patientSchema);
