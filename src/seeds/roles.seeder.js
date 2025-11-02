import mongoose from 'mongoose';
import roleRepo from '../repositories/role.repository.js';
import { ROLES, PERMISSIONS } from '../utils/constants.js';
import env from '../config/env.js';
import logger from '../config/logger.js';

const systemRoles = [
  {
    name: ROLES.ADMIN,
    isSystem: true,
    permissions: Object.values(PERMISSIONS),
    description: 'Full system access'
  },
  {
    name: ROLES.DOCTOR,
    isSystem: true,
    permissions: [
      PERMISSIONS.PATIENT_READ_ANY,
      PERMISSIONS.PATIENT_WRITE_ANY,
      PERMISSIONS.DOCTOR_READ_ANY,
      PERMISSIONS.DOCTOR_READ_SELF,
      PERMISSIONS.DOCTOR_WRITE_SELF,
      PERMISSIONS.APPT_READ_ANY,
      PERMISSIONS.APPT_READ_SELF,
      PERMISSIONS.APPT_WRITE_ANY,
      PERMISSIONS.APPT_STATUS_COMPLETE,
      PERMISSIONS.APPT_STATUS_CANCEL,
      PERMISSIONS.AVAILABILITY_READ_ANY,
      PERMISSIONS.CONSULTATION_READ_ANY,
      PERMISSIONS.CONSULTATION_WRITE_ANY,
      PERMISSIONS.PRESCRIPTION_READ_ANY,
      PERMISSIONS.PRESCRIPTION_WRITE_ANY,
      PERMISSIONS.PRESCRIPTION_SIGN,
      PERMISSIONS.PHARMACY_READ_ANY,
      PERMISSIONS.LAB_ORDER_READ_ANY,
      PERMISSIONS.LAB_ORDER_WRITE_ANY,
      PERMISSIONS.LAB_RESULT_READ_ANY,
      PERMISSIONS.DOCUMENT_READ_ANY,
      PERMISSIONS.DOCUMENT_WRITE_ANY,
      PERMISSIONS.DOCUMENT_VERIFY
    ],
    description: 'Medical practitioner access'
  },
  {
    name: ROLES.NURSE,
    isSystem: true,
    permissions: [
      PERMISSIONS.PATIENT_READ_ANY,
      PERMISSIONS.PATIENT_WRITE_ANY,
      PERMISSIONS.DOCTOR_READ_ANY,
      PERMISSIONS.APPT_READ_ANY,
      PERMISSIONS.APPT_WRITE_ANY,
      PERMISSIONS.AVAILABILITY_READ_ANY,
      PERMISSIONS.CONSULTATION_READ_ANY,
      PERMISSIONS.PRESCRIPTION_READ_ANY,
      PERMISSIONS.PRESCRIPTION_WRITE_ANY,
      PERMISSIONS.PHARMACY_READ_ANY
    ],
    description: 'Nursing staff access'
  },
  {
    name: ROLES.SECRETARY,
    isSystem: true,
    permissions: [
      PERMISSIONS.PATIENT_READ_ANY,
      PERMISSIONS.DOCTOR_READ_ANY,
      PERMISSIONS.APPT_READ_ANY,
      PERMISSIONS.APPT_WRITE_ANY,
      PERMISSIONS.APPT_STATUS_CANCEL,
      PERMISSIONS.AVAILABILITY_READ_ANY
    ],
    description: 'Administrative staff access'
  },
  {
    name: ROLES.PATIENT,
    isSystem: true,
    permissions: [
      PERMISSIONS.PATIENT_READ_SELF,
      PERMISSIONS.PATIENT_WRITE_SELF,
      PERMISSIONS.DOCTOR_READ_ANY,
      PERMISSIONS.APPT_READ_SELF,
      PERMISSIONS.APPT_WRITE_SELF,
      PERMISSIONS.AVAILABILITY_READ_ANY,
      PERMISSIONS.CONSULTATION_READ_SELF,
      PERMISSIONS.PRESCRIPTION_READ_SELF,
      PERMISSIONS.LAB_ORDER_READ_SELF,
      PERMISSIONS.LAB_RESULT_READ_SELF,
      PERMISSIONS.DOCUMENT_READ_SELF,
      PERMISSIONS.DOCUMENT_WRITE_SELF
    ],
    description: 'Patient self-service access'
  },
  {
    name: ROLES.PHARMACIST,
    isSystem: true,
    permissions: [
      PERMISSIONS.PHARMACY_READ_ANY,
      PERMISSIONS.PHARMACY_WRITE_ANY,
      PERMISSIONS.PHARMACY_MANAGE,
      PERMISSIONS.PHARMACY_PRESCRIPTIONS,
      PERMISSIONS.PRESCRIPTION_READ_ANY,
      PERMISSIONS.PRESCRIPTION_DISPENSE,
      PERMISSIONS.PATIENT_READ_ANY,
      PERMISSIONS.DOCTOR_READ_ANY
    ],
    description: 'Pharmacist access for prescription management'
  },
  {
    name: ROLES.LAB_TECHNICIAN,
    isSystem: true,
    permissions: [
      PERMISSIONS.LAB_ORDER_READ_ANY,
      PERMISSIONS.LAB_ORDER_WRITE_ANY,
      PERMISSIONS.LAB_RESULT_READ_ANY,
      PERMISSIONS.LAB_RESULT_WRITE_ANY,
      PERMISSIONS.LAB_RESULT_VALIDATE,
      PERMISSIONS.PATIENT_READ_ANY,
      PERMISSIONS.DOCTOR_READ_ANY,
      PERMISSIONS.DOCUMENT_READ_ANY,
      PERMISSIONS.DOCUMENT_WRITE_ANY
    ],
    description: 'Laboratory technician access for lab orders and results'
  }
];

export async function seedRoles() {
  try {
    await roleRepo.upsertMany(systemRoles);
    logger.info(`✅ Seeded ${systemRoles.length} system roles`);
    return systemRoles;
  } catch (error) {
    logger.error('Error seeding roles:', error);
    throw error;
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await mongoose.connect(env.getMongoDB_URI());
  logger.info('Connected to MongoDB');
  
  await seedRoles();
  
  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
  process.exit(0);
}
