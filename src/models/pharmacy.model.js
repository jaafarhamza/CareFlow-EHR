import mongoose from 'mongoose';

const operatingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  openTime: {
    type: String,
    required: function() {
      return this.isOpen;
    },
    validate: {
      validator: function(v) {
        if (!this.isOpen) return true;
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Open time must be in HH:MM format'
    }
  },
  closeTime: {
    type: String,
    required: function() {
      return this.isOpen;
    },
    validate: {
      validator: function(v) {
        if (!this.isOpen) return true;
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Close time must be in HH:MM format'
    }
  }
}, { _id: false });

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 200,
      index: true
    },
    licenseNumber: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      validate: {
        validator: function(v) {
          return /^[\d\s\-\+\(\)]+$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    alternatePhone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[\d\s\-\+\(\)]+$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    address: {
      street: {
        type: String,
        trim: true,
        required: true,
        maxlength: 200
      },
      city: {
        type: String,
        trim: true,
        required: true,
        maxlength: 100
      },
      state: {
        type: String,
        trim: true,
        required: true,
        maxlength: 100
      },
      postalCode: {
        type: String,
        trim: true,
        required: true,
        maxlength: 20
      },
      country: {
        type: String,
        trim: true,
        required: true,
        maxlength: 100
      }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: false,
        validate: {
          validator: function(v) {
            if (!v || v.length === 0) return true;
            return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
          },
          message: 'Invalid coordinates format [longitude, latitude]'
        }
      }
    },
    operatingHours: {
      type: [operatingHoursSchema],
      validate: {
        validator: function(v) {
          if (!v || v.length === 0) return true;
          const days = v.map(h => h.day);
          return days.length === new Set(days).size; // Check for duplicates
        },
        message: 'Duplicate days in operating hours'
      }
    },
    services: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    is24Hours: {
      type: Boolean,
      default: false
    },
    acceptsInsurance: {
      type: Boolean,
      default: true
    },
    deliveryAvailable: {
      type: Boolean,
      default: false
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Website must be a valid URL'
      }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    managerId: {
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

// Geospatial index for location-based queries
pharmacySchema.index({ location: '2dsphere' });

// Compound indexes
pharmacySchema.index({ isActive: 1, name: 1 });
pharmacySchema.index({ 'address.city': 1, isActive: 1 });

// Virtual for full address
pharmacySchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.postalCode}, ${this.address.country}`;
});

// Method to check if pharmacy is currently open
pharmacySchema.methods.isCurrentlyOpen = function() {
  if (this.is24Hours) return true;
  if (!this.operatingHours || this.operatingHours.length === 0) return false;
  
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const todayHours = this.operatingHours.find(h => h.day === currentDay);
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
};

// Method to get operating hours for a specific day
pharmacySchema.methods.getHoursForDay = function(day) {
  if (this.is24Hours) return { isOpen: true, openTime: '00:00', closeTime: '23:59' };
  return this.operatingHours.find(h => h.day === day.toLowerCase());
};

// Static method to find nearby pharmacies
pharmacySchema.statics.findNearby = async function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Static method to find active pharmacies
pharmacySchema.statics.findActive = async function(filters = {}) {
  return this.find({ isActive: true, ...filters })
    .sort({ name: 1 });
};

export default mongoose.model('Pharmacy', pharmacySchema);
