import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_VALUES, ROLES, USER_STATUS_VALUES, USER_STATUSES } from '../utils/constants.js';

const SALT_ROUNDS = 10;

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
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
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
userSchema.index({ role: 1, status: 1, isActive: 1 });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ resetCodeHash: 1 }, { sparse: true });

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toSafeObject = function () {
  const { passwordHash, resetCodeHash, ...safe } = this.toObject();
  return safe;
};

userSchema.statics.hashPassword = async function (plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export default mongoose.model('User', userSchema);
