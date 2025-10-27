import { USER_STATUSES } from './constants.js';
import { ForbiddenError } from './errors.js';

export function validateAccountStatus(user) {
  if (!user || user.status !== USER_STATUSES.ACTIVE || user.isActive === false) {
    throw new ForbiddenError('Account is not active');
  }
}

export function extractDeviceInfo(req) {
  return {
    deviceId: req.headers['x-device-id'] || null,
    ip: req.ip || req.connection.remoteAddress || null,
    userAgent: req.headers['user-agent'] || null
  };
}
