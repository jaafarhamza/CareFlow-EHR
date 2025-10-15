import crypto from "crypto";
import userRepo from "../repositories/user.repository.js";
import tokenRepo from "../repositories/refreshToken.repository.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";
import User from "../models/user.model.js";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

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
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRES_IN
  );

  const rawRefresh = signRefreshToken(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN,
    crypto.randomUUID()
  );

  const tokenHash = hashToken(rawRefresh);
  const expiresAt = new Date(Date.now() + parseJwtExpiryMs(process.env.JWT_REFRESH_EXPIRES_IN));
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
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRES_IN
  );

  const rawRefresh = signRefreshToken(
    { sub: payload.sub },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN,
    crypto.randomUUID()
  );
  const newHash = hashToken(rawRefresh);
  const expiresAt = new Date(Date.now() + parseJwtExpiryMs(process.env.JWT_REFRESH_EXPIRES_IN));
  await tokenRepo.revokeByHash(tokenHash, newHash);
  await tokenRepo.create({ userId: payload.sub, tokenHash: newHash, expiresAt });

  return { accessToken, refreshToken: rawRefresh };
}

export async function logoutUser(rawToken) {
  const tokenHash = hashToken(rawToken);
  await tokenRepo.revokeByHash(tokenHash);
}

function parseJwtExpiryMs(expr) {
  const num = parseInt(expr, 10);
  if (expr.endsWith("ms")) return num;
  if (expr.endsWith("s")) return num * 1000;
  if (expr.endsWith("m")) return num * 60 * 1000;
  if (expr.endsWith("h")) return num * 60 * 60 * 1000;
  if (expr.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  return num; // default ms
}


