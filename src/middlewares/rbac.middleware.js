import { ROLES } from "../utils/constants.js";
import rolesRepo from "../repositories/role.repository.js";

export function requireRoles(...allowedRoles) {
  const allowed = new Set(allowedRoles.length ? allowedRoles : [ROLES.ADMIN]);
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!req.user.role || !allowed.has(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

const permissionsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function attachPermissions(req, res, next) {
  try {
    if (!req.user?.role) return next();
    
    const cached = permissionsCache.get(req.user.role);
    const isCacheValid = cached && (Date.now() - cached.timestamp) < CACHE_TTL;
    
    if (isCacheValid) {
      req.user.permissions = new Set(cached.perms);
      return next();
    }
    
    const perms = await rolesRepo.getPermissionsByName(req.user.role);
    permissionsCache.set(req.user.role, { perms, timestamp: Date.now() });
    req.user.permissions = new Set(perms);
    next();
  } catch (e) {
    next(e);
  }
}

export function requirePermissions(...needed) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      if (!req.user.permissions) {
        const perms = await rolesRepo.getPermissionsByName(req.user.role);
        req.user.permissions = new Set(perms);
      }
      const ok = needed.every((p) => req.user.permissions.has(p));
      if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function allowSelfOrRoles({ getOwnerId, roles = [] }) {
  const allowed = new Set(roles);
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (allowed.has(req.user.role)) return next();
    const ownerId = getOwnerId?.(req);
    if (ownerId && String(ownerId) === String(req.user.sub)) return next();
    return res.status(403).json({ success: false, message: "Forbidden" });
  };
}
