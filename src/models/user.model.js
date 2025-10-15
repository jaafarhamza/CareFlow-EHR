import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLE_VALUES, ROLES, USER_STATUS_VALUES, USER_STATUSES } from "../utils/constants.js";

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.PATIENT,
      index: true,
    },
    status: {
      type: String,
      enum: USER_STATUS_VALUES,
      default: USER_STATUSES.ACTIVE,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    // auditing
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // password reset
    resetCodeHash: { 
      type: String, 
      default: null, select: false },
    resetCodeExpiresAt: { 
      type: Date, 
      default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ phone: 1 }, { sparse: true });

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toSafeObject = function () {
  const { passwordHash, __v, ...rest } = this.toObject({ virtuals: true });
  return rest;
};

// Static helpers
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
};

//email normalization
userSchema.pre("save", function (next) {
  if (this.isModified("email") && typeof this.email === "string") {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;


