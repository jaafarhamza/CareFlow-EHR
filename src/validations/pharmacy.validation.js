import Joi from 'joi';

const operatingHoursSchema = Joi.object({
  day: Joi.string().required().valid(
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ).messages({
    'any.required': 'Day is required',
    'any.only': 'Invalid day of week'
  }),
  isOpen: Joi.boolean().default(true),
  openTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).when('isOpen', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.pattern.base': 'Open time must be in HH:MM format (e.g., 09:00)',
    'any.required': 'Open time is required when pharmacy is open'
  }),
  closeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).when('isOpen', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.pattern.base': 'Close time must be in HH:MM format (e.g., 18:00)',
    'any.required': 'Close time is required when pharmacy is open'
  })
});

const addressSchema = Joi.object({
  street: Joi.string().required().trim().min(5).max(200).messages({
    'string.empty': 'Street address is required',
    'string.min': 'Street address must be at least 5 characters',
    'string.max': 'Street address must not exceed 200 characters'
  }),
  city: Joi.string().required().trim().min(2).max(100).messages({
    'string.empty': 'City is required',
    'string.min': 'City must be at least 2 characters',
    'string.max': 'City must not exceed 100 characters'
  }),
  state: Joi.string().required().trim().min(2).max(100).messages({
    'string.empty': 'State is required',
    'string.min': 'State must be at least 2 characters',
    'string.max': 'State must not exceed 100 characters'
  }),
  postalCode: Joi.string().required().trim().max(20).messages({
    'string.empty': 'Postal code is required',
    'string.max': 'Postal code must not exceed 20 characters'
  }),
  country: Joi.string().required().trim().min(2).max(100).messages({
    'string.empty': 'Country is required',
    'string.min': 'Country must be at least 2 characters',
    'string.max': 'Country must not exceed 100 characters'
  })
});

const locationSchema = Joi.object({
  type: Joi.string().valid('Point').default('Point'),
  coordinates: Joi.array().items(Joi.number()).length(2).custom((value, helpers) => {
    const [longitude, latitude] = value;
    if (longitude < -180 || longitude > 180) {
      return helpers.error('any.invalid', { message: 'Longitude must be between -180 and 180' });
    }
    if (latitude < -90 || latitude > 90) {
      return helpers.error('any.invalid', { message: 'Latitude must be between -90 and 90' });
    }
    return value;
  }).messages({
    'array.length': 'Coordinates must be [longitude, latitude]',
    'any.invalid': '{{#message}}'
  })
});

export const createPharmacySchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(200).messages({
    'string.empty': 'Pharmacy name is required',
    'string.min': 'Pharmacy name must be at least 2 characters',
    'string.max': 'Pharmacy name must not exceed 200 characters'
  }),
  licenseNumber: Joi.string().required().trim().messages({
    'string.empty': 'License number is required'
  }),
  email: Joi.string().required().trim().lowercase().email().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format'
  }),
  phone: Joi.string().required().trim().pattern(/^[\d\s\-\+\(\)]+$/).messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Invalid phone number format'
  }),
  alternatePhone: Joi.string().trim().pattern(/^[\d\s\-\+\(\)]+$/).messages({
    'string.pattern.base': 'Invalid alternate phone number format'
  }),
  address: addressSchema.required(),
  location: locationSchema,
  operatingHours: Joi.array().items(operatingHoursSchema).custom((value, helpers) => {
    if (!value || value.length === 0) return value;
    const days = value.map(h => h.day);
    const uniqueDays = new Set(days);
    if (days.length !== uniqueDays.size) {
      return helpers.error('any.invalid', { message: 'Duplicate days in operating hours' });
    }
    return value;
  }).messages({
    'any.invalid': '{{#message}}'
  }),
  services: Joi.array().items(Joi.string().trim()),
  isActive: Joi.boolean().default(true),
  is24Hours: Joi.boolean().default(false),
  acceptsInsurance: Joi.boolean().default(true),
  deliveryAvailable: Joi.boolean().default(false),
  website: Joi.string().trim().uri().messages({
    'string.uri': 'Website must be a valid URL'
  }),
  notes: Joi.string().trim().max(1000).messages({
    'string.max': 'Notes must not exceed 1000 characters'
  }),
  managerId: Joi.string().hex().length(24).messages({
    'string.length': 'Invalid manager ID format'
  })
});

export const updatePharmacySchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).messages({
    'string.min': 'Pharmacy name must be at least 2 characters',
    'string.max': 'Pharmacy name must not exceed 200 characters'
  }),
  licenseNumber: Joi.string().trim(),
  email: Joi.string().trim().lowercase().email().messages({
    'string.email': 'Invalid email format'
  }),
  phone: Joi.string().trim().pattern(/^[\d\s\-\+\(\)]+$/).messages({
    'string.pattern.base': 'Invalid phone number format'
  }),
  alternatePhone: Joi.string().trim().pattern(/^[\d\s\-\+\(\)]+$/).messages({
    'string.pattern.base': 'Invalid alternate phone number format'
  }),
  address: addressSchema,
  location: locationSchema,
  operatingHours: Joi.array().items(operatingHoursSchema).custom((value, helpers) => {
    if (!value || value.length === 0) return value;
    const days = value.map(h => h.day);
    const uniqueDays = new Set(days);
    if (days.length !== uniqueDays.size) {
      return helpers.error('any.invalid', { message: 'Duplicate days in operating hours' });
    }
    return value;
  }).messages({
    'any.invalid': '{{#message}}'
  }),
  services: Joi.array().items(Joi.string().trim()),
  isActive: Joi.boolean(),
  is24Hours: Joi.boolean(),
  acceptsInsurance: Joi.boolean(),
  deliveryAvailable: Joi.boolean(),
  website: Joi.string().trim().uri().messages({
    'string.uri': 'Website must be a valid URL'
  }),
  notes: Joi.string().trim().max(1000).messages({
    'string.max': 'Notes must not exceed 1000 characters'
  }),
  managerId: Joi.string().hex().length(24).messages({
    'string.length': 'Invalid manager ID format'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const listPharmaciesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('name', 'createdAt', 'city').default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  isActive: Joi.boolean(),
  city: Joi.string().trim().min(2),
  state: Joi.string().trim().min(2),
  country: Joi.string().trim().min(2),
  is24Hours: Joi.boolean(),
  deliveryAvailable: Joi.boolean(),
  acceptsInsurance: Joi.boolean(),
  search: Joi.string().trim().min(2).max(100)
});

export const getPharmacyByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Pharmacy ID is required',
    'string.length': 'Invalid pharmacy ID format'
  })
});

export const findNearbyPharmaciesSchema = Joi.object({
  longitude: Joi.number().required().min(-180).max(180).messages({
    'any.required': 'Longitude is required',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180'
  }),
  latitude: Joi.number().required().min(-90).max(90).messages({
    'any.required': 'Latitude is required',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90'
  }),
  maxDistance: Joi.number().integer().min(100).max(50000).default(5000).messages({
    'number.min': 'Maximum distance must be at least 100 meters',
    'number.max': 'Maximum distance cannot exceed 50km (50000 meters)'
  }),
  limit: Joi.number().integer().min(1).max(50).default(20)
});

export const findByCitySchema = Joi.object({
  city: Joi.string().required().trim().min(2).messages({
    'string.empty': 'City is required',
    'string.min': 'City must be at least 2 characters'
  })
});

export const getActivePharmaciesSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50)
});
