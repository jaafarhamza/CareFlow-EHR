import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { attachPermissions, requirePermissions } from '../middlewares/rbac.middleware.js';
import labOrderController from '../controllers/labOrder.controller.js';
import {
  createLabOrderSchema,
  updateLabOrderSchema,
  cancelLabOrderSchema,
  assignTechnicianSchema,
  getLabOrderByIdSchema,
  getLabOrderByNumberSchema,
  getLabOrdersByPatientSchema,
  getLabOrdersByDoctorSchema,
  getLabOrdersByConsultationSchema,
  getLabOrdersByStatusSchema,
  listLabOrdersQuerySchema,
  getMyLabOrdersQuerySchema,
  getPendingLabOrdersQuerySchema,
  getLabOrdersByStatusQuerySchema
} from '../validations/labOrder.validation.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = Router();

// All routes require authentication
router.use(requireAuth, attachPermissions);

// Get my lab orders (patient or doctor)
router.get(
  '/my',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_SELF),
  validate(getMyLabOrdersQuerySchema, 'query'),
  labOrderController.getMyLabOrders
);

// Get pending lab orders
router.get(
  '/pending',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_ANY),
  validate(getPendingLabOrdersQuerySchema, 'query'),
  labOrderController.getPending
);

// Get urgent lab orders
router.get(
  '/urgent',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_ANY),
  labOrderController.getUrgent
);

// Get statistics
router.get(
  '/stats',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_ANY),
  labOrderController.getStatistics
);

// Create lab order
router.post(
  '/',
  requirePermissions(PERMISSIONS.LAB_ORDER_WRITE_ANY),
  validate(createLabOrderSchema),
  labOrderController.create
);

// List lab orders
router.get(
  '/',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_ANY, PERMISSIONS.LAB_ORDER_READ_SELF),
  validate(listLabOrdersQuerySchema, 'query'),
  labOrderController.list
);

// Get lab order by order number
router.get(
  '/number/:orderNumber',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_ANY, PERMISSIONS.LAB_ORDER_READ_SELF),
  validate(getLabOrderByNumberSchema, 'params'),
  labOrderController.getByOrderNumber
);

// Get lab order by ID
router.get(
  '/:id',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_ANY, PERMISSIONS.LAB_ORDER_READ_SELF),
  validate(getLabOrderByIdSchema, 'params'),
  labOrderController.getById
);

// Update lab order (only pending orders)
router.patch(
  '/:id',
  requirePermissions(PERMISSIONS.LAB_ORDER_WRITE_ANY),
  validate(getLabOrderByIdSchema, 'params'),
  validate(updateLabOrderSchema),
  labOrderController.update
);

// Delete lab order (only pending orders)
router.delete(
  '/:id',
  requirePermissions(PERMISSIONS.LAB_ORDER_WRITE_ANY),
  validate(getLabOrderByIdSchema, 'params'),
  labOrderController.delete
);

// Mark as collected (lab technicians, nurses)
router.post(
  '/:id/collect',
  requirePermissions(PERMISSIONS.LAB_ORDER_WRITE_ANY),
  validate(getLabOrderByIdSchema, 'params'),
  labOrderController.markAsCollected
);

// Start processing (lab technicians only)
router.post(
  '/:id/process',
  requirePermissions(PERMISSIONS.LAB_ORDER_WRITE_ANY),
  validate(getLabOrderByIdSchema, 'params'),
  labOrderController.startProcessing
);

// Mark as completed (lab technicians only)
router.post(
  '/:id/complete',
  requirePermissions(PERMISSIONS.LAB_ORDER_WRITE_ANY),
  validate(getLabOrderByIdSchema, 'params'),
  labOrderController.markAsCompleted
);

// Cancel lab order
router.post(
  '/:id/cancel',
  requirePermissions(PERMISSIONS.LAB_ORDER_WRITE_ANY),
  validate(getLabOrderByIdSchema, 'params'),
  validate(cancelLabOrderSchema),
  labOrderController.cancel
);

// Assign technician
router.post(
  '/:id/assign',
  requirePermissions(PERMISSIONS.LAB_ORDER_WRITE_ANY),
  validate(getLabOrderByIdSchema, 'params'),
  validate(assignTechnicianSchema),
  labOrderController.assignTechnician
);

// Get lab orders by patient ID (staff only)
router.get(
  '/patient/:patientId',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_ANY),
  validate(getLabOrdersByPatientSchema, 'params'),
  validate(getMyLabOrdersQuerySchema, 'query'),
  labOrderController.getByPatient
);

// Get lab orders by doctor ID (staff only)
router.get(
  '/doctor/:doctorId',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_ANY),
  validate(getLabOrdersByDoctorSchema, 'params'),
  validate(getMyLabOrdersQuerySchema, 'query'),
  labOrderController.getByDoctor
);

// Get lab orders by consultation ID
router.get(
  '/consultation/:consultationId',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_ANY, PERMISSIONS.LAB_ORDER_READ_SELF),
  validate(getLabOrdersByConsultationSchema, 'params'),
  labOrderController.getByConsultation
);

// Get lab orders by status
router.get(
  '/status/:status',
  requirePermissions(PERMISSIONS.LAB_ORDER_READ_ANY),
  validate(getLabOrdersByStatusSchema, 'params'),
  validate(getLabOrdersByStatusQuerySchema, 'query'),
  labOrderController.getByStatus
);

export default router;
