import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
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
    startAt: {
      type: Date,
      required: true,
      index: true
    },
    endAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['in_person', 'virtual'],
      default: 'in_person'
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    meetingLink: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Meeting link must be a valid URL'
      }
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    reminderSentAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound indexes for efficient queries
appointmentSchema.index({ doctorId: 1, startAt: 1, status: 1 });
appointmentSchema.index({ patientId: 1, startAt: -1, status: 1 });
appointmentSchema.index({ status: 1, startAt: 1, reminderSentAt: 1 });
appointmentSchema.index({ startAt: 1, status: 1 });

// Virtual for duration in minutes
appointmentSchema.virtual('durationMinutes').get(function() {
  if (!this.startAt || !this.endAt) return 0;
  return Math.round((this.endAt - this.startAt) / (1000 * 60));
});

// Method to check if appointment is in the past
appointmentSchema.methods.isPast = function() {
  return this.endAt < new Date();
};

// Method to check if appointment is upcoming (within 24 hours)
appointmentSchema.methods.isUpcoming = function() {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return this.startAt > now && this.startAt <= twentyFourHoursFromNow;
};

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  return this.status === 'scheduled' && !this.isPast();
};

// Method to check if appointment can be completed
appointmentSchema.methods.canBeCompleted = function() {
  return this.status === 'scheduled';
};

// Static method to find overlapping appointments
appointmentSchema.statics.findOverlapping = async function(doctorId, startAt, endAt, excludeId = null) {
  const query = {
    doctorId,
    status: { $in: ['scheduled'] },
    $or: [
      // New appointment starts during existing appointment
      { startAt: { $lte: startAt }, endAt: { $gt: startAt } },
      // New appointment ends during existing appointment
      { startAt: { $lt: endAt }, endAt: { $gte: endAt } },
      // New appointment completely contains existing appointment
      { startAt: { $gte: startAt }, endAt: { $lte: endAt } }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.find(query);
};

export default mongoose.model('Appointment', appointmentSchema);
