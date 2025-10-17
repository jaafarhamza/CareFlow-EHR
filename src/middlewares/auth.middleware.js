import { verifyAccessToken } from "../utils/jwt.util.js";
import config from "../config/index.js";
import { ROLES } from "../utils/constants.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Missing token" });
  try {
    req.user = verifyAccessToken(token, config.jwt.accessSecret);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}

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
