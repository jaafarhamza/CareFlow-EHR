
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import googleAuthRoutes from "./googleAuth.routes.js";
import userRoutes from "./user.routes.js";
import roleRoutes from "./role.routes.js";
import patientRoutes from "./patient.routes.js";
import doctorRoutes from "./doctor.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/auth", googleAuthRoutes);
router.use("/admin/users", userRoutes);
router.use("/admin/roles", roleRoutes);
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);

export default router;

