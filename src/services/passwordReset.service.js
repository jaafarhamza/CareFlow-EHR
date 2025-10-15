import crypto from "crypto";
import User from "../models/user.model.js";
import userRepo from "../repositories/user.repository.js";
import { hashSha256 } from "../utils/crypto.util.js";
import { parseDurationMs } from "../utils/time.util.js";

export async function requestPasswordReset(email) {
  const user = await userRepo.findByEmailWithPassword(email);
  if (!user) {
    if (process.env.NODE_ENV) {
      return { sent: false, reason: "not_found" };
    }
    return { sent: true };
  }
  const code = generateSixDigitCode();
  const resetCodeHash = hashSha256(code);
  const expiresAt = new Date(Date.now() + parseDurationMs(process.env.PASSWORD_RESET_EXPIRES_IN || "15m"));
  await User.updateOne(
    { _id: user._id },
    { $set: { resetCodeHash, resetCodeExpiresAt: expiresAt } },
    { runValidators: true }
  );
  console.log(`[password reset] ${email} code: ${code} expires at ${expiresAt.toISOString()}`);
  return {
    sent: true,
    code: process.env.NODE_ENV ? code : undefined,
    expiresAt,
  };
}

export async function verifyPasswordResetCode(email, code) {
  const user = await userRepo.findByEmailWithPassword(email);
  if (!user) return false;
  const record = await User.findById(user._id).select("resetCodeHash resetCodeExpiresAt");
  if (!record || !record.resetCodeHash || !record.resetCodeExpiresAt) return false;
  if (record.resetCodeExpiresAt.getTime() < Date.now()) return false;
  return record.resetCodeHash === hashSha256(code);
}

export async function applyPasswordReset(email, code, newPassword) {
  const isValid = await verifyPasswordResetCode(email, code);
  if (!isValid) {
    const e = new Error("Invalid or expired code");
    e.status = 400;
    throw e;
  }
  const passwordHash = await User.hashPassword(newPassword);
  await User.updateOne(
    { email },
    { $set: { passwordHash }, $unset: { resetCodeHash: "", resetCodeExpiresAt: "" } },
    { runValidators: true }
  );
}

function generateSixDigitCode() {
  const n = crypto.randomInt(0, 1000000); 
  return n.toString().padStart(6, "0");
}


