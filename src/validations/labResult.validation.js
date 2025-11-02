import Joi from 'joi';

const referenceRangeSchema = Joi.object({
  min: Joi.number().optional(),
  max: Joi.number().optional(),
  text: Joi.string().trim().optional()
}).or('min', 'max', 'text');

const testResultSchema = Joi.object({
  testName: Joi.string().trim().required().messages({
    'string.empty': 'Test name is required',
    'any.required': 'Test name is required'
  }),
  testCode: Joi.string().trim().uppercase().required().messages({
    'string.empty': 'Test code is required',
    'any.required': 'Test code is required'
  }),
  value: Joi.string().trim().required().messages({
    'string.empty': 'Test value is required',
    'any.required': 'Test value is required'
  }),
  unit: Joi.string().trim().optional(),
  referenceRange: referenceRangeSchema.optional(),
  isAbnormal: Joi.boolean().optional(),
  isCritical: Joi.boolean().optional(),
  flag: Joi.string()
    .valid('normal', 'low', 'high', 'critical_low', 'critical_high', 'abnormal')
    .optional()
    .messages({
      'any.only': 'Invalid flag value'
    }),
  notes: Joi.string().trim().allow('').optional()
});

export const createLabResultSchema = Joi.object({
  labOrderId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid lab order ID format',
    'string.length': 'Invalid lab order ID format',
    'any.required': 'Lab order ID is required'
  }),
  patientId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid patient ID format',
    'string.length': 'Invalid patient ID format',
    'any.required': 'Patient ID is required'
  }),
  doctorId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid doctor ID format',
    'string.length': 'Invalid doctor ID format',
    'any.required': 'Doctor ID is required'
  }),
  results: Joi.array().items(testResultSchema).min(1).required().messages({
    'array.min': 'At least one test result is required',
    'any.required': 'Test results are required'
  }),
  status: Joi.string()
    .valid('draft', 'pending_validation', 'validated', 'released')
    .default('draft')
    .messages({
      'any.only': 'Invalid status'
    }),
  overallInterpretation: Joi.string().trim().allow('').optional(),
  technicalNotes: Joi.string().trim().allow('').optional()
});

export const updateLabResultSchema = Joi.object({
  results: Joi.array().items(testResultSchema).min(1).optional().messages({
    'array.min': 'At least one test result is required'
  }),
  overallInterpretation: Joi.string().trim().allow('').optional(),
  technicalNotes: Joi.string().trim().allow('').optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const getLabResultByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid lab result ID format',
    'string.length': 'Invalid lab result ID format',
    'any.required': 'Lab result ID is required'
  })
});

export const getLabResultByOrderIdSchema = Joi.object({
  labOrderId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid lab order ID format',
    'string.length': 'Invalid lab order ID format',
    'any.required': 'Lab order ID is required'
  })
});

export const getLabResultsByPatientSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid patient ID format',
    'string.length': 'Invalid patient ID format',
    'any.required': 'Patient ID is required'
  })
});

export const getLabResultsByDoctorSchema = Joi.object({
  doctorId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid doctor ID format',
    'string.length': 'Invalid doctor ID format',
    'any.required': 'Doctor ID is required'
  })
});

export const getLabResultsByStatusSchema = Joi.object({
  status: Joi.string()
    .valid('draft', 'pending_validation', 'validated', 'released')
    .required()
    .messages({
      'any.only': 'Invalid status',
      'any.required': 'Status is required'
    })
});

export const listLabResultsQuerySchema = Joi.object({
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
    .valid('performedDate', 'validatedDate', 'releasedDate', 'status')
    .default('performedDate')
    .messages({
      'any.only': 'Invalid sort field'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be asc or desc'
    }),
  status: Joi.string()
    .valid('draft', 'pending_validation', 'validated', 'released')
    .optional()
    .messages({
      'any.only': 'Invalid status'
    }),
  patientId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid patient ID format',
    'string.length': 'Invalid patient ID format'
  }),
  doctorId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid doctor ID format',
    'string.length': 'Invalid doctor ID format'
  }),
  labOrderId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid lab order ID format',
    'string.length': 'Invalid lab order ID format'
  }),
  hasCriticalValues: Joi.string().valid('true', 'false').optional().messages({
    'any.only': 'hasCriticalValues must be true or false'
  }),
  hasAbnormalValues: Joi.string().valid('true', 'false').optional().messages({
    'any.only': 'hasAbnormalValues must be true or false'
  }),
  performedBy: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid performer ID format',
    'string.length': 'Invalid performer ID format'
  }),
  validatedBy: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid validator ID format',
    'string.length': 'Invalid validator ID format'
  }),
  fromDate: Joi.date().iso().optional().messages({
    'date.format': 'Invalid date format. Use ISO 8601 format'
  }),
  toDate: Joi.date().iso().min(Joi.ref('fromDate')).optional().messages({
    'date.format': 'Invalid date format. Use ISO 8601 format',
    'date.min': 'To date must be after from date'
  }),
  search: Joi.string().trim().optional()
});

export const getLabResultsQuerySchema = Joi.object({
  status: Joi.string()
    .valid('draft', 'pending_validation', 'validated', 'released')
    .optional()
    .messages({
      'any.only': 'Invalid status'
    }),
  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

export const getCriticalLabResultsQuerySchema = Joi.object({
  status: Joi.string()
    .valid('draft', 'pending_validation', 'validated', 'released')
    .default('released')
    .messages({
      'any.only': 'Invalid status'
    }),
  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

export const getPendingValidationQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

export const getLabResultsByStatusQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  skip: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Skip must be a number',
    'number.min': 'Skip must be at least 0'
  })
});
