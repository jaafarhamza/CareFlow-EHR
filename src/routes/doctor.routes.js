import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { attachPermissions, requirePermissions } from '../middlewares/rbac.middleware.js';
import doctorController from '../controllers/doctor.controller.js';
import {
  createDoctorSchema,
  updateDoctorSchema,
  updateDoctorSelfSchema,
  listDoctorsQuerySchema,
  getDoctorByIdSchema
} from '../validations/doctor.validation.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = Router();

// Doctor self-access routes
router.get(
  '/me',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.DOCTOR_READ_SELF),
  doctorController.getMyProfile
);

router.patch(
  '/me',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.DOCTOR_WRITE_SELF),
  validate(updateDoctorSelfSchema),
  doctorController.updateMyProfile
);

// Public/Patient routes - list available doctors
router.get(
  '/',
  validate(listDoctorsQuerySchema, 'query'),
  doctorController.list
);

router.get(
  '/:id',
  validate(getDoctorByIdSchema, 'params'),
  doctorController.getById
);

// Admin/Staff routes
router.post(
  '/',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.DOCTOR_WRITE_ANY),
  validate(createDoctorSchema),
  doctorController.create
);

router.patch(
  '/:id',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.DOCTOR_WRITE_ANY),
  validate(getDoctorByIdSchema, 'params'),
  validate(updateDoctorSchema),
  doctorController.update
);

router.delete(
  '/:id',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.DOCTOR_WRITE_ANY),
  validate(getDoctorByIdSchema, 'params'),
  doctorController.delete
);

export default router;
