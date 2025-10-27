import crypto from 'crypto';
import { signAccessToken, signRefreshToken } from '../utils/jwt.util.js';
import { hashSha256 } from '../utils/crypto.util.js';
import { parseDurationMs } from '../utils/time.util.js';
import { validateAccountStatus } from '../utils/auth.util.js';
import tokenRepo from '../repositories/refreshToken.repository.js';
import userRepo from '../repositories/user.repository.js';
import config from '../config/index.js';

export async function handleGoogleLogin(user, deviceInfo = {}) {
  validateAccountStatus(user);

  await userRepo.updateById(user.id, { lastLoginAt: new Date() });

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
    ...deviceInfo,
  });

  return { user: user.toSafeObject(), accessToken, refreshToken: rawRefresh };
}
