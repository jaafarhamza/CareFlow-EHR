import { verifyAccessToken } from "../utils/jwt.util.js";
import userRepo from "../repositories/user.repository.js";
import { validateAccountStatus } from "../utils/auth.util.js";
import config from "../config/index.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: "Missing token" });
    
    const payload = verifyAccessToken(token, config.jwt.accessSecret);
    const user = await userRepo.findById(payload.sub);
    
    if (!user) return res.status(401).json({ success: false, message: "Invalid token" });
    
    validateAccountStatus(user);
    if (user.isLocked) return res.status(401).json({ success: false, message: "Account locked" });
    
    req.user = { sub: user.id, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}
