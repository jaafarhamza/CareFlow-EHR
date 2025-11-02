import Joi from 'joi';

const medicationSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(200).messages({
    'string.empty': 'Medication name is required',
    'string.min': 'Medication name must be at least 2 characters',
    'string.max': 'Medication name must not exceed 200 characters'
  }),
  genericName: Joi.string().trim().max(200),
  dosage: Joi.string().required().trim().max(100).messages({
    'string.empty': 'Dosage is required',
    'string.max': 'Dosage must not exceed 100 characters'
  }),
  route: Joi.string().required().valid(
    'oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous',
    'inhalation', 'rectal', 'ophthalmic', 'otic', 'nasal', 'transdermal', 'sublingual'
  ).messages({
    'any.required': 'Route is required',
    'any.only': 'Invalid route of administration'
  }),
  frequency: Joi.string().required().trim().max(100).messages({
    'string.empty': 'Frequency is required',
    'string.max': 'Frequency must not exceed 100 characters'
  }),
  duration: Joi.object({
    value: Joi.number().required().integer().min(1).messages({
      'number.base': 'Duration value must be a number',
      'number.min': 'Duration value must be at least 1',
      'any.required': 'Duration value is required'
    }),
    unit: Joi.string().required().valid('days', 'weeks', 'months').messages({
      'any.required': 'Duration unit is required',
      'any.only': 'Duration unit must be days, weeks, or months'
    })
  }).required().messages({
    'any.required': 'Duration is required'
  }),
  quantity: Joi.number().required().integer().min(1).messages({
    'number.base': 'Quantity must be a number',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required'
  }),
  refills: Joi.number().integer().min(0).max(12).default(0).messages({
    'number.min': 'Refills cannot be negative',
    'number.max': 'Refills cannot exceed 12'
  }),
  instructions: Joi.string().trim().max(500).messages({
    'string.max': 'Instructions must not exceed 500 characters'
  })
});

export const createPrescriptionSchema = Joi.object({
  consultationId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Consultation ID is required',
    'string.length': 'Invalid consultation ID format'
  }),
  patientId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Patient ID is required',
    'string.length': 'Invalid patient ID format'
  }),
  doctorId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Doctor ID is required',
    'string.length': 'Invalid doctor ID format'
  }),
  medications: Joi.array().items(medicationSchema).min(1).required().messages({
    'array.min': 'At least one medication is required',
    'any.required': 'Medications are required'
  }),
  pharmacyId: Joi.string().hex().length(24).messages({
    'string.length': 'Invalid pharmacy ID format'
  }),
  prescriptionDate: Joi.date().iso().max('now').default(() => new Date()).messages({
    'date.max': 'Prescription date cannot be in the future'
  }),
  expiryDate: Joi.date().iso().greater('now').messages({
    'date.greater': 'Expiry date must be in the future'
  }),
  notes: Joi.string().trim().max(1000).messages({
    'string.max': 'Notes must not exceed 1000 characters'
  })
});

export const updatePrescriptionSchema = Joi.object({
  medications: Joi.array().items(medicationSchema).min(1).messages({
    'array.min': 'At least one medication is required'
  }),
  prescriptionDate: Joi.date().iso().max('now').messages({
    'date.max': 'Prescription date cannot be in the future'
  }),
  expiryDate: Joi.date().iso().greater('now').messages({
    'date.greater': 'Expiry date must be in the future'
  }),
  notes: Joi.string().trim().max(1000).messages({
    'string.max': 'Notes must not exceed 1000 characters'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const sendToPharmacySchema = Joi.object({
  pharmacyId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Pharmacy ID is required',
    'string.length': 'Invalid pharmacy ID format',
    'any.required': 'Pharmacy ID is required'
  })
});

export const cancelPrescriptionSchema = Joi.object({
  reason: Joi.string().required().trim().min(5).max(500).messages({
    'string.empty': 'Cancellation reason is required',
    'string.min': 'Cancellation reason must be at least 5 characters',
    'string.max': 'Cancellation reason must not exceed 500 characters',
    'any.required': 'Cancellation reason is required'
  })
});

export const listPrescriptionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('prescriptionDate', 'createdAt', 'signedAt', 'sentAt').default('prescriptionDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  patientId: Joi.string().hex().length(24),
  doctorId: Joi.string().hex().length(24),
  pharmacyId: Joi.string().hex().length(24),
  consultationId: Joi.string().hex().length(24),
  status: Joi.string().valid('draft', 'signed', 'sent', 'dispensed', 'cancelled'),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
    'date.min': 'End date must be after start date'
  }),
  search: Joi.string().trim().min(2).max(100)
});

export const getPrescriptionByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Prescription ID is required',
    'string.length': 'Invalid prescription ID format'
  })
});

export const getPrescriptionsByPatientSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Patient ID is required',
    'string.length': 'Invalid patient ID format'
  })
});

export const getPrescriptionsByDoctorSchema = Joi.object({
  doctorId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Doctor ID is required',
    'string.length': 'Invalid doctor ID format'
  })
});

export const getPrescriptionsByPharmacySchema = Joi.object({
  pharmacyId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Pharmacy ID is required',
    'string.length': 'Invalid pharmacy ID format'
  })
});

export const getPrescriptionsByConsultationSchema = Joi.object({
  consultationId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Consultation ID is required',
    'string.length': 'Invalid consultation ID format'
  })
});

export const getMyPrescriptionsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
    'date.min': 'End date must be after start date'
  }),
  status: Joi.string().valid('draft', 'signed', 'sent', 'dispensed', 'cancelled')
});

export const getPharmacyPrescriptionsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  status: Joi.string().valid('sent', 'dispensed')
});
