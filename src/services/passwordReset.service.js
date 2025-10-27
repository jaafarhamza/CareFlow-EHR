import crypto from "crypto";
import User from "../models/user.model.js";
import userRepo from "../repositories/user.repository.js";
import { hashSha256 } from "../utils/crypto.util.js";
import { parseDurationMs } from "../utils/time.util.js";
import { ValidationError } from "../utils/errors.js";
import { addEmailToQueue } from "../queues/email.queue.js";
import { logAudit } from "./audit.service.js";
import { AUDIT_ACTIONS } from "../utils/constants.js";
import logger from "../config/logger.js";
import config from "../config/index.js";

export async function requestPasswordReset(email, deviceInfo = {}) {
  const user = await userRepo.findByEmailWithPassword(email);
  
  if (!user) {
    if (config.env !== 'production') {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
    }
    return { sent: true };
  }
  
  await logAudit({ userId: user.id, action: AUDIT_ACTIONS.PASSWORD_RESET_REQUEST, ...deviceInfo });
  
  const code = generateSixDigitCode();
  const resetCodeHash = hashSha256(code);
  const expiresAt = new Date(Date.now() + parseDurationMs(config.passwordResetTtl));
  
  const result = await User.updateOne(
    { _id: user._id },
    { $set: { resetCodeHash, resetCodeExpiresAt: expiresAt } },
    { runValidators: true }
  );
  
  if (result.matchedCount === 0) {
    throw new ValidationError('Failed to set reset code');
  }
  
  const resetLink = `${config.clientUrl}/reset-password?code=${code}&email=${encodeURIComponent(email)}`;
  
  await addEmailToQueue('password-reset', { email, code, resetLink });
  
  logger.info(`Password reset email sent to ${email}`);
  
  return { sent: true };
}

export async function verifyPasswordResetCode(code) {
  const codeHash = hashSha256(code);
  const user = await User.findOne({
    resetCodeHash: codeHash,
    resetCodeExpiresAt: { $gt: new Date() }
  }).select('email');
  
  return user?.email || null;
}

export async function applyPasswordReset(email, newPassword, deviceInfo = {}) {
  const user = await userRepo.findByEmailWithPassword(email);
  if (!user) throw new ValidationError('User not found');
  
  const passwordHash = await User.hashPassword(newPassword);
  
  const result = await User.updateOne(
    { email },
    { 
      $set: { passwordHash, passwordChangedAt: new Date() }, 
      $unset: { resetCodeHash: "", resetCodeExpiresAt: "", lockUntil: "", failedLoginAttempts: "" } 
    },
    { runValidators: true }
  );
  
  if (result.matchedCount === 0) {
    throw new ValidationError('Failed to update password');
  }
  
  await logAudit({ userId: user.id, action: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETE, ...deviceInfo });
  logger.info(`Password reset completed for ${email}`);
}

function generateSixDigitCode() {
  const n = crypto.randomInt(0, 1000000); 
  return n.toString().padStart(6, "0");
}


