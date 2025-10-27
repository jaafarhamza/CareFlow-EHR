import crypto from "crypto";
import userRepo from "../repositories/user.repository.js";
import tokenRepo from "../repositories/refreshToken.repository.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";
import User from "../models/user.model.js";
import { hashSha256 } from "../utils/crypto.util.js";
import { parseDurationMs } from "../utils/time.util.js";
import { validateAccountStatus } from "../utils/auth.util.js";
import { AuthError, RateLimitError } from "../utils/errors.js";
import { logAudit } from "./audit.service.js";
import { AUDIT_ACTIONS } from "../utils/constants.js";
import config from "../config/index.js";

export async function registerUser(input) {
  const { firstName, lastName, email, password } = input;
  const passwordHash = await User.hashPassword(password);
  const user = await userRepo.create({ firstName, lastName, email, passwordHash });
  return user;
}

export async function loginUser({ email, password }, deviceInfo = {}) {
  const user = await userRepo.findByEmailWithPassword(email);
  if (!user) {
    await logAudit({ action: AUDIT_ACTIONS.LOGIN_FAILED, ...deviceInfo, metadata: { email } });
    throw new AuthError('Invalid credentials');
  }

  if (user.isLocked) {
    await logAudit({ userId: user.id, action: AUDIT_ACTIONS.ACCOUNT_LOCKED, ...deviceInfo });
    throw new RateLimitError('Account temporarily locked due to too many failed attempts');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incLoginAttempts();
    await logAudit({ userId: user.id, action: AUDIT_ACTIONS.LOGIN_FAILED, ...deviceInfo, success: false });
    throw new AuthError('Invalid credentials');
  }

  validateAccountStatus(user);

  if (user.failedLoginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  await userRepo.updateById(user.id, { lastLoginAt: new Date() });
  await logAudit({ userId: user.id, action: AUDIT_ACTIONS.LOGIN_SUCCESS, ...deviceInfo });

  const accessToken = signAccessToken(
    { sub: user.id, role: user.role },
    config.jwt.accessSecret,
    config.jwt.accessTtl
  );

  const rawRefresh = signRefreshToken(
    { sub: user.id },
    config.jwt.refreshSecret,
    config.jwt.refreshTtl,
    crypto.randomUUID()
  );

  const tokenHash = hashSha256(rawRefresh);
  const expiresAt = new Date(Date.now() + parseDurationMs(config.jwt.refreshTtl));
  await tokenRepo.create({ 
    userId: user.id, 
    tokenHash, 
    expiresAt,
    ...deviceInfo
  });

  return { user: user.toSafeObject(), accessToken, refreshToken: rawRefresh };
}

export async function rotateRefreshToken(payload, rawToken, deviceInfo = {}) {
  const tokenHash = hashSha256(rawToken);
  const stored = await tokenRepo.findByTokenHash(tokenHash);
  if (!stored || stored.revokedAt) {
    throw new AuthError('Invalid refresh token');
  }

  const user = await userRepo.findById(stored.userId);
  if (!user) throw new AuthError('User not found');
  
  try {
    validateAccountStatus(user);
  } catch (error) {
    await tokenRepo.revokeByHash(tokenHash);
    throw error;
  }

  const accessToken = signAccessToken(
    { sub: payload.sub },
    config.jwt.accessSecret,
    config.jwt.accessTtl
  );

  const rawRefresh = signRefreshToken(
    { sub: payload.sub },
    config.jwt.refreshSecret,
    config.jwt.refreshTtl,
    crypto.randomUUID()
  );
  const newHash = hashSha256(rawRefresh);
  const expiresAt = new Date(Date.now() + parseDurationMs(config.jwt.refreshTtl));
  await tokenRepo.revokeByHash(tokenHash, newHash);
  await tokenRepo.create({ 
    userId: payload.sub, 
    tokenHash: newHash, 
    expiresAt,
    ...deviceInfo
  });

  return { accessToken, refreshToken: rawRefresh };
}

export async function logoutUser(rawToken, deviceInfo = {}) {
  const tokenHash = hashSha256(rawToken);
  const stored = await tokenRepo.findByTokenHash(tokenHash);
  await tokenRepo.revokeByHash(tokenHash);
  
  if (stored?.userId) {
    await logAudit({ userId: stored.userId, action: AUDIT_ACTIONS.LOGOUT, ...deviceInfo });
  }
}


