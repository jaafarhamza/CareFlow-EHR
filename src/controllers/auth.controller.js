import { registerUser, loginUser, rotateRefreshToken, logoutUser } from "../services/auth.service.js";
import { requestPasswordReset, verifyPasswordResetCode, applyPasswordReset } from "../services/passwordReset.service.js";
import { verifyRefreshToken } from "../utils/jwt.util.js";
import { parseDurationMs } from "../utils/time.util.js";
import { extractDeviceInfo } from "../utils/auth.util.js";
import { createResetSession, getResetSession, deleteResetSession } from "../utils/resetSession.util.js";
import config from "../config/index.js";

const cookieOpts = {
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  path: config.cookie.path,
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
      const deviceInfo = extractDeviceInfo(req);
      const { user, accessToken, refreshToken } = await loginUser(req.body, deviceInfo);
      res.cookie("refreshToken", refreshToken, { ...cookieOpts, maxAge: parseDurationMs(config.jwt.refreshTtl) });
      res.json({ success: true, data: { user, accessToken } });
    } catch (e) { next(e); }
  },
  refresh: async (req, res, next) => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) return res.status(401).json({ success: false, message: "Missing refresh token" });
      const payload = verifyRefreshToken(token, config.jwt.refreshSecret);
      const deviceInfo = extractDeviceInfo(req);
      const { accessToken, refreshToken } = await rotateRefreshToken(payload, token, deviceInfo);
      res.cookie("refreshToken", refreshToken, { ...cookieOpts, maxAge: parseDurationMs(config.jwt.refreshTtl) });
      res.json({ success: true, data: { accessToken } });
    } catch (e) { e.status = e.status || 401; next(e); }
  },
  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const deviceInfo = extractDeviceInfo(req);
      
      if (refreshToken) await logoutUser(refreshToken, deviceInfo);
      res.clearCookie("refreshToken", cookieOpts);
      res.status(204).end();
    } catch (e) { next(e); }
  },
  requestPassword: async (req, res, next) => {
    try {
      const deviceInfo = extractDeviceInfo(req);
      await requestPasswordReset(req.body.email, deviceInfo);
      res.json({ 
        success: true, 
        message: 'If the email exists, a password reset code has been sent' 
      });
    } catch (e) { next(e); }
  },
  verifyReset: async (req, res, next) => {
    try {
      const email = await verifyPasswordResetCode(req.body.code);
      if (!email) {
        return res.status(400).json({ success: false, message: 'Invalid or expired code' });
      }
      const sessionId = await createResetSession(email, req.body.code);
      res.cookie('resetSession', sessionId, {
        httpOnly: true,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        maxAge: 15 * 60 * 1000
      });
      res.json({ success: true, message: 'Code verified successfully' });
    } catch (e) { next(e); }
  },
  applyReset: async (req, res, next) => {
    try {
      const sessionId = req.cookies?.resetSession;
      if (!sessionId) {
        return res.status(401).json({ success: false, message: 'Please verify code first' });
      }
      const { validateResetSession } = await import('../utils/resetSession.util.js');
      const email = await validateResetSession(sessionId, req.body.code);
      if (!email) {
        return res.status(401).json({ success: false, message: 'Invalid session' });
      }
      const deviceInfo = extractDeviceInfo(req);
      await applyPasswordReset(email, req.body.newPassword, deviceInfo);
      await deleteResetSession(sessionId);
      res.clearCookie('resetSession');
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (e) {
      res.clearCookie('resetSession');
      next(e);
    }
  },
};


