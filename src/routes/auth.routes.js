import { Router } from "express";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema, requestResetSchema, verifyResetSchema, applyResetSchema } from "../validations/auth.validation.js";
import authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
// password reset
router.post("/password/request", validate(requestResetSchema), authController.requestPassword);
router.post("/password/verify", validate(verifyResetSchema), authController.verifyReset);
router.post("/password/reset", validate(applyResetSchema), authController.applyReset);

export default router;
