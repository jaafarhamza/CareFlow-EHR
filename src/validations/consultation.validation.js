import Joi from 'joi';

const vitalSignsSchema = Joi.object({
  bloodPressure: Joi.object({
    systolic: Joi.number().min(60).max(250).messages({
      'number.min': 'Systolic BP must be at least 60 mmHg',
      'number.max': 'Systolic BP must not exceed 250 mmHg'
    }),
    diastolic: Joi.number().min(40).max(150).messages({
      'number.min': 'Diastolic BP must be at least 40 mmHg',
      'number.max': 'Diastolic BP must not exceed 150 mmHg'
    })
  }),
  heartRate: Joi.number().min(40).max(200).messages({
    'number.min': 'Heart rate must be at least 40 bpm',
    'number.max': 'Heart rate must not exceed 200 bpm'
  }),
  temperature: Joi.object({
    value: Joi.number().min(35).max(42).messages({
      'number.min': 'Temperature must be at least 35°C',
      'number.max': 'Temperature must not exceed 42°C'
    }),
    unit: Joi.string().valid('celsius', 'fahrenheit').default('celsius')
  }),
  respiratoryRate: Joi.number().min(8).max(60).messages({
    'number.min': 'Respiratory rate must be at least 8 breaths/min',
    'number.max': 'Respiratory rate must not exceed 60 breaths/min'
  }),
  oxygenSaturation: Joi.number().min(0).max(100).messages({
    'number.min': 'Oxygen saturation must be at least 0%',
    'number.max': 'Oxygen saturation must not exceed 100%'
  }),
  weight: Joi.object({
    value: Joi.number().min(0.5).max(500).messages({
      'number.min': 'Weight must be at least 0.5 kg',
      'number.max': 'Weight must not exceed 500 kg'
    }),
    unit: Joi.string().valid('kg', 'lbs').default('kg')
  }),
  height: Joi.object({
    value: Joi.number().min(30).max(300).messages({
      'number.min': 'Height must be at least 30 cm',
      'number.max': 'Height must not exceed 300 cm'
    }),
    unit: Joi.string().valid('cm', 'inches').default('cm')
  }),
  bloodGlucose: Joi.object({
    value: Joi.number().min(0),
    unit: Joi.string().valid('mg/dL', 'mmol/L').default('mg/dL')
  })
});

const diagnosisSchema = Joi.object({
  code: Joi.string().required().trim().max(20).messages({
    'string.empty': 'Diagnosis code is required',
    'any.required': 'Diagnosis code is required'
  }),
  description: Joi.string().required().trim().min(2).max(500).messages({
    'string.empty': 'Diagnosis description is required',
    'string.min': 'Diagnosis description must be at least 2 characters',
    'string.max': 'Diagnosis description must not exceed 500 characters'
  }),
  type: Joi.string().valid('primary', 'secondary').default('primary'),
  notes: Joi.string().trim().max(1000)
});

const procedureSchema = Joi.object({
  code: Joi.string().required().trim().max(20).messages({
    'string.empty': 'Procedure code is required',
    'any.required': 'Procedure code is required'
  }),
  name: Joi.string().required().trim().min(2).max(200).messages({
    'string.empty': 'Procedure name is required',
    'string.min': 'Procedure name must be at least 2 characters',
    'string.max': 'Procedure name must not exceed 200 characters'
  }),
  description: Joi.string().trim().max(1000),
  performedAt: Joi.date().iso().max('now').messages({
    'date.max': 'Procedure date cannot be in the future'
  })
});

export const createConsultationSchema = Joi.object({
  appointmentId: Joi.string().hex().length(24).messages({
    'string.length': 'Invalid appointment ID format'
  }),
  patientId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Patient ID is required',
    'string.length': 'Invalid patient ID format'
  }),
  doctorId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Doctor ID is required',
    'string.length': 'Invalid doctor ID format'
  }),
  consultationDate: Joi.date().iso().max('now').default(() => new Date()).messages({
    'date.max': 'Consultation date cannot be in the future'
  }),
  chiefComplaint: Joi.string().required().trim().min(2).max(1000).messages({
    'string.empty': 'Chief complaint is required',
    'string.min': 'Chief complaint must be at least 2 characters',
    'string.max': 'Chief complaint must not exceed 1000 characters'
  }),
  historyOfPresentIllness: Joi.string().trim().max(5000),
  vitalSigns: vitalSignsSchema,
  physicalExamination: Joi.string().trim().max(5000),
  diagnoses: Joi.array().items(diagnosisSchema).min(1).messages({
    'array.min': 'At least one diagnosis is required'
  }),
  procedures: Joi.array().items(procedureSchema),
  treatmentPlan: Joi.string().trim().max(5000),
  notes: Joi.string().trim().max(5000),
  followUpDate: Joi.date().iso().greater('now').messages({
    'date.greater': 'Follow-up date must be in the future'
  }),
  followUpInstructions: Joi.string().trim().max(2000)
});

export const updateConsultationSchema = Joi.object({
  consultationDate: Joi.date().iso().max('now').messages({
    'date.max': 'Consultation date cannot be in the future'
  }),
  chiefComplaint: Joi.string().trim().min(2).max(1000).messages({
    'string.min': 'Chief complaint must be at least 2 characters',
    'string.max': 'Chief complaint must not exceed 1000 characters'
  }),
  historyOfPresentIllness: Joi.string().trim().max(5000),
  vitalSigns: vitalSignsSchema,
  physicalExamination: Joi.string().trim().max(5000),
  diagnoses: Joi.array().items(diagnosisSchema).min(1).messages({
    'array.min': 'At least one diagnosis is required'
  }),
  procedures: Joi.array().items(procedureSchema),
  treatmentPlan: Joi.string().trim().max(5000),
  notes: Joi.string().trim().max(5000),
  followUpDate: Joi.date().iso().greater('now').messages({
    'date.greater': 'Follow-up date must be in the future'
  }),
  followUpInstructions: Joi.string().trim().max(2000)
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const listConsultationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('consultationDate', 'createdAt').default('consultationDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  patientId: Joi.string().hex().length(24),
  doctorId: Joi.string().hex().length(24),
  appointmentId: Joi.string().hex().length(24),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
    'date.min': 'End date must be after start date'
  }),
  search: Joi.string().trim().min(2).max(100)
});

export const getConsultationByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Consultation ID is required',
    'string.length': 'Invalid consultation ID format'
  })
});

export const getConsultationsByPatientSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Patient ID is required',
    'string.length': 'Invalid patient ID format'
  })
});

export const getConsultationsByDoctorSchema = Joi.object({
  doctorId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Doctor ID is required',
    'string.length': 'Invalid doctor ID format'
  })
});

export const getConsultationByAppointmentSchema = Joi.object({
  appointmentId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Appointment ID is required',
    'string.length': 'Invalid appointment ID format'
  })
});

export const getMyConsultationsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
    'date.min': 'End date must be after start date'
  })
});
