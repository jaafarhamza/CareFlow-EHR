import Joi from 'joi';

const labTestSchema = Joi.object({
  testName: Joi.string().trim().required().messages({
    'string.empty': 'Test name is required',
    'any.required': 'Test name is required'
  }),
  testCode: Joi.string().trim().uppercase().required().messages({
    'string.empty': 'Test code is required',
    'any.required': 'Test code is required'
  }),
  category: Joi.string()
    .valid('Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Pathology', 'Radiology', 'Other')
    .default('Other')
    .messages({
      'any.only': 'Invalid test category'
    }),
  specimenType: Joi.string()
    .valid('Blood', 'Urine', 'Stool', 'Saliva', 'Tissue', 'Swab', 'Other')
    .required()
    .messages({
      'any.only': 'Invalid specimen type',
      'any.required': 'Specimen type is required'
    }),
  instructions: Joi.string().trim().allow('').optional()
});

export const createLabOrderSchema = Joi.object({
  consultationId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid consultation ID format',
    'string.length': 'Invalid consultation ID format',
    'any.required': 'Consultation ID is required'
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
  tests: Joi.array().items(labTestSchema).min(1).required().messages({
    'array.min': 'At least one test is required',
    'any.required': 'Tests are required'
  }),
  priority: Joi.string()
    .valid('routine', 'urgent', 'stat')
    .default('routine')
    .messages({
      'any.only': 'Priority must be routine, urgent, or stat'
    }),
  clinicalNotes: Joi.string().trim().allow('').optional(),
  diagnosis: Joi.string().trim().allow('').optional(),
  notes: Joi.string().trim().allow('').optional()
});

export const updateLabOrderSchema = Joi.object({
  tests: Joi.array().items(labTestSchema).min(1).optional().messages({
    'array.min': 'At least one test is required'
  }),
  priority: Joi.string()
    .valid('routine', 'urgent', 'stat')
    .optional()
    .messages({
      'any.only': 'Priority must be routine, urgent, or stat'
    }),
  clinicalNotes: Joi.string().trim().allow('').optional(),
  diagnosis: Joi.string().trim().allow('').optional(),
  notes: Joi.string().trim().allow('').optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const cancelLabOrderSchema = Joi.object({
  reason: Joi.string().trim().required().messages({
    'string.empty': 'Cancellation reason is required',
    'any.required': 'Cancellation reason is required'
  })
});

export const assignTechnicianSchema = Joi.object({
  technicianId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid technician ID format',
    'string.length': 'Invalid technician ID format',
    'any.required': 'Technician ID is required'
  })
});

export const getLabOrderByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid lab order ID format',
    'string.length': 'Invalid lab order ID format',
    'any.required': 'Lab order ID is required'
  })
});

export const getLabOrderByNumberSchema = Joi.object({
  orderNumber: Joi.string().trim().required().messages({
    'string.empty': 'Order number is required',
    'any.required': 'Order number is required'
  })
});

export const getLabOrdersByPatientSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid patient ID format',
    'string.length': 'Invalid patient ID format',
    'any.required': 'Patient ID is required'
  })
});

export const getLabOrdersByDoctorSchema = Joi.object({
  doctorId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid doctor ID format',
    'string.length': 'Invalid doctor ID format',
    'any.required': 'Doctor ID is required'
  })
});

export const getLabOrdersByConsultationSchema = Joi.object({
  consultationId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid consultation ID format',
    'string.length': 'Invalid consultation ID format',
    'any.required': 'Consultation ID is required'
  })
});

export const getLabOrdersByStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'collected', 'processing', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'Invalid status',
      'any.required': 'Status is required'
    })
});

export const listLabOrdersQuerySchema = Joi.object({
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
    .valid('createdAt', 'orderNumber', 'priority', 'status', 'collectionDate', 'completedDate')
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
  status: Joi.string()
    .valid('pending', 'collected', 'processing', 'completed', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Invalid status'
    }),
  priority: Joi.string()
    .valid('routine', 'urgent', 'stat')
    .optional()
    .messages({
      'any.only': 'Invalid priority'
    }),
  patientId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid patient ID format',
    'string.length': 'Invalid patient ID format'
  }),
  doctorId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid doctor ID format',
    'string.length': 'Invalid doctor ID format'
  }),
  consultationId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid consultation ID format',
    'string.length': 'Invalid consultation ID format'
  }),
  assignedTo: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid assignee ID format',
    'string.length': 'Invalid assignee ID format'
  }),
  category: Joi.string()
    .valid('Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Pathology', 'Radiology', 'Other')
    .optional()
    .messages({
      'any.only': 'Invalid test category'
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

export const getMyLabOrdersQuerySchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'collected', 'processing', 'completed', 'cancelled')
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

export const getPendingLabOrdersQuerySchema = Joi.object({
  priority: Joi.string()
    .valid('routine', 'urgent', 'stat')
    .optional()
    .messages({
      'any.only': 'Invalid priority'
    }),
  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

export const getLabOrdersByStatusQuerySchema = Joi.object({
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
