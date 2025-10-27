import AuditLog from '../models/auditLog.model.js';
import logger from '../config/logger.js';

export async function logAudit({ userId, action, ip, userAgent, metadata = {}, success = true }) {
  try {
    await AuditLog.create({ userId, action, ip, userAgent, metadata, success });
  } catch (error) {
    logger.error('Audit log failed:', error);
  }
}

export async function getUserAuditLogs(userId, { page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments({ userId })
  ]);
  return { logs, total, page, limit, pages: Math.ceil(total / limit) };
}
