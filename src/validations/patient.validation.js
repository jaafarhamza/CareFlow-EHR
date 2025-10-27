import Joi from 'joi';
import { PHONE_REGEX } from '../utils/constants.js';

const id = Joi.string().regex(/^[a-fA-F0-9]{24}$/).message('Invalid Mongo ObjectId');

// Reusable field definitions
const patientFields = {
  dateOfBirth: Joi.date().max('now').optional(),
  gender: Joi.string().valid('male', 'female').optional(),
  bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
  address: Joi.object({
    line1: Joi.string().trim().max(200).optional(),
    line2: Joi.string().trim().max(200).optional(),
    city: Joi.string().trim().max(100).optional(),
    state: Joi.string().trim().max(100).optional(),
    postalCode: Joi.string().trim().max(20).optional(),
    country: Joi.string().trim().max(100).optional()
  }).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    phone: Joi.string().pattern(PHONE_REGEX).optional(),
    relationship: Joi.string().trim().max(50).optional()
  }).optional(),
  allergies: Joi.array().items(Joi.string().trim().max(100)).optional(),
  chronicConditions: Joi.array().items(Joi.string().trim().max(100)).optional(),
  medications: Joi.array().items(Joi.string().trim().max(100)).optional(),
  preferences: Joi.object({
    language: Joi.string().trim().max(10).optional(),
    communication: Joi.string().valid('email', 'sms', 'phone').optional()
  }).optional()
};

const adminOnlyFields = {
  insurance: Joi.object({
    provider: Joi.string().trim().max(100).optional(),
    policyNumber: Joi.string().trim().max(50).optional(),
    groupNumber: Joi.string().trim().max(50).optional()
  }).optional(),
  consents: Joi.object({
    dataProcessing: Joi.boolean().optional(),
    marketing: Joi.boolean().optional(),
    care: Joi.boolean().optional()
  }).optional()
};

export const createPatientSchema = Joi.object({
  userId: id.required(),
  ...patientFields,
  ...adminOnlyFields
});

export const updatePatientSelfSchema = Joi.object(patientFields).min(1);

export const updatePatientSchema = Joi.object({
  ...patientFields,
  ...adminOnlyFields
}).min(1);

export const getPatientByIdSchema = Joi.object({
  id: id.required()
});

export const listPatientsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional(),
  bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
  gender: Joi.string().valid('male', 'female').optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'dateOfBirth').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});
