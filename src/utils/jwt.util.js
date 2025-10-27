import jwt from "jsonwebtoken";

export function signAccessToken(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, { 
    expiresIn,
    algorithm: 'HS256',
    issuer: 'careflow-ehr',
    audience: 'careflow-api'
  });
}

export function signRefreshToken(payload, secret, expiresIn, jti) {
  return jwt.sign({ ...payload, jti }, secret, { 
    expiresIn,
    algorithm: 'HS256',
    issuer: 'careflow-ehr',
    audience: 'careflow-api'
  });
}

export function verifyAccessToken(token, secret) {
  try {
    return jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'careflow-ehr',
      audience: 'careflow-api'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function verifyRefreshToken(token, secret) {
  try {
    return jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'careflow-ehr',
      audience: 'careflow-api'
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}


