import mongoose from "mongoose";
import { EMAIL_REGEX, PHONE_REGEX } from "../utils/constants.js";

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    line1: { type: String, default: null, trim: true },
    line2: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    state: { type: String, default: null, trim: true },
    postalCode: { type: String, default: null, trim: true },
    country: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const contactInfoSchema = new Schema(
  {
    firstName: { type: String, default: null, trim: true },
    lastName: { type: String, default: null, trim: true },
    email: { type: String, default: null, trim: true, lowercase: true, match: EMAIL_REGEX },
    phone: { type: String, default: null, trim: true, match: PHONE_REGEX },
    address: { type: addressSchema, default: undefined },
  },
  { _id: false }
);

const consentsSchema = new Schema(
  {
    dataProcessing: { type: Boolean, default: null },
    marketing: { type: Boolean, default: null },
    care: { type: Boolean, default: null },
  },
  { _id: false }
);

const insuranceSchema = new Schema(
  {
    provider: { type: String, default: null, trim: true },
    policyNumber: { type: String, default: null, trim: true },
    groupNumber: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const emergencyContactSchema = new Schema(
  {
    name: { type: String, default: null, trim: true },
    phone: { type: String, default: null, trim: true },
    relationship: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const preferencesSchema = new Schema(
  {
    language: { type: String, default: null, trim: true },
    communication: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const patientSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },

    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", null], default: null },

    contactInfo: { type: contactInfoSchema, default: undefined },
    consents: { type: consentsSchema, default: undefined },
    insurance: { type: insuranceSchema, default: undefined },
    emergencyContact: { type: emergencyContactSchema, default: undefined },
    preferences: { type: preferencesSchema, default: undefined },

    allergies: { type: [String], default: undefined },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes aligned with migration definitions
patientSchema.index({ userId: 1 }, { unique: true });
patientSchema.index({ "contactInfo.lastName": 1 });
patientSchema.index({ dateOfBirth: 1 });
patientSchema.index({ "contactInfo.lastName": 1, dateOfBirth: 1 }, { name: "by_lastName_dob" });
patientSchema.index(
  {
    "contactInfo.firstName": "text",
    "contactInfo.lastName": "text",
    "contactInfo.email": "text",
    allergies: "text",
  },
  { name: "patient_text_search" }
);

// Normalization hooks
patientSchema.pre("save", function (next) {
  const ci = this.contactInfo;
  if (ci && typeof ci.email === "string") {
    ci.email = ci.email.trim().toLowerCase();
  }
  next();
});

// Instance helpers
patientSchema.methods.toSafeObject = function () {
  const obj = this.toObject({ virtuals: true });
  return obj;
};

const Patient = mongoose.model("Patient", patientSchema, "patients");
export default Patient;
