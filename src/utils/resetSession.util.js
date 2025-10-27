import redis from '../config/redis.js';
import crypto from 'crypto';

const SESSION_EXPIRY = 15 * 60; // 15 minutes in seconds
const SESSION_PREFIX = 'reset_session:';

export async function createResetSession(email, code) {
  try {
    const sessionId = generateSessionId();
    const key = SESSION_PREFIX + sessionId;
    const { hashSha256 } = await import('./crypto.util.js');
    
    await redis.setex(
      key,
      SESSION_EXPIRY,
      JSON.stringify({ email, codeHash: hashSha256(code) })
    );
    
    return sessionId;
  } catch (error) {
    throw new Error('Failed to create reset session');
  }
}

export async function getResetSession(sessionId) {
  try {
    const key = SESSION_PREFIX + sessionId;
    const data = await redis.get(key);
    
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export async function validateResetSession(sessionId, code) {
  try {
    const session = await getResetSession(sessionId);
    if (!session) return null;
    
    const { hashSha256 } = await import('./crypto.util.js');
    if (session.codeHash !== hashSha256(code)) return null;
    
    return session.email;
  } catch (error) {
    return null;
  }
}

export async function deleteResetSession(sessionId) {
  try {
    const key = SESSION_PREFIX + sessionId;
    await redis.del(key);
  } catch (error) {
    // cleanup
  }
}

function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}
