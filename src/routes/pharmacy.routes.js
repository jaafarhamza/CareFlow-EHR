import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { attachPermissions, requirePermissions } from '../middlewares/rbac.middleware.js';
import pharmacyController from '../controllers/pharmacy.controller.js';
import {
  createPharmacySchema,
  updatePharmacySchema,
  listPharmaciesQuerySchema,
  getPharmacyByIdSchema,
  findNearbyPharmaciesSchema,
  findByCitySchema,
  getActivePharmaciesSchema
} from '../validations/pharmacy.validation.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = Router();

// Public routes 
// Find nearby pharmacies (geolocation search)
router.get(
  '/nearby',
  validate(findNearbyPharmaciesSchema, 'query'),
  pharmacyController.findNearby
);

// Get active pharmacies
router.get(
  '/active',
  validate(getActivePharmaciesSchema, 'query'),
  pharmacyController.getActive
);

// Find pharmacies by city
router.get(
  '/city/:city',
  validate(findByCitySchema, 'params'),
  pharmacyController.findByCity
);

// List pharmacies (with filters)
router.get(
  '/',
  validate(listPharmaciesQuerySchema, 'query'),
  pharmacyController.list
);

// Get pharmacy by ID
router.get(
  '/:id',
  validate(getPharmacyByIdSchema, 'params'),
  pharmacyController.getById
);

// Protected routes (authentication required)
router.use(requireAuth, attachPermissions);

// Get pharmacy statistics (admin only)
router.get(
  '/admin/stats',
  requirePermissions(PERMISSIONS.PHARMACY_READ_ANY),
  pharmacyController.getStats
);

// Create pharmacy (admin only)
router.post(
  '/',
  requirePermissions(PERMISSIONS.PHARMACY_WRITE_ANY),
  validate(createPharmacySchema),
  pharmacyController.create
);

// Update pharmacy (admin or pharmacy manager)
router.patch(
  '/:id',
  requirePermissions(PERMISSIONS.PHARMACY_WRITE_ANY),
  validate(getPharmacyByIdSchema, 'params'),
  validate(updatePharmacySchema),
  pharmacyController.update
);

// Delete pharmacy (admin only)
router.delete(
  '/:id',
  requirePermissions(PERMISSIONS.PHARMACY_WRITE_ANY),
  validate(getPharmacyByIdSchema, 'params'),
  pharmacyController.delete
);

// Deactivate pharmacy (admin only)
router.post(
  '/:id/deactivate',
  requirePermissions(PERMISSIONS.PHARMACY_WRITE_ANY),
  validate(getPharmacyByIdSchema, 'params'),
  pharmacyController.deactivate
);

// Activate pharmacy (admin only)
router.post(
  '/:id/activate',
  requirePermissions(PERMISSIONS.PHARMACY_WRITE_ANY),
  validate(getPharmacyByIdSchema, 'params'),
  pharmacyController.activate
);

export default router;
