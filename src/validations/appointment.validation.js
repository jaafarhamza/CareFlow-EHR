import Joi from 'joi';

export const createAppointmentSchema = Joi.object({
  patientId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid patient ID format',
      'any.required': 'Patient ID is required'
    }),
  
  doctorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid doctor ID format',
      'any.required': 'Doctor ID is required'
    }),
  
  startAt: Joi.date()
    .iso()
    .min('now')
    .required()
    .messages({
      'date.min': 'Appointment cannot be scheduled in the past',
      'any.required': 'Start time is required'
    }),
  
  endAt: Joi.date()
    .iso()
    .greater(Joi.ref('startAt'))
    .required()
    .messages({
      'date.greater': 'End time must be after start time',
      'any.required': 'End time is required'
    }),
  
  type: Joi.string()
    .valid('in_person', 'virtual')
    .default('in_person')
    .messages({
      'any.only': 'Type must be either in_person or virtual'
    }),
  
  reason: Joi.string()
    .trim()
    .max(500)
    .allow(null, '')
    .messages({
      'string.max': 'Reason cannot exceed 500 characters'
    }),
  
  notes: Joi.string()
    .trim()
    .max(2000)
    .allow(null, '')
    .messages({
      'string.max': 'Notes cannot exceed 2000 characters'
    }),
  
  meetingLink: Joi.string()
    .uri()
    .allow(null, '')
    .messages({
      'string.uri': 'Meeting link must be a valid URL'
    })
});

export const updateAppointmentSchema = Joi.object({
  startAt: Joi.date()
    .iso()
    .min('now')
    .messages({
      'date.min': 'Appointment cannot be rescheduled to the past'
    }),
  
  endAt: Joi.date()
    .iso()
    .when('startAt', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('startAt')),
      otherwise: Joi.date()
    })
    .messages({
      'date.greater': 'End time must be after start time'
    }),
  
  type: Joi.string()
    .valid('in_person', 'virtual')
    .messages({
      'any.only': 'Type must be either in_person or virtual'
    }),
  
  reason: Joi.string()
    .trim()
    .max(500)
    .allow(null, '')
    .messages({
      'string.max': 'Reason cannot exceed 500 characters'
    }),
  
  notes: Joi.string()
    .trim()
    .max(2000)
    .allow(null, '')
    .messages({
      'string.max': 'Notes cannot exceed 2000 characters'
    }),
  
  meetingLink: Joi.string()
    .uri()
    .allow(null, '')
    .messages({
      'string.uri': 'Meeting link must be a valid URL'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const cancelAppointmentSchema = Joi.object({
  cancellationReason: Joi.string()
    .trim()
    .max(500)
    .required()
    .messages({
      'string.max': 'Cancellation reason cannot exceed 500 characters',
      'any.required': 'Cancellation reason is required'
    })
});

export const completeAppointmentSchema = Joi.object({
  notes: Joi.string()
    .trim()
    .max(2000)
    .allow(null, '')
    .messages({
      'string.max': 'Notes cannot exceed 2000 characters'
    })
});

export const listAppointmentsQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  sortBy: Joi.string()
    .valid('startAt', 'createdAt', 'status')
    .default('startAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
  
  patientId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid patient ID format'
    }),
  
  doctorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid doctor ID format'
    }),
  
  status: Joi.alternatives()
    .try(
      Joi.string().valid('scheduled', 'completed', 'cancelled', 'no_show'),
      Joi.array().items(Joi.string().valid('scheduled', 'completed', 'cancelled', 'no_show'))
    )
    .messages({
      'any.only': 'Invalid status value'
    }),
  
  type: Joi.string()
    .valid('in_person', 'virtual')
    .messages({
      'any.only': 'Type must be either in_person or virtual'
    }),
  
  startDate: Joi.date()
    .iso()
    .messages({
      'date.format': 'Start date must be a valid ISO date'
    }),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .messages({
      'date.format': 'End date must be a valid ISO date',
      'date.min': 'End date must be after start date'
    })
});

export const getAppointmentByIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid appointment ID format',
      'any.required': 'Appointment ID is required'
    })
});

export const checkAvailabilitySchema = Joi.object({
  doctorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid doctor ID format',
      'any.required': 'Doctor ID is required'
    }),
  
  date: Joi.date()
    .iso()
    .min('now')
    .required()
    .messages({
      'date.min': 'Date cannot be in the past',
      'any.required': 'Date is required'
    }),
  
  durationMinutes: Joi.number()
    .integer()
    .min(5)
    .max(480)
    .default(30)
    .messages({
      'number.min': 'Duration must be at least 5 minutes',
      'number.max': 'Duration cannot exceed 480 minutes (8 hours)'
    })
});

export const myAppointmentsQuerySchema = Joi.object({
  status: Joi.alternatives()
    .try(
      Joi.string().valid('scheduled', 'completed', 'cancelled', 'no_show'),
      Joi.array().items(Joi.string().valid('scheduled', 'completed', 'cancelled', 'no_show'))
    ),
  
  startDate: Joi.date().iso(),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate')),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
});
