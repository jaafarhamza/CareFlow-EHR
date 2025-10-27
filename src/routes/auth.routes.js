import { Router } from "express";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema, requestResetSchema, verifyResetSchema, applyResetSchema } from "../validations/auth.validation.js";
import authController from "../controllers/auth.controller.js";
import { authLimiter, passwordResetLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
// password reset
router.post("/password/request", passwordResetLimiter, validate(requestResetSchema), authController.requestPassword);
router.post("/password/verify", passwordResetLimiter, validate(verifyResetSchema), authController.verifyReset);
router.post("/password/reset", passwordResetLimiter, validate(applyResetSchema), authController.applyReset);

export default router;
