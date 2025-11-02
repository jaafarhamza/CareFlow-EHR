import labOrderRepo from '../repositories/labOrder.repository.js';
import consultationRepo from '../repositories/consultation.repository.js';
import patientRepo from '../repositories/patient.repository.js';
import doctorRepo from '../repositories/doctor.repository.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';

class LabOrderService {
  async createLabOrder(input, createdBy) {
    const { consultationId, patientId, doctorId, tests, ...orderData } = input;

    // Validate consultation exists
    const consultation = await consultationRepo.findByIdSimple(consultationId);
    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    // Validate patient 
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Validate doctor 
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    // Validate tests array
    if (!tests || tests.length === 0) {
      throw new ValidationError('At least one test is required');
    }

    // Create lab order
    const labOrder = await labOrderRepo.create({
      consultationId,
      patientId,
      doctorId,
      tests,
      ...orderData,
      createdBy
    });

    return labOrderRepo.findById(labOrder._id);
  }

  async listLabOrders(params, userId, userRole) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = params;
    
    const filter = labOrderRepo.buildFilter(filters);
    
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
    return labOrderRepo.list({ page, limit, filter, sort });
  }

  async getLabOrderById(id, userId, userRole) {
    const labOrder = await labOrderRepo.findById(id);
    if (!labOrder) {
      throw new NotFoundError('Lab order not found');
    }

    // Check access permissions
    await this._checkAccess(labOrder, userId, userRole);

    return labOrder;
  }

  async getLabOrderByNumber(orderNumber, userId, userRole) {
    const labOrder = await labOrderRepo.findByOrderNumber(orderNumber);
    if (!labOrder) {
      throw new NotFoundError('Lab order not found');
    }

    // Check access permissions
    await this._checkAccess(labOrder, userId, userRole);

    return labOrder;
  }

  async updateLabOrder(id, updates, userId, userRole) {
    const labOrder = await labOrderRepo.findByIdSimple(id);
    if (!labOrder) {
      throw new NotFoundError('Lab order not found');
    }

    // Check access permissions
    await this._checkAccess(labOrder, userId, userRole);

    // Only pending orders can be updated
    if (labOrder.status !== 'pending') {
      throw new ValidationError('Only pending lab orders can be updated');
    }

    // Update lab order
    updates.updatedBy = userId;
    const updated = await labOrderRepo.update(id, updates);
    
    return labOrderRepo.findById(updated._id);
  }

  async deleteLabOrder(id, userId, userRole) {
    const labOrder = await labOrderRepo.findByIdSimple(id);
    if (!labOrder) {
      throw new NotFoundError('Lab order not found');
    }

    // Only admin or the doctor who created it can delete
    if (userRole !== 'admin') {
      const doctor = await doctorRepo.findByUserId(userId);
      if (!doctor || labOrder.doctorId.toString() !== doctor._id.toString()) {
        throw new ForbiddenError('You do not have permission to delete this lab order');
      }
    }

    // Only pending orders can be deleted
    if (labOrder.status !== 'pending') {
      throw new ValidationError('Only pending lab orders can be deleted');
    }

    return labOrderRepo.delete(id);
  }

  async markAsCollected(id, userId, userRole) {
    const labOrder = await labOrderRepo.findByIdSimple(id);
    if (!labOrder) {
      throw new NotFoundError('Lab order not found');
    }

    // Only lab technicians and nurses can collect specimens
    if (!['lab_technician', 'nurse', 'admin'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to collect specimens');
    }

    // Mark as collected
    labOrder.markAsCollected(userId);
    labOrder.updatedBy = userId;
    await labOrder.save();

    return labOrderRepo.findById(labOrder._id);
  }

  async startProcessing(id, userId, userRole) {
    const labOrder = await labOrderRepo.findByIdSimple(id);
    if (!labOrder) {
      throw new NotFoundError('Lab order not found');
    }

    // Only lab technicians can start processing
    if (!['lab_technician', 'admin'].includes(userRole)) {
      throw new ForbiddenError('Only lab technicians can start processing');
    }

    // Start processing
    labOrder.startProcessing(userId);
    labOrder.updatedBy = userId;
    await labOrder.save();

    return labOrderRepo.findById(labOrder._id);
  }

  async markAsCompleted(id, userId, userRole) {
    const labOrder = await labOrderRepo.findByIdSimple(id);
    if (!labOrder) {
      throw new NotFoundError('Lab order not found');
    }

    // Only lab technicians can mark as completed
    if (!['lab_technician', 'admin'].includes(userRole)) {
      throw new ForbiddenError('Only lab technicians can mark orders as completed');
    }

    // Mark as completed
    labOrder.markAsCompleted();
    labOrder.updatedBy = userId;
    await labOrder.save();

    return labOrderRepo.findById(labOrder._id);
  }

  async cancelLabOrder(id, reason, userId, userRole) {
    const labOrder = await labOrderRepo.findByIdSimple(id);
    if (!labOrder) {
      throw new NotFoundError('Lab order not found');
    }

    // Check permissions
    await this._checkAccess(labOrder, userId, userRole);

    // Cancel the lab order
    labOrder.cancel(reason);
    labOrder.updatedBy = userId;
    await labOrder.save();

    return labOrderRepo.findById(labOrder._id);
  }

  async assignTechnician(id, technicianId, userId, userRole) {
    const labOrder = await labOrderRepo.findByIdSimple(id);
    if (!labOrder) {
      throw new NotFoundError('Lab order not found');
    }

    // Only admin and lab technicians can assign
    if (!['admin', 'lab_technician'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to assign technicians');
    }

    // Assign technician
    labOrder.assignTechnician(technicianId);
    labOrder.updatedBy = userId;
    await labOrder.save();

    return labOrderRepo.findById(labOrder._id);
  }

  async getMyLabOrders(userId, userRole, options = {}) {
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient) {
        throw new NotFoundError('Patient profile not found');
      }
      return labOrderRepo.findByPatientId(patient._id, options);
    }

    if (userRole === 'doctor') {
      const doctor = await doctorRepo.findByUserId(userId);
      if (!doctor) {
        throw new NotFoundError('Doctor profile not found');
      }
      return labOrderRepo.findByDoctorId(doctor._id, options);
    }

    throw new ForbiddenError('Invalid role for this operation');
  }

  async getPatientLabOrders(patientId, options = {}) {
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return labOrderRepo.findByPatientId(patientId, options);
  }

  async getDoctorLabOrders(doctorId, options = {}) {
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    return labOrderRepo.findByDoctorId(doctorId, options);
  }

  async getConsultationLabOrders(consultationId) {
    const consultation = await consultationRepo.findByIdSimple(consultationId);
    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    return labOrderRepo.findByConsultationId(consultationId);
  }

  async getPendingLabOrders(options = {}) {
    return labOrderRepo.findPending(options);
  }

  async getLabOrdersByStatus(status, options = {}) {
    return labOrderRepo.findByStatus(status, options);
  }

  async getUrgentLabOrders() {
    return labOrderRepo.findUrgent();
  }

  async getStatistics() {
    return labOrderRepo.getStatistics();
  }

  async _checkAccess(labOrder, userId, userRole) {
    // Admin has full access
    if (userRole === 'admin') return;

    // Doctors, nurses, lab technicians, and secretaries have general access
    if (['doctor', 'nurse', 'lab_technician', 'secretary'].includes(userRole)) {
      return;
    }

    // Patients can only access their own lab orders
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient || labOrder.patientId.toString() !== patient._id.toString()) {
        throw new ForbiddenError('You do not have permission to access this lab order');
      }
      return;
    }

    throw new ForbiddenError('You do not have permission to access this lab order');
  }
}

export default new LabOrderService();
