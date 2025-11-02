import Joi from 'joi';

export const uploadDocumentSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid patient ID format',
    'string.length': 'Invalid patient ID format',
    'any.required': 'Patient ID is required'
  }),
  documentType: Joi.string()
    .valid(
      'lab_report',
      'radiology_report',
      'prescription',
      'medical_certificate',
      'discharge_summary',
      'consent_form',
      'insurance_document',
      'referral_letter',
      'vaccination_record',
      'other'
    )
    .required()
    .messages({
      'any.only': 'Invalid document type',
      'any.required': 'Document type is required'
    }),
  title: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must be 200 characters or less',
    'any.required': 'Title is required'
  }),
  description: Joi.string().trim().max(1000).allow('').optional().messages({
    'string.max': 'Description must be 1000 characters or less'
  }),
  tags: Joi.array().items(
    Joi.string().trim().max(50).messages({
      'string.max': 'Each tag must be 50 characters or less'
    })
  ).optional(),
  relatedTo: Joi.string()
    .valid('consultation', 'appointment', 'lab_order', 'prescription', 'none')
    .optional()
    .messages({
      'any.only': 'Invalid relatedTo value'
    }),
  relatedId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid related ID format',
    'string.length': 'Invalid related ID format'
  }),
  expiresAt: Joi.date().iso().greater('now').optional().messages({
    'date.format': 'Invalid date format. Use ISO 8601 format',
    'date.greater': 'Expiration date must be in the future'
  })
});

export const updateDocumentSchema = Joi.object({
  title: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Title must be 200 characters or less'
  }),
  description: Joi.string().trim().max(1000).allow('').optional().messages({
    'string.max': 'Description must be 1000 characters or less'
  }),
  tags: Joi.array().items(
    Joi.string().trim().max(50)
  ).optional(),
  expiresAt: Joi.date().iso().greater('now').allow(null).optional().messages({
    'date.format': 'Invalid date format. Use ISO 8601 format',
    'date.greater': 'Expiration date must be in the future'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const deleteDocumentSchema = Joi.object({
  reason: Joi.string().trim().max(500).optional().messages({
    'string.max': 'Reason must be 500 characters or less'
  })
});

export const verifyDocumentSchema = Joi.object({
  notes: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Notes must be 500 characters or less'
  })
});

export const addTagsSchema = Joi.object({
  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one tag is required',
      'any.required': 'Tags are required',
      'string.max': 'Each tag must be 50 characters or less'
    })
});

export const removeTagsSchema = Joi.object({
  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one tag is required',
      'any.required': 'Tags are required'
    })
});

export const getDocumentByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid document ID format',
    'string.length': 'Invalid document ID format',
    'any.required': 'Document ID is required'
  })
});

export const getDocumentsByPatientSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid patient ID format',
    'string.length': 'Invalid patient ID format',
    'any.required': 'Patient ID is required'
  })
});

export const getDocumentsByTypeSchema = Joi.object({
  type: Joi.string()
    .valid(
      'lab_report',
      'radiology_report',
      'prescription',
      'medical_certificate',
      'discharge_summary',
      'consent_form',
      'insurance_document',
      'referral_letter',
      'vaccination_record',
      'other'
    )
    .required()
    .messages({
      'any.only': 'Invalid document type',
      'any.required': 'Document type is required'
    })
});

export const listDocumentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  sortBy: Joi.string()
    .valid('createdAt', 'title', 'documentType', 'fileSize')
    .default('createdAt')
    .messages({
      'any.only': 'Invalid sort field'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be asc or desc'
    }),
  patientId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid patient ID format',
    'string.length': 'Invalid patient ID format'
  }),
  uploadedBy: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid uploader ID format',
    'string.length': 'Invalid uploader ID format'
  }),
  documentType: Joi.string()
    .valid(
      'lab_report',
      'radiology_report',
      'prescription',
      'medical_certificate',
      'discharge_summary',
      'consent_form',
      'insurance_document',
      'referral_letter',
      'vaccination_record',
      'other'
    )
    .optional()
    .messages({
      'any.only': 'Invalid document type'
    }),
  isVerified: Joi.string().valid('true', 'false').optional().messages({
    'any.only': 'isVerified must be true or false'
  }),
  includeDeleted: Joi.string().valid('true', 'false').optional().messages({
    'any.only': 'includeDeleted must be true or false'
  }),
  relatedTo: Joi.string()
    .valid('consultation', 'appointment', 'lab_order', 'prescription', 'none')
    .optional()
    .messages({
      'any.only': 'Invalid relatedTo value'
    }),
  relatedId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid related ID format',
    'string.length': 'Invalid related ID format'
  }),
  tags: Joi.alternatives().try(
    Joi.string().trim(),
    Joi.array().items(Joi.string().trim())
  ).optional(),
  fromDate: Joi.date().iso().optional().messages({
    'date.format': 'Invalid date format. Use ISO 8601 format'
  }),
  toDate: Joi.date().iso().min(Joi.ref('fromDate')).optional().messages({
    'date.format': 'Invalid date format. Use ISO 8601 format',
    'date.min': 'To date must be after from date'
  }),
  search: Joi.string().trim().optional()
});

export const getDocumentsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  skip: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Skip must be a number',
    'number.min': 'Skip must be at least 0'
  }),
  includeDeleted: Joi.string().valid('true', 'false').optional().messages({
    'any.only': 'includeDeleted must be true or false'
  })
});

export const getByTagsQuerySchema = Joi.object({
  tags: Joi.alternatives().try(
    Joi.string().trim(),
    Joi.array().items(Joi.string().trim())
  ).required().messages({
    'any.required': 'Tags parameter is required'
  }),
  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

export const generatePresignedUrlQuerySchema = Joi.object({
  expiresIn: Joi.number().integer().min(60).max(86400).optional().messages({
    'number.base': 'expiresIn must be a number',
    'number.min': 'expiresIn must be at least 60 seconds (1 minute)',
    'number.max': 'expiresIn cannot exceed 86400 seconds (24 hours)'
  })
});
