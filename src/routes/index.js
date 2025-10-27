
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import googleAuthRoutes from "./googleAuth.routes.js";
import userRoutes from "./user.routes.js";
import roleRoutes from "./role.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/auth", googleAuthRoutes);
router.use("/admin/users", userRoutes);
router.use("/admin/roles", roleRoutes);

export default router;

