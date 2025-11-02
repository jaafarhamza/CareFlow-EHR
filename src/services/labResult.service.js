import labResultRepo from '../repositories/labResult.repository.js';
import labOrderRepo from '../repositories/labOrder.repository.js';
import patientRepo from '../repositories/patient.repository.js';
import doctorRepo from '../repositories/doctor.repository.js';
import storageService from './storage.service.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';

class LabResultService {
  async createLabResult(input, createdBy) {
    const { labOrderId, patientId, doctorId, results, ...resultData } = input;

    // Validate lab order exists
    const labOrder = await labOrderRepo.findByIdSimple(labOrderId);
    if (!labOrder) {
      throw new NotFoundError('Lab order not found');
    }

    // Check if lab order is in processing or completed status
    if (!['processing', 'completed'].includes(labOrder.status)) {
      throw new ValidationError('Lab order must be in processing or completed status');
    }

    // Check if result already exists for this lab order
    const existingResult = await labResultRepo.findByLabOrderId(labOrderId);
    if (existingResult) {
      throw new ValidationError('Result already exists for this lab order');
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

    // Validate results array
    if (!results || results.length === 0) {
      throw new ValidationError('At least one test result is required');
    }

    // Auto-detect abnormal and critical values
    const processedResults = this._processResults(results);

    // Create lab result
    const labResult = await labResultRepo.create({
      labOrderId,
      patientId,
      doctorId,
      results: processedResults,
      ...resultData,
      performedBy: createdBy,
      createdBy
    });

    return labResultRepo.findById(labResult._id);
  }

  async listLabResults(params, userId, userRole) {
    const { page = 1, limit = 20, sortBy = 'performedDate', sortOrder = 'desc', ...filters } = params;
    
    const filter = labResultRepo.buildFilter(filters);
    
    // Apply role-based filtering
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient) {
        throw new NotFoundError('Patient profile not found');
      }
      filter.patientId = patient._id;
      // Patients can only see released results
      filter.status = 'released';
    }
    
    if (userRole === 'doctor' && !filters.doctorId) {
      const doctor = await doctorRepo.findByUserId(userId);
      if (doctor) {
        filter.doctorId = doctor._id;
      }
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    return labResultRepo.list({ page, limit, filter, sort });
  }

  async getLabResultById(id, userId, userRole) {
    const labResult = await labResultRepo.findById(id);
    if (!labResult) {
      throw new NotFoundError('Lab result not found');
    }

    // Check access permissions
    await this._checkAccess(labResult, userId, userRole);

    return labResult;
  }

  async getLabResultByOrderId(labOrderId, userId, userRole) {
    const labResult = await labResultRepo.findByLabOrderId(labOrderId);
    if (!labResult) {
      throw new NotFoundError('Lab result not found for this order');
    }

    // Check access permissions
    await this._checkAccess(labResult, userId, userRole);

    return labResult;
  }

  async updateLabResult(id, updates, userId, userRole) {
    const labResult = await labResultRepo.findByIdSimple(id);
    if (!labResult) {
      throw new NotFoundError('Lab result not found');
    }

    // Only lab technicians and admins can update
    if (!['lab_technician', 'admin'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to update lab results');
    }

    // Only draft results can be updated
    if (labResult.status !== 'draft') {
      throw new ValidationError('Only draft lab results can be updated');
    }

    // Process results if provided
    if (updates.results) {
      updates.results = this._processResults(updates.results);
    }

    // Update lab result
    updates.updatedBy = userId;
    const updated = await labResultRepo.update(id, updates);
    
    return labResultRepo.findById(updated._id);
  }

  async deleteLabResult(id, userId, userRole) {
    const labResult = await labResultRepo.findByIdSimple(id);
    if (!labResult) {
      throw new NotFoundError('Lab result not found');
    }

    // Only admin can delete
    if (userRole !== 'admin') {
      throw new ForbiddenError('You do not have permission to delete lab results');
    }

    // Only draft results can be deleted
    if (labResult.status !== 'draft') {
      throw new ValidationError('Only draft lab results can be deleted');
    }

    return labResultRepo.delete(id);
  }

  async validateLabResult(id, userId, userRole) {
    const labResult = await labResultRepo.findByIdSimple(id);
    if (!labResult) {
      throw new NotFoundError('Lab result not found');
    }

    // Only lab technicians and admins can validate
    if (!['lab_technician', 'admin'].includes(userRole)) {
      throw new ForbiddenError('Only lab technicians can validate results');
    }

    // Validate the result
    labResult.validateResult(userId);
    labResult.updatedBy = userId;
    await labResult.save();

    return labResultRepo.findById(labResult._id);
  }

  async releaseLabResult(id, userId, userRole) {
    const labResult = await labResultRepo.findByIdSimple(id);
    if (!labResult) {
      throw new NotFoundError('Lab result not found');
    }

    // Only lab technicians and admins can release
    if (!['lab_technician', 'admin'].includes(userRole)) {
      throw new ForbiddenError('Only lab technicians can release results');
    }

    // Release the result
    labResult.release(userId);
    labResult.updatedBy = userId;
    await labResult.save();

    return labResultRepo.findById(labResult._id);
  }

  async markForValidation(id, userId, userRole) {
    const labResult = await labResultRepo.findByIdSimple(id);
    if (!labResult) {
      throw new NotFoundError('Lab result not found');
    }

    // Only lab technicians and admins can mark for validation
    if (!['lab_technician', 'admin'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to mark results for validation');
    }

    // Mark for validation
    labResult.markForValidation();
    labResult.updatedBy = userId;
    await labResult.save();

    return labResultRepo.findById(labResult._id);
  }

  async uploadPdfReport(id, file, userId, userRole) {
    const labResult = await labResultRepo.findByIdSimple(id);
    if (!labResult) {
      throw new NotFoundError('Lab result not found');
    }

    // Only lab technicians and admins can upload PDF
    if (!['lab_technician', 'admin'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to upload PDF reports');
    }

    // Validate file type
    if (!file.mimetype.includes('pdf')) {
      throw new ValidationError('Only PDF files are allowed');
    }

    // Upload file to storage
    const uploadedFile = await storageService.uploadMulterFile(file, 'lab-reports');

    // Attach PDF to result
    labResult.attachPdfReport({
      fileName: uploadedFile.fileName,
      fileUrl: uploadedFile.fileUrl,
      fileSize: uploadedFile.fileSize
    }, userId);

    labResult.updatedBy = userId;
    await labResult.save();

    return labResultRepo.findById(labResult._id);
  }

  async getPatientLabResults(patientId, options = {}) {
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return labResultRepo.findByPatientId(patientId, options);
  }

  async getDoctorLabResults(doctorId, options = {}) {
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    return labResultRepo.findByDoctorId(doctorId, options);
  }

  async getCriticalLabResults(options = {}) {
    return labResultRepo.findCritical(options);
  }

  async getPendingValidation(options = {}) {
    return labResultRepo.findPendingValidation(options);
  }

  async getLabResultsByStatus(status, options = {}) {
    return labResultRepo.findByStatus(status, options);
  }

  async getStatistics() {
    return labResultRepo.getStatistics();
  }

  _processResults(results) {
    return results.map(result => {
      const processed = { ...result };

      // Auto-detect abnormal values based on reference range
      if (result.referenceRange && result.referenceRange.min !== undefined && result.referenceRange.max !== undefined) {
        const numericValue = parseFloat(result.value);
        
        if (!isNaN(numericValue)) {
          const { min, max } = result.referenceRange;
          
          if (numericValue < min) {
            processed.isAbnormal = true;
            processed.flag = numericValue < (min * 0.5) ? 'critical_low' : 'low';
            processed.isCritical = numericValue < (min * 0.5);
          } else if (numericValue > max) {
            processed.isAbnormal = true;
            processed.flag = numericValue > (max * 2) ? 'critical_high' : 'high';
            processed.isCritical = numericValue > (max * 2);
          } else {
            processed.isAbnormal = false;
            processed.flag = 'normal';
            processed.isCritical = false;
          }
        }
      }

      return processed;
    });
  }

  async _checkAccess(labResult, userId, userRole) {
    // Admin has full access
    if (userRole === 'admin') return;

    // Doctors, nurses, lab technicians, and secretaries have general access
    if (['doctor', 'nurse', 'lab_technician', 'secretary'].includes(userRole)) {
      return;
    }

    // Patients can only access their own released results
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient || labResult.patientId.toString() !== patient._id.toString()) {
        throw new ForbiddenError('You do not have permission to access this lab result');
      }
      
      // Patients can only see released results
      if (labResult.status !== 'released') {
        throw new ForbiddenError('This result is not yet available');
      }
      
      return;
    }

    throw new ForbiddenError('You do not have permission to access this lab result');
  }
}

export default new LabResultService();
