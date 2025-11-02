
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import googleAuthRoutes from "./googleAuth.routes.js";
import userRoutes from "./user.routes.js";
import roleRoutes from "./role.routes.js";
import patientRoutes from "./patient.routes.js";
import doctorRoutes from "./doctor.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import consultationRoutes from "./consultation.routes.js";
import prescriptionRoutes from "./prescription.routes.js";
import pharmacyRoutes from "./pharmacy.routes.js";
import labOrderRoutes from "./labOrder.routes.js";
import labResultRoutes from "./labResult.routes.js";
import testRoutes from "./test.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/auth", googleAuthRoutes);
router.use("/admin/users", userRoutes);
router.use("/admin/roles", roleRoutes);
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/consultations", consultationRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/pharmacies", pharmacyRoutes);
router.use("/lab-orders", labOrderRoutes);
router.use("/lab-results", labResultRoutes);
router.use("/test", testRoutes);  // Test endpoints 
export default router;

