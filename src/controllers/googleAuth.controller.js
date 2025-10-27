import { handleGoogleLogin } from "../services/googleAuth.service.js";
import { extractDeviceInfo } from "../utils/auth.util.js";
import { parseDurationMs } from "../utils/time.util.js";
import config from "../config/index.js";

const cookieOpts = {
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  path: config.cookie.path,
};

export default {
  googleCallback: async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
        });
      }

      const deviceInfo = extractDeviceInfo(req);
      const { user, accessToken, refreshToken } = await handleGoogleLogin(
        req.user,
        deviceInfo
      );

      res.cookie("refreshToken", refreshToken, {
        ...cookieOpts,
        maxAge: parseDurationMs(config.jwt.refreshTtl),
      });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user,
          accessToken,
        },
      });
    } catch (e) {
      res.clearCookie("refreshToken", cookieOpts);
      next(e);
    }
  },
};
