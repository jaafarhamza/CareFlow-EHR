import Joi from 'joi';

const timeSlotSchema = Joi.object({
  start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

const workingHoursSchema = Joi.object({
  monday: Joi.array().items(timeSlotSchema),
  tuesday: Joi.array().items(timeSlotSchema),
  wednesday: Joi.array().items(timeSlotSchema),
  thursday: Joi.array().items(timeSlotSchema),
  friday: Joi.array().items(timeSlotSchema),
  saturday: Joi.array().items(timeSlotSchema),
  sunday: Joi.array().items(timeSlotSchema)
});

export const createDoctorSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  specialization: Joi.string().trim().min(2).max(100).required(),
  licenseNumber: Joi.string().trim().min(3).max(50).required(),
  department: Joi.string().trim().min(2).max(100),
  yearsOfExperience: Joi.number().integer().min(0).max(70),
  consultationDurationMinutes: Joi.number().integer().min(5).max(480).default(30),
  workingHours: workingHoursSchema,
  bufferMinutes: Joi.number().integer().min(0).max(120).default(0),
  maxDailyAppointments: Joi.number().integer().min(1).max(100),
  isAvailable: Joi.boolean().default(true)
});

export const updateDoctorSchema = Joi.object({
  specialization: Joi.string().trim().min(2).max(100),
  licenseNumber: Joi.string().trim().min(3).max(50),
  department: Joi.string().trim().min(2).max(100),
  yearsOfExperience: Joi.number().integer().min(0).max(70),
  consultationDurationMinutes: Joi.number().integer().min(5).max(480),
  workingHours: workingHoursSchema,
  bufferMinutes: Joi.number().integer().min(0).max(120),
  maxDailyAppointments: Joi.number().integer().min(1).max(100),
  isAvailable: Joi.boolean()
}).min(1);

export const updateDoctorSelfSchema = Joi.object({
  consultationDurationMinutes: Joi.number().integer().min(5).max(480),
  workingHours: workingHoursSchema,
  bufferMinutes: Joi.number().integer().min(0).max(120),
  maxDailyAppointments: Joi.number().integer().min(1).max(100),
  isAvailable: Joi.boolean()
}).min(1);

export const listDoctorsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100),
  specialization: Joi.string().trim().max(100),
  isAvailable: Joi.string().valid('true', 'false'),
  sortBy: Joi.string().valid('createdAt', 'specialization', 'yearsOfExperience').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const getDoctorByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});
