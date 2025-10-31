import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { attachPermissions, requirePermissions } from '../middlewares/rbac.middleware.js';
import consultationController from '../controllers/consultation.controller.js';
import {
  createConsultationSchema,
  updateConsultationSchema,
  listConsultationsQuerySchema,
  getConsultationByIdSchema,
  getConsultationsByPatientSchema,
  getConsultationsByDoctorSchema,
  getConsultationByAppointmentSchema,
  getMyConsultationsQuerySchema
} from '../validations/consultation.validation.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = Router();

// All routes require authentication
router.use(requireAuth, attachPermissions);

// Get my consultations (patient or doctor)
router.get(
  '/my',
  requirePermissions(PERMISSIONS.CONSULTATION_READ_SELF),
  validate(getMyConsultationsQuerySchema, 'query'),
  consultationController.getMyConsultations
);

// Create consultation (doctors and staff)
router.post(
  '/',
  requirePermissions(PERMISSIONS.CONSULTATION_WRITE_ANY),
  validate(createConsultationSchema),
  consultationController.create
);

// List consultations (filtered by role in service)
router.get(
  '/',
  requirePermissions(PERMISSIONS.CONSULTATION_READ_ANY, PERMISSIONS.CONSULTATION_READ_SELF),
  validate(listConsultationsQuerySchema, 'query'),
  consultationController.list
);

// Get consultation by ID
router.get(
  '/:id',
  requirePermissions(PERMISSIONS.CONSULTATION_READ_ANY, PERMISSIONS.CONSULTATION_READ_SELF),
  validate(getConsultationByIdSchema, 'params'),
  consultationController.getById
);

// Update consultation
router.patch(
  '/:id',
  requirePermissions(PERMISSIONS.CONSULTATION_WRITE_ANY),
  validate(getConsultationByIdSchema, 'params'),
  validate(updateConsultationSchema),
  consultationController.update
);

// Delete consultation
router.delete(
  '/:id',
  requirePermissions(PERMISSIONS.CONSULTATION_WRITE_ANY),
  validate(getConsultationByIdSchema, 'params'),
  consultationController.delete
);

// Get consultations by patient ID (staff only)
router.get(
  '/patient/:patientId',
  requirePermissions(PERMISSIONS.CONSULTATION_READ_ANY),
  validate(getConsultationsByPatientSchema, 'params'),
  validate(getMyConsultationsQuerySchema, 'query'),
  consultationController.getByPatient
);

// Get consultations by doctor ID (staff only)
router.get(
  '/doctor/:doctorId',
  requirePermissions(PERMISSIONS.CONSULTATION_READ_ANY),
  validate(getConsultationsByDoctorSchema, 'params'),
  validate(getMyConsultationsQuerySchema, 'query'),
  consultationController.getByDoctor
);

// Get consultation by appointment ID
router.get(
  '/appointment/:appointmentId',
  requirePermissions(PERMISSIONS.CONSULTATION_READ_ANY, PERMISSIONS.CONSULTATION_READ_SELF),
  validate(getConsultationByAppointmentSchema, 'params'),
  consultationController.getByAppointment
);

export default router;
