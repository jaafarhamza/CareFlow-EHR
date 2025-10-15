import { registerUser, loginUser, rotateRefreshToken, logoutUser } from "../services/auth.service.js";
import { requestPasswordReset, verifyPasswordResetCode, applyPasswordReset } from "../services/passwordReset.service.js";
import { verifyRefreshToken } from "../utils/jwt.util.js";
import { parseDurationMs } from "../utils/time.util.js";

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
      res.cookie("refreshToken", refreshToken, { ...cookieOpts, maxAge: parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN) });
      res.json({ success: true, data: { user, accessToken } });
    } catch (e) { next(e); }
  },
  refresh: async (req, res, next) => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) return res.status(401).json({ success: false, message: "Missing refresh token" });
      const payload = verifyRefreshToken(token, process.env.JWT_REFRESH_SECRET);
      const { accessToken, refreshToken } = await rotateRefreshToken(payload, token);
      res.cookie("refreshToken", refreshToken, { ...cookieOpts, maxAge: parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN) });
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
  requestPassword: async (req, res, next) => {
    try {
      const result = await requestPasswordReset(req.body.email);
      if (process.env.NODE_ENV) {
        return res.json({ success: true, data: result });
      }
      res.status(204).end();
    } catch (e) { next(e); }
  },
  verifyReset: async (req, res, next) => {
    try {
      const ok = await verifyPasswordResetCode(req.body.email, req.body.code);
      res.json({ success: ok });
    } catch (e) { next(e); }
  },
  applyReset: async (req, res, next) => {
    try {
      await applyPasswordReset(req.body.email, req.body.code, req.body.newPassword);
      res.status(204).end();
    } catch (e) { next(e); }
  },
};


