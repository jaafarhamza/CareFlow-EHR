import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  start: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  end: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
}, { _id: false });

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    specialization: {
      type: String,
      required: true,
      trim: true
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    yearsOfExperience: {
      type: Number,
      min: 0
    },
    consultationDurationMinutes: {
      type: Number,
      min: 5,
      max: 480,
      default: 30
    },
    workingHours: {
      monday: [timeSlotSchema],
      tuesday: [timeSlotSchema],
      wednesday: [timeSlotSchema],
      thursday: [timeSlotSchema],
      friday: [timeSlotSchema],
      saturday: [timeSlotSchema],
      sunday: [timeSlotSchema]
    },
    bufferMinutes: {
      type: Number,
      min: 0,
      default: 0
    },
    maxDailyAppointments: {
      type: Number,
      min: 1
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

doctorSchema.index({ userId: 1 }, { unique: true });
doctorSchema.index({ licenseNumber: 1 }, { unique: true });
doctorSchema.index({ specialization: 1, isAvailable: 1 });

export default mongoose.model('Doctor', doctorSchema);
