import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_VALUES, ROLES, USER_STATUS_VALUES, USER_STATUSES, AUTH_CONFIG, SALT_ROUNDS } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\+?[1-9]\d{6,14}$/.test(v);
        },
        message: 'Invalid phone format'
      }
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.PATIENT,
      required: true
    },
    status: {
      type: String,
      enum: USER_STATUS_VALUES,
      default: USER_STATUSES.ACTIVE,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    passwordChangedAt: {
      type: Date,
      default: null
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    },
    resetCodeHash: {
      type: String,
      default: null,
      select: false
    },
    resetCodeExpiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.set('autoIndex', false);
userSchema.index({ role: 1, status: 1, isActive: 1 });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ resetCodeHash: 1 }, { sparse: true });
userSchema.index({ lockUntil: 1 }, { sparse: true });

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    if (!this.passwordHash) return false;
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    return false;
  }
};

userSchema.methods.toSafeObject = function () {
  const { passwordHash, resetCodeHash, failedLoginAttempts, lockUntil, ...safe } = this.toObject();
  return safe;
};

userSchema.statics.hashPassword = async function (plainPassword) {
  try {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.incLoginAttempts = async function() {
  try {
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return await this.updateOne({ $set: { failedLoginAttempts: 1 }, $unset: { lockUntil: 1 } });
    }
    const updates = { $inc: { failedLoginAttempts: 1 } };
    const needsLock = this.failedLoginAttempts + 1 >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;
    if (needsLock) updates.$set = { lockUntil: Date.now() + AUTH_CONFIG.LOCK_TIME_MS };
    return await this.updateOne(updates);
  } catch (error) {
    throw new Error('Failed to increment login attempts');
  }
};

userSchema.methods.resetLoginAttempts = async function() {
  try {
    return await this.updateOne({ $set: { failedLoginAttempts: 0 }, $unset: { lockUntil: 1 } });
  } catch (error) {
    throw new Error('Failed to reset login attempts');
  }
};

export default mongoose.model('User', userSchema);
