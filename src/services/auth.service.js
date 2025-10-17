import crypto from "crypto";
import userRepo from "../repositories/user.repository.js";
import tokenRepo from "../repositories/refreshToken.repository.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";
import User from "../models/user.model.js";
import { hashSha256 } from "../utils/crypto.util.js";
import { parseDurationMs } from "../utils/time.util.js";
import config from "../config/index.js";

function hashToken(token) { return hashSha256(token); }

export async function registerUser(input) {
  const { firstName, lastName, email, password } = input;
  const passwordHash = await User.hashPassword(password);
  const user = await userRepo.create({ firstName, lastName, email, passwordHash });
  return user;
}

export async function loginUser({ email, password }) {
  const user = await userRepo.findByEmailWithPassword(email);
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

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

  const tokenHash = hashToken(rawRefresh);
  const expiresAt = new Date(Date.now() + parseDurationMs(config.jwt.refreshTtl));
  await tokenRepo.create({ userId: user.id, tokenHash, expiresAt });

  return { user: user.toSafeObject(), accessToken, refreshToken: rawRefresh };
}

export async function rotateRefreshToken(payload, rawToken) {
  const tokenHash = hashToken(rawToken);
  const stored = await tokenRepo.findByTokenHash(tokenHash);
  if (!stored || stored.revokedAt) {
    const err = new Error("Invalid refresh token");
    err.status = 401;
    throw err;
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
  const newHash = hashToken(rawRefresh);
  const expiresAt = new Date(Date.now() + parseDurationMs(config.jwt.refreshTtl));
  await tokenRepo.revokeByHash(tokenHash, newHash);
  await tokenRepo.create({ userId: payload.sub, tokenHash: newHash, expiresAt });

  return { accessToken, refreshToken: rawRefresh };
}

export async function logoutUser(rawToken) {
  const tokenHash = hashToken(rawToken);
  await tokenRepo.revokeByHash(tokenHash);
}


