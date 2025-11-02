import prescriptionRepo from '../repositories/prescription.repository.js';
import consultationRepo from '../repositories/consultation.repository.js';
import patientRepo from '../repositories/patient.repository.js';
import doctorRepo from '../repositories/doctor.repository.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';

class PrescriptionService {
  async createPrescription(input, createdBy) {
    const { consultationId, patientId, doctorId, medications, ...prescriptionData } = input;

    // Validate consultation exists
    const consultation = await consultationRepo.findByIdSimple(consultationId);
    if (!consultation) {
      throw new NotFoundError('Consultation not found');
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

    // Validate medications array
    if (!medications || medications.length === 0) {
      throw new ValidationError('At least one medication is required');
    }

    // Create prescription
    const prescription = await prescriptionRepo.create({
      consultationId,
      patientId,
      doctorId,
      medications,
      ...prescriptionData,
      createdBy
    });

    return prescriptionRepo.findById(prescription._id);
  }

  async listPrescriptions(params, userId, userRole) {
    const { page = 1, limit = 20, sortBy = 'prescriptionDate', sortOrder = 'desc', ...filters } = params;
    
    const filter = prescriptionRepo.buildFilter(filters);
    
    // Apply role-based filtering
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient) {
        throw new NotFoundError('Patient profile not found');
      }
      filter.patientId = patient._id;
    }
    
    if (userRole === 'doctor' && !filters.doctorId) {
      const doctor = await doctorRepo.findByUserId(userId);
      if (doctor) {
        filter.doctorId = doctor._id;
      }
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    return prescriptionRepo.list({ page, limit, filter, sort });
  }

  async getPrescriptionById(id, userId, userRole) {
    const prescription = await prescriptionRepo.findById(id);
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    // Check access permissions
    await this._checkAccess(prescription, userId, userRole);

    return prescription;
  }

  async updatePrescription(id, updates, userId, userRole) {
    const prescription = await prescriptionRepo.findByIdSimple(id);
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    // Check access permissions
    await this._checkAccess(prescription, userId, userRole);

    // Only draft prescriptions can be updated
    if (prescription.status !== 'draft') {
      throw new ValidationError('Only draft prescriptions can be updated');
    }

    // Update prescription
    updates.updatedBy = userId;
    const updated = await prescriptionRepo.update(id, updates);
    
    return prescriptionRepo.findById(updated._id);
  }

  async deletePrescription(id, userId, userRole) {
    const prescription = await prescriptionRepo.findByIdSimple(id);
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    // Only admin or the doctor who created it can delete
    if (userRole !== 'admin') {
      const doctor = await doctorRepo.findByUserId(userId);
      if (!doctor || prescription.doctorId.toString() !== doctor._id.toString()) {
        throw new ForbiddenError('You do not have permission to delete this prescription');
      }
    }

    // Only draft prescriptions can be deleted
    if (prescription.status !== 'draft') {
      throw new ValidationError('Only draft prescriptions can be deleted');
    }

    return prescriptionRepo.delete(id);
  }

  async signPrescription(id, userId, userRole) {
    const prescription = await prescriptionRepo.findByIdSimple(id);
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    // Only doctors can sign prescriptions
    if (userRole !== 'doctor') {
      throw new ForbiddenError('Only doctors can sign prescriptions');
    }

    // Verify the doctor is the one who created it
    const doctor = await doctorRepo.findByUserId(userId);
    if (!doctor || prescription.doctorId.toString() !== doctor._id.toString()) {
      throw new ForbiddenError('You can only sign your own prescriptions');
    }

    // Sign the prescription
    prescription.sign();
    prescription.updatedBy = userId;
    await prescription.save();

    return prescriptionRepo.findById(prescription._id);
  }

  async sendToPharmacy(id, pharmacyId, userId, userRole) {
    const prescription = await prescriptionRepo.findByIdSimple(id);
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    // Check permissions (doctor, nurse, or admin)
    if (!['doctor', 'nurse', 'admin'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to send prescriptions');
    }

    // Assign to pharmacy
    prescription.assignToPharmacy(pharmacyId);
    prescription.updatedBy = userId;
    await prescription.save();

    return prescriptionRepo.findById(prescription._id);
  }

  async dispensePrescription(id, userId, userRole) {
    const prescription = await prescriptionRepo.findByIdSimple(id);
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    // Only pharmacists can dispense
    if (userRole !== 'pharmacist') {
      throw new ForbiddenError('Only pharmacists can dispense prescriptions');
    }

    // Mark as dispensed
    prescription.dispense(userId);
    prescription.updatedBy = userId;
    await prescription.save();

    return prescriptionRepo.findById(prescription._id);
  }

  async cancelPrescription(id, reason, userId, userRole) {
    const prescription = await prescriptionRepo.findByIdSimple(id);
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    // Check permissions
    await this._checkAccess(prescription, userId, userRole);

    // Cancel the prescription
    prescription.cancel(reason);
    prescription.updatedBy = userId;
    await prescription.save();

    return prescriptionRepo.findById(prescription._id);
  }

  async getMyPrescriptions(userId, userRole, options = {}) {
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient) {
        throw new NotFoundError('Patient profile not found');
      }
      return prescriptionRepo.findByPatientId(patient._id, options);
    }

    if (userRole === 'doctor') {
      const doctor = await doctorRepo.findByUserId(userId);
      if (!doctor) {
        throw new NotFoundError('Doctor profile not found');
      }
      return prescriptionRepo.findByDoctorId(doctor._id, options);
    }

    throw new ForbiddenError('Invalid role for this operation');
  }

  async getPatientPrescriptions(patientId, options = {}) {
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return prescriptionRepo.findByPatientId(patientId, options);
  }

  async getDoctorPrescriptions(doctorId, options = {}) {
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    return prescriptionRepo.findByDoctorId(doctorId, options);
  }

  async getPharmacyPrescriptions(pharmacyId, options = {}) {
    return prescriptionRepo.findByPharmacyId(pharmacyId, options);
  }

  async getConsultationPrescriptions(consultationId) {
    const consultation = await consultationRepo.findByIdSimple(consultationId);
    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    return prescriptionRepo.findByConsultationId(consultationId);
  }

  async getActivePrescriptions(patientId) {
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return prescriptionRepo.getActiveForPatient(patientId);
  }

  async _checkAccess(prescription, userId, userRole) {
    // Admin has full access
    if (userRole === 'admin') return;

    // Doctors, nurses, and secretaries have general access
    if (['doctor', 'nurse', 'secretary'].includes(userRole)) {
      return;
    }

    // Patients can only access their own prescriptions
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient || prescription.patientId.toString() !== patient._id.toString()) {
        throw new ForbiddenError('You do not have permission to access this prescription');
      }
      return;
    }

    throw new ForbiddenError('You do not have permission to access this prescription');
  }
}

export default new PrescriptionService();
