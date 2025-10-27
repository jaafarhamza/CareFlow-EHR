import patientRepo from '../repositories/patient.repository.js';
import userRepo from '../repositories/user.repository.js';
import { ROLES } from '../utils/constants.js';

class PatientError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function createPatient(input, createdBy) {
  const { userId, ...patientData } = input;

  const user = await userRepo.findById(userId);
  if (!user) throw new PatientError('User not found', 404);
  if (user.role !== ROLES.PATIENT) throw new PatientError('User must have patient role', 400);

  const existing = await patientRepo.findByUserId(userId);
  if (existing) throw new PatientError('Patient record already exists', 409);

  try {
    return await patientRepo.create({ userId, ...patientData, createdBy });
  } catch (error) {
    if (error.code === 11000) throw new PatientError('Patient record already exists', 409);
    throw error;
  }
}

export async function listPatients(params) {
  const { page = 1, limit = 10, search, bloodType, gender, sortBy = 'createdAt', sortOrder = 'desc' } = params;
  
  const filter = patientRepo.buildFilter({ search, bloodType, gender });
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  
  return await patientRepo.list({ page, limit, filter, sort });
}

export async function getPatientById(id) {
  const patient = await patientRepo.findById(id);
  if (!patient) throw new PatientError('Patient not found', 404);
  return patient;
}

export async function getPatientByUserId(userId) {
  const patient = await patientRepo.findByUserId(userId);
  if (!patient) throw new PatientError('Patient record not found', 404);
  return patient;
}

export async function updatePatient(id, input, updatedBy) {
  const update = { ...input, updatedBy };
  const updated = await patientRepo.updateById(id, update);
  if (!updated) throw new PatientError('Patient not found', 404);
  return updated;
}

export async function updatePatientByUserId(userId, input) {
  const patient = await patientRepo.findByUserId(userId);
  if (!patient) throw new PatientError('Patient record not found', 404);
  const update = { ...input, updatedBy: userId };
  const updated = await patientRepo.updateById(patient._id, update);
  return updated;
}

export async function deletePatient(id) {
  const deleted = await patientRepo.deleteById(id);
  if (!deleted) throw new PatientError('Patient not found', 404);
  return deleted;
}
