import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { attachPermissions, requirePermissions } from '../middlewares/rbac.middleware.js';
import appointmentController from '../controllers/appointment.controller.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
  completeAppointmentSchema,
  listAppointmentsQuerySchema,
  getAppointmentByIdSchema,
  checkAvailabilitySchema,
  myAppointmentsQuerySchema
} from '../validations/appointment.validation.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = Router();

// Public availability check (requires auth but any role)
router.get(
  '/availability',
  requireAuth,
  attachPermissions,
  validate(checkAvailabilitySchema, 'query'),
  appointmentController.checkAvailability
);

// Patient/Doctor self-access routes
router.get(
  '/my',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_READ_SELF),
  validate(myAppointmentsQuerySchema, 'query'),
  appointmentController.getMyAppointments
);

// Create appointment (staff can create for any patient, patients can create for themselves)
router.post(
  '/',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_WRITE_ANY, PERMISSIONS.APPT_WRITE_SELF),
  validate(createAppointmentSchema),
  appointmentController.create
);

// List appointments (filtered by role in service layer)
router.get(
  '/',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_READ_ANY, PERMISSIONS.APPT_READ_SELF),
  validate(listAppointmentsQuerySchema, 'query'),
  appointmentController.list
);

// Get specific appointment
router.get(
  '/:id',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_READ_ANY, PERMISSIONS.APPT_READ_SELF),
  validate(getAppointmentByIdSchema, 'params'),
  appointmentController.getById
);

// Update appointment
router.patch(
  '/:id',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_WRITE_ANY, PERMISSIONS.APPT_WRITE_SELF),
  validate(getAppointmentByIdSchema, 'params'),
  validate(updateAppointmentSchema),
  appointmentController.update
);

// Cancel appointment
router.patch(
  '/:id/cancel',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_STATUS_CANCEL, PERMISSIONS.APPT_WRITE_SELF),
  validate(getAppointmentByIdSchema, 'params'),
  validate(cancelAppointmentSchema),
  appointmentController.cancel
);

// Complete appointment (doctors and staff only)
router.patch(
  '/:id/complete',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_STATUS_COMPLETE),
  validate(getAppointmentByIdSchema, 'params'),
  validate(completeAppointmentSchema),
  appointmentController.complete
);

// Mark as no-show (doctors and staff only)
router.patch(
  '/:id/no-show',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_STATUS_COMPLETE),
  validate(getAppointmentByIdSchema, 'params'),
  appointmentController.markNoShow
);

// Get doctor's appointments (staff only)
router.get(
  '/doctor/:doctorId',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_READ_ANY),
  validate(myAppointmentsQuerySchema, 'query'),
  appointmentController.getDoctorAppointments
);

// Get patient's appointments (staff only)
router.get(
  '/patient/:patientId',
  requireAuth,
  attachPermissions,
  requirePermissions(PERMISSIONS.APPT_READ_ANY),
  validate(myAppointmentsQuerySchema, 'query'),
  appointmentController.getPatientAppointments
);

export default router;
