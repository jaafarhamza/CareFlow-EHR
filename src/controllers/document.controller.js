import documentService from '../services/document.service.js';
import { handleAsync } from '../utils/async.util.js';

class DocumentController {
  upload = handleAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const document = await documentService.uploadDocument(
      req.body,
      req.file,
      req.user.sub
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  });

  list = handleAsync(async (req, res) => {
    const result = await documentService.listDocuments(
      req.query,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: result
    });
  });

  getById = handleAsync(async (req, res) => {
    const document = await documentService.getDocumentById(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: document
    });
  });

  update = handleAsync(async (req, res) => {
    const document = await documentService.updateDocument(
      req.params.id,
      req.body,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  });

  delete = handleAsync(async (req, res) => {
    const document = await documentService.deleteDocument(
      req.params.id,
      req.body.reason,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      data: document
    });
  });

  restore = handleAsync(async (req, res) => {
    const document = await documentService.restoreDocument(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Document restored successfully',
      data: document
    });
  });

  permanentlyDelete = handleAsync(async (req, res) => {
    await documentService.permanentlyDeleteDocument(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Document permanently deleted'
    });
  });

  verify = handleAsync(async (req, res) => {
    const document = await documentService.verifyDocument(
      req.params.id,
      req.body.notes,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Document verified successfully',
      data: document
    });
  });

  unverify = handleAsync(async (req, res) => {
    const document = await documentService.unverifyDocument(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Document unverified successfully',
      data: document
    });
  });

  download = handleAsync(async (req, res) => {
    const fileData = await documentService.downloadDocument(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: fileData
    });
  });

  generatePresignedUrl = handleAsync(async (req, res) => {
    const { expiresIn } = req.query;
    
    const result = await documentService.generatePresignedUrl(
      req.params.id,
      expiresIn ? parseInt(expiresIn) : undefined,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: result
    });
  });

  addTags = handleAsync(async (req, res) => {
    const document = await documentService.addTags(
      req.params.id,
      req.body.tags,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Tags added successfully',
      data: document
    });
  });

  removeTags = handleAsync(async (req, res) => {
    const document = await documentService.removeTags(
      req.params.id,
      req.body.tags,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Tags removed successfully',
      data: document
    });
  });

  getByPatient = handleAsync(async (req, res) => {
    const documents = await documentService.getPatientDocuments(
      req.params.patientId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: documents
    });
  });

  getByType = handleAsync(async (req, res) => {
    const documents = await documentService.getDocumentsByType(
      req.params.type,
      req.query
    );

    res.status(200).json({
      success: true,
      data: documents
    });
  });

  getByTags = handleAsync(async (req, res) => {
    const { tags } = req.query;
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    
    const documents = await documentService.getDocumentsByTags(
      tagsArray,
      req.query
    );

    res.status(200).json({
      success: true,
      data: documents
    });
  });

  getUnverified = handleAsync(async (req, res) => {
    const documents = await documentService.getUnverifiedDocuments(req.query);

    res.status(200).json({
      success: true,
      data: documents
    });
  });

  getStatistics = handleAsync(async (req, res) => {
    const stats = await documentService.getStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });
  });
}

export default new DocumentController();
