import { registerUser, loginUser, rotateRefreshToken, logoutUser, } from "../services/auth.service.js";
import { verifyRefreshToken } from "../utils/jwt.util.js";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV,
  sameSite: "strict",
  path: "/api/auth/refresh",
};

export default {
  register: async (req, res, next) => {
    try {
      const user = await registerUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (e) { next(e); }
  },
  login: async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await loginUser(req.body);
      res.cookie("refreshToken", refreshToken, { ...cookieOpts, maxAge: parseCookieMaxAge(process.env.JWT_REFRESH_EXPIRES_IN) });
      res.json({ success: true, data: { user, accessToken } });
    } catch (e) { next(e); }
  },
  refresh: async (req, res, next) => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) return res.status(401).json({ success: false, message: "Missing refresh token" });
      const payload = verifyRefreshToken(token, process.env.JWT_REFRESH_SECRET);
      const { accessToken, refreshToken } = await rotateRefreshToken(payload, token);
      res.cookie("refreshToken", refreshToken, { ...cookieOpts, maxAge: parseCookieMaxAge(process.env.JWT_REFRESH_EXPIRES_IN) });
      res.json({ success: true, data: { accessToken } });
    } catch (e) { e.status = e.status || 401; next(e); }
  },
  logout: async (req, res, next) => {
    try {
      const token = req.cookies?.refreshToken;
      if (token) await logoutUser(token);
      res.clearCookie("refreshToken", cookieOpts);
      res.status(204).end();
    } catch (e) { next(e); }
  },
};

function parseCookieMaxAge(expr) {
  const num = parseInt(expr, 10);
  if (expr.endsWith("ms")) return num;
  if (expr.endsWith("s")) return num * 1000;
  if (expr.endsWith("m")) return num * 60 * 1000;
  if (expr.endsWith("h")) return num * 60 * 60 * 1000;
  if (expr.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  return num;
}


