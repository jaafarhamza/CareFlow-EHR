import jwt from "jsonwebtoken";

export function signAccessToken(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, { expiresIn });
}

export function signRefreshToken(payload, secret, expiresIn, jti) {
  return jwt.sign({ ...payload, jti }, secret, { expiresIn });
}

export function verifyAccessToken(token, secret) {
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(token, secret) {
  return jwt.verify(token, secret);
}


