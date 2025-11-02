import { Router } from 'express';
import multer from 'multer';
import validate from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { attachPermissions, requirePermissions } from '../middlewares/rbac.middleware.js';
import documentController from '../controllers/document.controller.js';
import {
  uploadDocumentSchema,
  updateDocumentSchema,
  deleteDocumentSchema,
  verifyDocumentSchema,
  addTagsSchema,
  removeTagsSchema,
  getDocumentByIdSchema,
  getDocumentsByPatientSchema,
  getDocumentsByTypeSchema,
  listDocumentsQuerySchema,
  getDocumentsQuerySchema,
  getByTagsQuerySchema,
  generatePresignedUrlQuerySchema
} from '../validations/document.validation.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common medical document formats
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, Word, and Excel files are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(requireAuth, attachPermissions);

// Get unverified documents
router.get(
  '/unverified',
  requirePermissions(PERMISSIONS.DOCUMENT_VERIFY),
  validate(getDocumentsQuerySchema, 'query'),
  documentController.getUnverified
);

// Get statistics
router.get(
  '/stats',
  requirePermissions(PERMISSIONS.DOCUMENT_READ_ANY),
  documentController.getStatistics
);

// Get documents by tags
router.get(
  '/tags',
  requirePermissions(PERMISSIONS.DOCUMENT_READ_ANY, PERMISSIONS.DOCUMENT_READ_SELF),
  validate(getByTagsQuerySchema, 'query'),
  documentController.getByTags
);

// Upload document
router.post(
  '/',
  requirePermissions(PERMISSIONS.DOCUMENT_WRITE_ANY),
  upload.single('file'),
  validate(uploadDocumentSchema),
  documentController.upload
);

// List documents (filtered by role in service)
router.get(
  '/',
  requirePermissions(PERMISSIONS.DOCUMENT_READ_ANY, PERMISSIONS.DOCUMENT_READ_SELF),
  validate(listDocumentsQuerySchema, 'query'),
  documentController.list
);

// Get document by ID
router.get(
  '/:id',
  requirePermissions(PERMISSIONS.DOCUMENT_READ_ANY, PERMISSIONS.DOCUMENT_READ_SELF),
  validate(getDocumentByIdSchema, 'params'),
  documentController.getById
);

// Update document
router.patch(
  '/:id',
  requirePermissions(PERMISSIONS.DOCUMENT_WRITE_ANY),
  validate(getDocumentByIdSchema, 'params'),
  validate(updateDocumentSchema),
  documentController.update
);

// Soft delete document
router.delete(
  '/:id',
  requirePermissions(PERMISSIONS.DOCUMENT_WRITE_ANY),
  validate(getDocumentByIdSchema, 'params'),
  validate(deleteDocumentSchema),
  documentController.delete
);

// Restore deleted document (admin only)
router.post(
  '/:id/restore',
  requirePermissions(PERMISSIONS.DOCUMENT_WRITE_ANY),
  validate(getDocumentByIdSchema, 'params'),
  documentController.restore
);

// Permanently delete document (admin only)
router.delete(
  '/:id/permanent',
  requirePermissions(PERMISSIONS.DOCUMENT_WRITE_ANY),
  validate(getDocumentByIdSchema, 'params'),
  documentController.permanentlyDelete
);

// Verify document
router.post(
  '/:id/verify',
  requirePermissions(PERMISSIONS.DOCUMENT_VERIFY),
  validate(getDocumentByIdSchema, 'params'),
  validate(verifyDocumentSchema),
  documentController.verify
);

// Unverify document (admin only)
router.post(
  '/:id/unverify',
  requirePermissions(PERMISSIONS.DOCUMENT_VERIFY),
  validate(getDocumentByIdSchema, 'params'),
  documentController.unverify
);

// Download document
router.get(
  '/:id/download',
  requirePermissions(PERMISSIONS.DOCUMENT_READ_ANY, PERMISSIONS.DOCUMENT_READ_SELF),
  validate(getDocumentByIdSchema, 'params'),
  documentController.download
);

// Generate presigned URL
router.get(
  '/:id/presigned-url',
  requirePermissions(PERMISSIONS.DOCUMENT_READ_ANY, PERMISSIONS.DOCUMENT_READ_SELF),
  validate(getDocumentByIdSchema, 'params'),
  validate(generatePresignedUrlQuerySchema, 'query'),
  documentController.generatePresignedUrl
);

// Add tags
router.post(
  '/:id/tags',
  requirePermissions(PERMISSIONS.DOCUMENT_WRITE_ANY),
  validate(getDocumentByIdSchema, 'params'),
  validate(addTagsSchema),
  documentController.addTags
);

// Remove tags
router.delete(
  '/:id/tags',
  requirePermissions(PERMISSIONS.DOCUMENT_WRITE_ANY),
  validate(getDocumentByIdSchema, 'params'),
  validate(removeTagsSchema),
  documentController.removeTags
);

// Get documents by patient ID (staff only)
router.get(
  '/patient/:patientId',
  requirePermissions(PERMISSIONS.DOCUMENT_READ_ANY),
  validate(getDocumentsByPatientSchema, 'params'),
  validate(getDocumentsQuerySchema, 'query'),
  documentController.getByPatient
);

// Get documents by type
router.get(
  '/type/:type',
  requirePermissions(PERMISSIONS.DOCUMENT_READ_ANY),
  validate(getDocumentsByTypeSchema, 'params'),
  validate(getDocumentsQuerySchema, 'query'),
  documentController.getByType
);

export default router;
