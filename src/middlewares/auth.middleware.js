import { verifyAccessToken } from "../utils/jwt.util.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Missing token" });
  try {
    req.user = verifyAccessToken(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}
