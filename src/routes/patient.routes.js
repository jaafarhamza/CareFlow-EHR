import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { attachPermissions, requirePermissions, allowSelfOrRoles } from '../middlewares/rbac.middleware.js';
import patientController from '../controllers/patient.controller.js';
import {
  createPatientSchema,
  updatePatientSchema,
  updatePatientSelfSchema,
  listPatientsQuerySchema,
  getPatientByIdSchema
} from '../validations/patient.validation.js';
import { PERMISSIONS, ROLES } from '../utils/constants.js';

const router = Router();

// Patient self-access routes
router.get(
  '/me',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.PATIENT_READ_SELF),
  patientController.getMyProfile
);

router.patch(
  '/me',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.PATIENT_WRITE_SELF),
  validate(updatePatientSelfSchema),
  patientController.updateMyProfile
);

// Admin/Staff routes
router.post(
  '/',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.PATIENT_WRITE_ANY),
  validate(createPatientSchema),
  patientController.create
);

router.get(
  '/',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.PATIENT_READ_ANY),
  validate(listPatientsQuerySchema, 'query'),
  patientController.list
);

router.get(
  '/:id',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.PATIENT_READ_ANY),
  validate(getPatientByIdSchema, 'params'),
  patientController.getById
);

router.patch(
  '/:id',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.PATIENT_WRITE_ANY),
  validate(getPatientByIdSchema, 'params'),
  validate(updatePatientSchema),
  patientController.update
);

router.delete(
  '/:id',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.PATIENT_WRITE_ANY),
  validate(getPatientByIdSchema, 'params'),
  patientController.delete
);

export default router;
