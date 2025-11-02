import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { attachPermissions, requirePermissions } from '../middlewares/rbac.middleware.js';
import prescriptionController from '../controllers/prescription.controller.js';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  sendToPharmacySchema,
  cancelPrescriptionSchema,
  listPrescriptionsQuerySchema,
  getPrescriptionByIdSchema,
  getPrescriptionsByPatientSchema,
  getPrescriptionsByDoctorSchema,
  getPrescriptionsByPharmacySchema,
  getPrescriptionsByConsultationSchema,
  getMyPrescriptionsQuerySchema,
  getPharmacyPrescriptionsQuerySchema
} from '../validations/prescription.validation.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = Router();

// All routes require authentication
router.use(requireAuth, attachPermissions);

// Get my prescriptions (patient or doctor)
router.get(
  '/my',
  requirePermissions(PERMISSIONS.PRESCRIPTION_READ_SELF),
  validate(getMyPrescriptionsQuerySchema, 'query'),
  prescriptionController.getMyPrescriptions
);

// Create prescription (doctors only)
router.post(
  '/',
  requirePermissions(PERMISSIONS.PRESCRIPTION_WRITE_ANY),
  validate(createPrescriptionSchema),
  prescriptionController.create
);

// List prescriptions (filtered by role in service)
router.get(
  '/',
  requirePermissions(PERMISSIONS.PRESCRIPTION_READ_ANY, PERMISSIONS.PRESCRIPTION_READ_SELF),
  validate(listPrescriptionsQuerySchema, 'query'),
  prescriptionController.list
);

// Get prescription by ID
router.get(
  '/:id',
  requirePermissions(PERMISSIONS.PRESCRIPTION_READ_ANY, PERMISSIONS.PRESCRIPTION_READ_SELF),
  validate(getPrescriptionByIdSchema, 'params'),
  prescriptionController.getById
);

// Update prescription (only draft prescriptions)
router.patch(
  '/:id',
  requirePermissions(PERMISSIONS.PRESCRIPTION_WRITE_ANY),
  validate(getPrescriptionByIdSchema, 'params'),
  validate(updatePrescriptionSchema),
  prescriptionController.update
);

// Delete prescription (only draft prescriptions)
router.delete(
  '/:id',
  requirePermissions(PERMISSIONS.PRESCRIPTION_WRITE_ANY),
  validate(getPrescriptionByIdSchema, 'params'),
  prescriptionController.delete
);

// Sign prescription (doctors only)
router.post(
  '/:id/sign',
  requirePermissions(PERMISSIONS.PRESCRIPTION_WRITE_ANY),
  validate(getPrescriptionByIdSchema, 'params'),
  prescriptionController.sign
);

// Send to pharmacy (doctors, nurses, admins)
router.post(
  '/:id/send',
  requirePermissions(PERMISSIONS.PRESCRIPTION_WRITE_ANY),
  validate(getPrescriptionByIdSchema, 'params'),
  validate(sendToPharmacySchema),
  prescriptionController.sendToPharmacy
);

// Dispense prescription (pharmacists only)
router.post(
  '/:id/dispense',
  requirePermissions(PERMISSIONS.PRESCRIPTION_DISPENSE),
  validate(getPrescriptionByIdSchema, 'params'),
  prescriptionController.dispense
);

// Cancel prescription
router.post(
  '/:id/cancel',
  requirePermissions(PERMISSIONS.PRESCRIPTION_WRITE_ANY),
  validate(getPrescriptionByIdSchema, 'params'),
  validate(cancelPrescriptionSchema),
  prescriptionController.cancel
);

// Get prescriptions by patient ID (staff only)
router.get(
  '/patient/:patientId',
  requirePermissions(PERMISSIONS.PRESCRIPTION_READ_ANY),
  validate(getPrescriptionsByPatientSchema, 'params'),
  validate(getMyPrescriptionsQuerySchema, 'query'),
  prescriptionController.getByPatient
);

// Get active prescriptions for patient
router.get(
  '/patient/:patientId/active',
  requirePermissions(PERMISSIONS.PRESCRIPTION_READ_ANY),
  validate(getPrescriptionsByPatientSchema, 'params'),
  prescriptionController.getActive
);

// Get prescriptions by doctor ID (staff only)
router.get(
  '/doctor/:doctorId',
  requirePermissions(PERMISSIONS.PRESCRIPTION_READ_ANY),
  validate(getPrescriptionsByDoctorSchema, 'params'),
  validate(getMyPrescriptionsQuerySchema, 'query'),
  prescriptionController.getByDoctor
);

// Get prescriptions by pharmacy ID (pharmacists and staff)
router.get(
  '/pharmacy/:pharmacyId',
  requirePermissions(PERMISSIONS.PRESCRIPTION_READ_ANY, PERMISSIONS.PRESCRIPTION_DISPENSE),
  validate(getPrescriptionsByPharmacySchema, 'params'),
  validate(getPharmacyPrescriptionsQuerySchema, 'query'),
  prescriptionController.getByPharmacy
);

// Get prescriptions by consultation ID
router.get(
  '/consultation/:consultationId',
  requirePermissions(PERMISSIONS.PRESCRIPTION_READ_ANY, PERMISSIONS.PRESCRIPTION_READ_SELF),
  validate(getPrescriptionsByConsultationSchema, 'params'),
  prescriptionController.getByConsultation
);

export default router;
