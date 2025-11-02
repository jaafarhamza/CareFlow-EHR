import { Router } from 'express';
import multer from 'multer';
import validate from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { attachPermissions, requirePermissions } from '../middlewares/rbac.middleware.js';
import labResultController from '../controllers/labResult.controller.js';
import {
  createLabResultSchema,
  updateLabResultSchema,
  getLabResultByIdSchema,
  getLabResultByOrderIdSchema,
  getLabResultsByPatientSchema,
  getLabResultsByDoctorSchema,
  getLabResultsByStatusSchema,
  listLabResultsQuerySchema,
  getLabResultsQuerySchema,
  getCriticalLabResultsQuerySchema,
  getPendingValidationQuerySchema,
  getLabResultsByStatusQuerySchema
} from '../validations/labResult.validation.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = Router();

// Configure multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(requireAuth, attachPermissions);

// Get critical lab results
router.get(
  '/critical',
  requirePermissions(PERMISSIONS.LAB_RESULT_READ_ANY),
  validate(getCriticalLabResultsQuerySchema, 'query'),
  labResultController.getCritical
);

// Get pending validation lab results
router.get(
  '/pending-validation',
  requirePermissions(PERMISSIONS.LAB_RESULT_WRITE_ANY),
  validate(getPendingValidationQuerySchema, 'query'),
  labResultController.getPendingValidation
);

// Get statistics
router.get(
  '/stats',
  requirePermissions(PERMISSIONS.LAB_RESULT_READ_ANY),
  labResultController.getStatistics
);

// Create lab result
router.post(
  '/',
  requirePermissions(PERMISSIONS.LAB_RESULT_WRITE_ANY),
  validate(createLabResultSchema),
  labResultController.create
);

// List lab results (filtered by role in service)
router.get(
  '/',
  requirePermissions(PERMISSIONS.LAB_RESULT_READ_ANY, PERMISSIONS.LAB_RESULT_READ_SELF),
  validate(listLabResultsQuerySchema, 'query'),
  labResultController.list
);

// Get lab result by lab order ID
router.get(
  '/order/:labOrderId',
  requirePermissions(PERMISSIONS.LAB_RESULT_READ_ANY, PERMISSIONS.LAB_RESULT_READ_SELF),
  validate(getLabResultByOrderIdSchema, 'params'),
  labResultController.getByOrderId
);

// Get lab result by ID
router.get(
  '/:id',
  requirePermissions(PERMISSIONS.LAB_RESULT_READ_ANY, PERMISSIONS.LAB_RESULT_READ_SELF),
  validate(getLabResultByIdSchema, 'params'),
  labResultController.getById
);

// Update lab result (only draft results)
router.patch(
  '/:id',
  requirePermissions(PERMISSIONS.LAB_RESULT_WRITE_ANY),
  validate(getLabResultByIdSchema, 'params'),
  validate(updateLabResultSchema),
  labResultController.update
);

// Delete lab result (only draft results, admin only)
router.delete(
  '/:id',
  requirePermissions(PERMISSIONS.LAB_RESULT_WRITE_ANY),
  validate(getLabResultByIdSchema, 'params'),
  labResultController.delete
);

// Mark for validation
router.post(
  '/:id/mark-validation',
  requirePermissions(PERMISSIONS.LAB_RESULT_WRITE_ANY),
  validate(getLabResultByIdSchema, 'params'),
  labResultController.markForValidation
);

// Validate lab result
router.post(
  '/:id/validate',
  requirePermissions(PERMISSIONS.LAB_RESULT_VALIDATE),
  validate(getLabResultByIdSchema, 'params'),
  labResultController.validate
);

// Release lab result
router.post(
  '/:id/release',
  requirePermissions(PERMISSIONS.LAB_RESULT_VALIDATE),
  validate(getLabResultByIdSchema, 'params'),
  labResultController.release
);

// Upload PDF report
router.post(
  '/:id/upload-pdf',
  requirePermissions(PERMISSIONS.LAB_RESULT_WRITE_ANY),
  validate(getLabResultByIdSchema, 'params'),
  upload.single('pdf'),
  labResultController.uploadPdf
);

// Get lab results by patient ID (staff only)
router.get(
  '/patient/:patientId',
  requirePermissions(PERMISSIONS.LAB_RESULT_READ_ANY),
  validate(getLabResultsByPatientSchema, 'params'),
  validate(getLabResultsQuerySchema, 'query'),
  labResultController.getByPatient
);

// Get lab results by doctor ID (staff only)
router.get(
  '/doctor/:doctorId',
  requirePermissions(PERMISSIONS.LAB_RESULT_READ_ANY),
  validate(getLabResultsByDoctorSchema, 'params'),
  validate(getLabResultsQuerySchema, 'query'),
  labResultController.getByDoctor
);

// Get lab results by status
router.get(
  '/status/:status',
  requirePermissions(PERMISSIONS.LAB_RESULT_READ_ANY),
  validate(getLabResultsByStatusSchema, 'params'),
  validate(getLabResultsByStatusQuerySchema, 'query'),
  labResultController.getByStatus
);

export default router;
