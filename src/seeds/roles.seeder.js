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
      PERMISSIONS.APPT_READ_ANY,
      PERMISSIONS.APPT_WRITE_ANY,
      PERMISSIONS.APPT_STATUS_COMPLETE,
      PERMISSIONS.APPT_STATUS_CANCEL,
      PERMISSIONS.AVAILABILITY_READ_ANY
    ],
    description: 'Medical practitioner access'
  },
  {
    name: ROLES.NURSE,
    isSystem: true,
    permissions: [
      PERMISSIONS.PATIENT_READ_ANY,
      PERMISSIONS.PATIENT_WRITE_ANY,
      PERMISSIONS.APPT_READ_ANY,
      PERMISSIONS.APPT_WRITE_ANY,
      PERMISSIONS.AVAILABILITY_READ_ANY
    ],
    description: 'Nursing staff access'
  },
  {
    name: ROLES.SECRETARY,
    isSystem: true,
    permissions: [
      PERMISSIONS.PATIENT_READ_ANY,
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
      PERMISSIONS.APPT_READ_SELF,
      PERMISSIONS.APPT_WRITE_SELF,
      PERMISSIONS.AVAILABILITY_READ_ANY
    ],
    description: 'Patient self-service access'
  }
];

async function seedRoles() {
  try {
    await mongoose.connect(env.getMongoDB_URI());
    logger.info('Connected to MongoDB');

    await roleRepo.upsertMany(systemRoles);
    logger.info(`✅ Seeded ${systemRoles.length} system roles`);

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();
