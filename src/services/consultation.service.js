import consultationRepo from '../repositories/consultation.repository.js';
import appointmentRepo from '../repositories/appointment.repository.js';
import patientRepo from '../repositories/patient.repository.js';
import doctorRepo from '../repositories/doctor.repository.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';

class ConsultationService {
  async createConsultation(input, createdBy) {
    const { appointmentId, patientId, doctorId, consultationDate, ...consultationData } = input;

    // Validate appointment exists if provided
    if (appointmentId) {
      const appointment = await appointmentRepo.findByIdSimple(appointmentId);
      if (!appointment) {
        throw new NotFoundError('Appointment not found');
      }

      // Check if consultation already exists for this appointment
      const existing = await consultationRepo.findByAppointmentId(appointmentId);
      if (existing) {
        throw new ValidationError('Consultation already exists for this appointment');
      }

      // Verify appointment is completed
      if (appointment.status !== 'completed') {
        throw new ValidationError('Can only create consultation for completed appointments');
      }
    }

    // Validate patient exists
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Validate doctor exists
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    // Create consultation
    const consultation = await consultationRepo.create({
      appointmentId,
      patientId,
      doctorId,
      consultationDate: consultationDate || new Date(),
      ...consultationData,
      createdBy
    });

    return consultationRepo.findById(consultation._id);
  }

  async listConsultations(params, userId, userRole) {
    const { page = 1, limit = 20, sortBy = 'consultationDate', sortOrder = 'desc', ...filters } = params;
    
    // Apply role-based filtering
    const filter = consultationRepo.buildFilter(filters);
    
    // If user is a patient, only show their consultations
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient) {
        throw new NotFoundError('Patient profile not found');
      }
      filter.patientId = patient._id;
    }
    
    // If user is a doctor, optionally filter to their consultations
    if (userRole === 'doctor' && !filters.doctorId) {
      const doctor = await doctorRepo.findByUserId(userId);
      if (doctor) {
        filter.doctorId = doctor._id;
      }
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    return consultationRepo.list({ page, limit, filter, sort });
  }

  async getConsultationById(id, userId, userRole) {
    const consultation = await consultationRepo.findById(id);
    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    // Check access permissions
    await this._checkAccessPermission(consultation, userId, userRole);

    return consultation;
  }

  async updateConsultation(id, input, updatedBy, userRole) {
    const consultation = await consultationRepo.findByIdSimple(id);
    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    // Check access permissions
    await this._checkAccessPermission(consultation, updatedBy, userRole);

    const updates = { ...input, updatedBy };

    // Recalculate BMI if height or weight changed
    if (input.vitalSigns) {
      const vitalSigns = { ...consultation.vitalSigns, ...input.vitalSigns };
      
      if (vitalSigns.weight && vitalSigns.height) {
        const weight = vitalSigns.weight;
        const heightInMeters = vitalSigns.height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        vitalSigns.bmi = Math.round(bmi * 10) / 10;
      }
      
      updates.vitalSigns = vitalSigns;
    }

    return consultationRepo.updateById(id, updates);
  }

  async deleteConsultation(id, userId, userRole) {
    const consultation = await consultationRepo.findByIdSimple(id);
    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    // Only admins and the doctor who created it can delete
    if (userRole !== 'admin') {
      const doctor = await doctorRepo.findByUserId(userId);
      if (!doctor || String(consultation.doctorId) !== String(doctor._id)) {
        throw new ForbiddenError('You do not have permission to delete this consultation');
      }
    }

    return consultationRepo.deleteById(id);
  }

  async getPatientConsultations(patientId, options = {}) {
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return consultationRepo.findByPatientId(patientId, options);
  }

  async getDoctorConsultations(doctorId, options = {}) {
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    return consultationRepo.findByDoctorId(doctorId, options);
  }

  async getConsultationByAppointment(appointmentId, userId, userRole) {
    const appointment = await appointmentRepo.findByIdSimple(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    const consultation = await consultationRepo.findByAppointmentId(appointmentId);
    if (!consultation) {
      throw new NotFoundError('No consultation found for this appointment');
    }

    // Check access permissions
    await this._checkAccessPermission(consultation, userId, userRole);

    return consultation;
  }

  async getMyConsultations(userId, userRole, options = {}) {
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient) {
        throw new NotFoundError('Patient profile not found');
      }
      return consultationRepo.findByPatientId(patient._id, options);
    }

    if (userRole === 'doctor') {
      const doctor = await doctorRepo.findByUserId(userId);
      if (!doctor) {
        throw new NotFoundError('Doctor profile not found');
      }
      return consultationRepo.findByDoctorId(doctor._id, options);
    }

    throw new ForbiddenError('Only patients and doctors can view their consultations');
  }

  // Private helper method
  async _checkAccessPermission(consultation, userId, userRole) {
    // Admins, nurses, and secretaries can access all consultations
    if (['admin', 'nurse', 'secretary'].includes(userRole)) {
      return;
    }

    // Doctors can access their own consultations
    if (userRole === 'doctor') {
      const doctor = await doctorRepo.findByUserId(userId);
      if (doctor && String(consultation.doctorId) === String(doctor._id)) {
        return;
      }
    }

    // Patients can access their own consultations
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (patient && String(consultation.patientId) === String(patient._id)) {
        return;
      }
    }

    throw new ForbiddenError('You do not have permission to access this consultation');
  }
}

export default new ConsultationService();
