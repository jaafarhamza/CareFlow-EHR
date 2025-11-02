import documentRepo from '../repositories/document.repository.js';
import patientRepo from '../repositories/patient.repository.js';
import storageService from './storage.service.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';

class DocumentService {
  async uploadDocument(input, file, userId) {
    const { patientId, documentType, title, description, tags, relatedTo, relatedId, expiresAt } = input;

    // Validate patient exists
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Validate file
    if (!file) {
      throw new ValidationError('File is required');
    }

    // Upload file to storage
    const uploadedFile = await storageService.uploadMulterFile(file, 'medical-documents');

    // Create document record
    const document = await documentRepo.create({
      patientId,
      uploadedBy: userId,
      documentType,
      title,
      description,
      fileName: uploadedFile.fileName,
      fileUrl: uploadedFile.fileUrl,
      fileSize: uploadedFile.fileSize,
      mimeType: file.mimetype,
      tags: tags || [],
      relatedTo: relatedTo || 'none',
      relatedId: relatedId || undefined,
      expiresAt: expiresAt || undefined,
      createdBy: userId
    });

    return documentRepo.findById(document._id);
  }

  async listDocuments(params, userId, userRole) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = params;
    
    const filter = documentRepo.buildFilter(filters);
    
    // Apply role-based filtering
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient) {
        throw new NotFoundError('Patient profile not found');
      }
      filter.patientId = patient._id;
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    return documentRepo.list({ page, limit, filter, sort });
  }

  async getDocumentById(id, userId, userRole) {
    const document = await documentRepo.findById(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Check if document is deleted
    if (document.isDeleted && userRole !== 'admin') {
      throw new NotFoundError('Document not found');
    }

    // Check access permissions
    await this._checkAccess(document, userId, userRole);

    // Log access
    const simpleDoc = await documentRepo.findByIdSimple(id);
    simpleDoc.logAccess(userId, 'view');
    await simpleDoc.save();

    return document;
  }

  async updateDocument(id, updates, userId, userRole) {
    const document = await documentRepo.findByIdSimple(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Check if document is deleted
    if (document.isDeleted) {
      throw new ValidationError('Cannot update deleted document');
    }

    // Only uploader, admin can update
    if (userRole !== 'admin' && document.uploadedBy.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to update this document');
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'tags', 'expiresAt'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    filteredUpdates.updatedBy = userId;
    const updated = await documentRepo.update(id, filteredUpdates);
    
    return documentRepo.findById(updated._id);
  }

  async deleteDocument(id, reason, userId, userRole) {
    const document = await documentRepo.findByIdSimple(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Check if already deleted
    if (document.isDeleted) {
      throw new ValidationError('Document is already deleted');
    }

    // Only uploader, admin can delete
    if (userRole !== 'admin' && document.uploadedBy.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to delete this document');
    }

    // Soft delete
    document.softDelete(userId, reason);
    document.updatedBy = userId;
    await document.save();

    return documentRepo.findById(document._id);
  }

  async restoreDocument(id, userId, userRole) {
    // Only admin can restore
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only administrators can restore documents');
    }

    const document = await documentRepo.findByIdSimple(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (!document.isDeleted) {
      throw new ValidationError('Document is not deleted');
    }

    document.restore();
    document.updatedBy = userId;
    await document.save();

    return documentRepo.findById(document._id);
  }

  async permanentlyDeleteDocument(id, userId, userRole) {
    // Only admin can permanently delete
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only administrators can permanently delete documents');
    }

    const document = await documentRepo.findByIdSimple(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Delete file from storage
    try {
      await storageService.deleteFileByUrl(document.fileUrl);
    } catch (error) {
      console.error('Failed to delete file from storage:', error);
    }

    // Delete document record
    return documentRepo.delete(id);
  }

  async verifyDocument(id, notes, userId, userRole) {
    // Only doctors and admins can verify
    if (!['doctor', 'admin'].includes(userRole)) {
      throw new ForbiddenError('Only doctors can verify documents');
    }

    const document = await documentRepo.findByIdSimple(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.isDeleted) {
      throw new ValidationError('Cannot verify deleted document');
    }

    if (document.isVerified) {
      throw new ValidationError('Document is already verified');
    }

    document.verify(userId, notes);
    document.updatedBy = userId;
    await document.save();

    return documentRepo.findById(document._id);
  }

  async unverifyDocument(id, userId, userRole) {
    // Only admin can unverify
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only administrators can unverify documents');
    }

    const document = await documentRepo.findByIdSimple(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (!document.isVerified) {
      throw new ValidationError('Document is not verified');
    }

    document.unverify();
    document.updatedBy = userId;
    await document.save();

    return documentRepo.findById(document._id);
  }

  async downloadDocument(id, userId, userRole) {
    const document = await documentRepo.findById(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Check if document is deleted
    if (document.isDeleted && userRole !== 'admin') {
      throw new NotFoundError('Document not found');
    }

    // Check access permissions
    await this._checkAccess(document, userId, userRole);

    // Log access
    const simpleDoc = await documentRepo.findByIdSimple(id);
    simpleDoc.logAccess(userId, 'download');
    await simpleDoc.save();

    return {
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      mimeType: document.mimeType
    };
  }

  async generatePresignedUrl(id, expiresIn, userId, userRole) {
    const document = await documentRepo.findById(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Check if document is deleted
    if (document.isDeleted && userRole !== 'admin') {
      throw new NotFoundError('Document not found');
    }

    // Check access permissions
    await this._checkAccess(document, userId, userRole);

    // Generate presigned URL (expires in seconds, default 1 hour)
    const expirationSeconds = expiresIn || 3600;
    const presignedUrl = await storageService.generatePresignedUrl(
      document.fileUrl,
      expirationSeconds
    );

    // Log access
    const simpleDoc = await documentRepo.findByIdSimple(id);
    simpleDoc.logAccess(userId, 'share');
    await simpleDoc.save();

    return {
      presignedUrl,
      expiresIn: expirationSeconds,
      expiresAt: new Date(Date.now() + expirationSeconds * 1000)
    };
  }

  async addTags(id, tags, userId, userRole) {
    const document = await documentRepo.findByIdSimple(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.isDeleted) {
      throw new ValidationError('Cannot update deleted document');
    }

    // Only uploader, admin can add tags
    if (userRole !== 'admin' && document.uploadedBy.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to update this document');
    }

    document.addTags(tags);
    document.updatedBy = userId;
    await document.save();

    return documentRepo.findById(document._id);
  }

  async removeTags(id, tags, userId, userRole) {
    const document = await documentRepo.findByIdSimple(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.isDeleted) {
      throw new ValidationError('Cannot update deleted document');
    }

    // Only uploader, admin can remove tags
    if (userRole !== 'admin' && document.uploadedBy.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to update this document');
    }

    document.removeTags(tags);
    document.updatedBy = userId;
    await document.save();

    return documentRepo.findById(document._id);
  }

  async getPatientDocuments(patientId, options = {}) {
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return documentRepo.findByPatientId(patientId, options);
  }

  async getDocumentsByType(documentType, options = {}) {
    return documentRepo.findByType(documentType, options);
  }

  async getDocumentsByTags(tags, options = {}) {
    return documentRepo.findByTags(tags, options);
  }

  async getUnverifiedDocuments(options = {}) {
    return documentRepo.findUnverified(options);
  }

  async getStatistics() {
    return documentRepo.getStatistics();
  }

  async _checkAccess(document, userId, userRole) {
    // Admin has full access
    if (userRole === 'admin') return;

    // Doctors, nurses, and secretaries have general access
    if (['doctor', 'nurse', 'secretary'].includes(userRole)) {
      return;
    }

    // Patients can only access their own documents
    if (userRole === 'patient') {
      const patient = await patientRepo.findByUserId(userId);
      if (!patient || document.patientId._id.toString() !== patient._id.toString()) {
        throw new ForbiddenError('You do not have permission to access this document');
      }
      return;
    }

    throw new ForbiddenError('You do not have permission to access this document');
  }
}

export default new DocumentService();
