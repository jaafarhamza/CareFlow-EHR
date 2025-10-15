import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    tokenHash: { type: String, required: true, unique: true },
    deviceId: { type: String, default: null },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema, "refresh_tokens");
export default RefreshToken;


