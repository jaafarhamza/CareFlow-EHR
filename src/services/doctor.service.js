import doctorRepo from '../repositories/doctor.repository.js';
import userRepo from '../repositories/user.repository.js';
import { ROLES } from '../utils/constants.js';

class DoctorError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function createDoctor(input, createdBy) {
  const { userId, ...doctorData } = input;

  const user = await userRepo.findById(userId);
  if (!user) throw new DoctorError('User not found', 404);
  if (user.role !== ROLES.DOCTOR) throw new DoctorError('User must have doctor role', 400);

  const existing = await doctorRepo.findByUserId(userId);
  if (existing) throw new DoctorError('Doctor record already exists', 409);

  try {
    return await doctorRepo.create({ userId, ...doctorData, createdBy });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.licenseNumber) throw new DoctorError('License number already exists', 409);
      throw new DoctorError('Doctor record already exists', 409);
    }
    throw error;
  }
}

export async function listDoctors(params) {
  const { page = 1, limit = 10, search, specialization, isAvailable, sortBy = 'createdAt', sortOrder = 'desc' } = params;
  
  const filter = doctorRepo.buildFilter({ search, specialization, isAvailable });
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  
  return await doctorRepo.list({ page, limit, filter, sort });
}

export async function getDoctorById(id) {
  const doctor = await doctorRepo.findById(id);
  if (!doctor) throw new DoctorError('Doctor not found', 404);
  return doctor;
}

export async function getDoctorByUserId(userId) {
  const doctor = await doctorRepo.findByUserId(userId);
  if (!doctor) throw new DoctorError('Doctor record not found', 404);
  return doctor;
}

export async function updateDoctor(id, input, updatedBy) {
  const update = { ...input, updatedBy };
  const updated = await doctorRepo.updateById(id, update);
  if (!updated) throw new DoctorError('Doctor not found', 404);
  return updated;
}

export async function updateDoctorByUserId(userId, input) {
  const doctor = await doctorRepo.findByUserId(userId);
  if (!doctor) throw new DoctorError('Doctor record not found', 404);
  const update = { ...input, updatedBy: userId };
  const updated = await doctorRepo.updateById(doctor._id, update);
  return updated;
}

export async function deleteDoctor(id) {
  const deleted = await doctorRepo.deleteById(id);
  if (!deleted) throw new DoctorError('Doctor not found', 404);
  return deleted;
}
