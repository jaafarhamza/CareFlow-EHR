import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Patient from '../models/patient.model.js';
import Doctor from '../models/doctor.model.js';
import { ROLES } from '../utils/constants.js';
import env from '../config/env.js';
import logger from '../config/logger.js';

// Test users data - 2 accounts per role
const testUsers = [
  // ========== ADMINS ==========
  {
    firstName: 'Admin',
    lastName: 'Super',
    email: 'admin@careflow.com',
    password: 'Admin123!@#',
    phone: '+1234567890',
    role: ROLES.ADMIN,
    status: 'active',
    isActive: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Administrator',
    email: 'sarah.admin@careflow.com',
    password: 'Admin123!@#',
    phone: '+1234567891',
    role: ROLES.ADMIN,
    status: 'active',
    isActive: true
  },

  // ========== DOCTORS ==========
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'dr.john.smith@careflow.com',
    password: 'Doctor123!@#',
    phone: '+1234567892',
    role: ROLES.DOCTOR,
    status: 'active',
    isActive: true,
    doctorProfile: {
      specialization: 'Cardiology',
      licenseNumber: 'MD-CARD-001',
      department: 'Cardiology Department',
      yearsOfExperience: 15,
      consultationDurationMinutes: 30,
      workingHours: {
        monday: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '17:00' }
        ],
        tuesday: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '17:00' }
        ],
        wednesday: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '17:00' }
        ],
        thursday: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '17:00' }
        ],
        friday: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '16:00' }
        ],
        saturday: [],
        sunday: []
      },
      bufferMinutes: 5,
      maxDailyAppointments: 20,
      isAvailable: true
    }
  },
  {
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'dr.emily.johnson@careflow.com',
    password: 'Doctor123!@#',
    phone: '+1234567893',
    role: ROLES.DOCTOR,
    status: 'active',
    isActive: true,
    doctorProfile: {
      specialization: 'Pediatrics',
      licenseNumber: 'MD-PED-002',
      department: 'Pediatrics Department',
      yearsOfExperience: 10,
      consultationDurationMinutes: 30,
      workingHours: {
        monday: [
          { start: '08:00', end: '12:00' },
          { start: '13:00', end: '17:00' }
        ],
        tuesday: [
          { start: '08:00', end: '12:00' },
          { start: '13:00', end: '17:00' }
        ],
        wednesday: [
          { start: '08:00', end: '12:00' },
          { start: '13:00', end: '17:00' }
        ],
        thursday: [
          { start: '08:00', end: '12:00' },
          { start: '13:00', end: '17:00' }
        ],
        friday: [
          { start: '08:00', end: '12:00' }
        ],
        saturday: [
          { start: '09:00', end: '13:00' }
        ],
        sunday: []
      },
      bufferMinutes: 10,
      maxDailyAppointments: 25,
      isAvailable: true
    }
  },

  // ========== NURSES ==========
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@careflow.com',
    password: 'Nurse123!@#',
    phone: '+1234567894',
    role: ROLES.NURSE,
    status: 'active',
    isActive: true
  },
  {
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@careflow.com',
    password: 'Nurse123!@#',
    phone: '+1234567895',
    role: ROLES.NURSE,
    status: 'active',
    isActive: true
  },

  // ========== SECRETARIES ==========
  {
    firstName: 'Lisa',
    lastName: 'Brown',
    email: 'lisa.brown@careflow.com',
    password: 'Secretary123!@#',
    phone: '+1234567896',
    role: ROLES.SECRETARY,
    status: 'active',
    isActive: true
  },
  {
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.davis@careflow.com',
    password: 'Secretary123!@#',
    phone: '+1234567897',
    role: ROLES.SECRETARY,
    status: 'active',
    isActive: true
  },

  // ========== PATIENTS ==========
  {
    firstName: 'Robert',
    lastName: 'Anderson',
    email: 'robert.anderson@example.com',
    password: 'Patient123!@#',
    phone: '+1234567898',
    role: ROLES.PATIENT,
    status: 'active',
    isActive: true,
    patientProfile: {
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      bloodType: 'A+',
      address: {
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jane Anderson',
        phone: '+1234567899',
        relationship: 'Spouse'
      },
      insurance: {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'BCBS-123456',
        groupNumber: 'GRP-789'
      },
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Hypertension'],
      medications: ['Lisinopril 10mg'],
      consents: {
        dataProcessing: true,
        marketing: false,
        care: true
      },
      preferences: {
        language: 'en',
        communication: 'email'
      }
    }
  },
  {
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jennifer.martinez@example.com',
    password: 'Patient123!@#',
    phone: '+1234567900',
    role: ROLES.PATIENT,
    status: 'active',
    isActive: true,
    patientProfile: {
      dateOfBirth: new Date('1990-08-22'),
      gender: 'female',
      bloodType: 'O-',
      address: {
        line1: '456 Oak Avenue',
        line2: '',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Carlos Martinez',
        phone: '+1234567901',
        relationship: 'Brother'
      },
      insurance: {
        provider: 'Aetna',
        policyNumber: 'AET-654321',
        groupNumber: 'GRP-456'
      },
      allergies: ['Latex', 'Shellfish'],
      chronicConditions: ['Asthma'],
      medications: ['Albuterol Inhaler'],
      consents: {
        dataProcessing: true,
        marketing: true,
        care: true
      },
      preferences: {
        language: 'en',
        communication: 'sms'
      }
    }
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(env.getMongoDB_URI());
    logger.info('Connected to MongoDB');

    // Clear existing test data (optional - comment out if you want to keep existing data)
    const testEmails = testUsers.map(u => u.email);
    await User.deleteMany({ email: { $in: testEmails } });
    logger.info('Cleared existing test users');

    const createdUsers = [];
    const createdPatients = [];
    const createdDoctors = [];

    for (const userData of testUsers) {
      // Create user
      const passwordHash = await User.hashPassword(userData.password);
      const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        passwordHash,
        phone: userData.phone,
        role: userData.role,
        status: userData.status,
        isActive: userData.isActive
      });

      createdUsers.push(user);
      logger.info(`✅ Created user: ${user.email} (${user.role})`);

      // Create patient profile if patient
      if (userData.role === ROLES.PATIENT && userData.patientProfile) {
        const patient = await Patient.create({
          userId: user._id,
          ...userData.patientProfile,
          createdBy: user._id,
          updatedBy: user._id
        });
        createdPatients.push(patient);
        logger.info(`   ↳ Created patient profile for ${user.email}`);
      }

      // Create doctor profile if doctor
      if (userData.role === ROLES.DOCTOR && userData.doctorProfile) {
        const doctor = await Doctor.create({
          userId: user._id,
          ...userData.doctorProfile,
          createdBy: user._id,
          updatedBy: user._id
        });
        createdDoctors.push(doctor);
        logger.info(`   ↳ Created doctor profile for ${user.email}`);
      }
    }

    // Summary
    logger.info('\n========== SEEDING SUMMARY ==========');
    logger.info(`Total Users Created: ${createdUsers.length}`);
    logger.info(`  - Admins: ${createdUsers.filter(u => u.role === ROLES.ADMIN).length}`);
    logger.info(`  - Doctors: ${createdUsers.filter(u => u.role === ROLES.DOCTOR).length}`);
    logger.info(`  - Nurses: ${createdUsers.filter(u => u.role === ROLES.NURSE).length}`);
    logger.info(`  - Secretaries: ${createdUsers.filter(u => u.role === ROLES.SECRETARY).length}`);
    logger.info(`  - Patients: ${createdUsers.filter(u => u.role === ROLES.PATIENT).length}`);
    logger.info(`Patient Profiles Created: ${createdPatients.length}`);
    logger.info(`Doctor Profiles Created: ${createdDoctors.length}`);
    logger.info('=====================================\n');

    // Print login credentials
    logger.info('========== LOGIN CREDENTIALS ==========');
    logger.info('\n📧 All accounts use the following password pattern:');
    logger.info('   Admin: Admin123!@#');
    logger.info('   Doctor: Doctor123!@#');
    logger.info('   Nurse: Nurse123!@#');
    logger.info('   Secretary: Secretary123!@#');
    logger.info('   Patient: Patient123!@#\n');

    logger.info('🔐 ADMIN ACCOUNTS:');
    createdUsers.filter(u => u.role === ROLES.ADMIN).forEach(u => {
      logger.info(`   Email: ${u.email}`);
    });

    logger.info('\n👨‍⚕️ DOCTOR ACCOUNTS:');
    createdUsers.filter(u => u.role === ROLES.DOCTOR).forEach(u => {
      logger.info(`   Email: ${u.email}`);
    });

    logger.info('\n👩‍⚕️ NURSE ACCOUNTS:');
    createdUsers.filter(u => u.role === ROLES.NURSE).forEach(u => {
      logger.info(`   Email: ${u.email}`);
    });

    logger.info('\n📋 SECRETARY ACCOUNTS:');
    createdUsers.filter(u => u.role === ROLES.SECRETARY).forEach(u => {
      logger.info(`   Email: ${u.email}`);
    });

    logger.info('\n🏥 PATIENT ACCOUNTS:');
    createdUsers.filter(u => u.role === ROLES.PATIENT).forEach(u => {
      logger.info(`   Email: ${u.email}`);
    });

    logger.info('\n========================================');

    await mongoose.disconnect();
    logger.info('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
