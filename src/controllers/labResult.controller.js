import labResultService from '../services/labResult.service.js';
import { handleAsync } from '../utils/async.util.js';

class LabResultController {
  create = handleAsync(async (req, res) => {
    const labResult = await labResultService.createLabResult(
      req.body,
      req.user.sub
    );

    res.status(201).json({
      success: true,
      message: 'Lab result created successfully',
      data: labResult
    });
  });

  list = handleAsync(async (req, res) => {
    const result = await labResultService.listLabResults(
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
    const labResult = await labResultService.getLabResultById(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: labResult
    });
  });

  getByOrderId = handleAsync(async (req, res) => {
    const labResult = await labResultService.getLabResultByOrderId(
      req.params.labOrderId,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: labResult
    });
  });

  update = handleAsync(async (req, res) => {
    const labResult = await labResultService.updateLabResult(
      req.params.id,
      req.body,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab result updated successfully',
      data: labResult
    });
  });

  delete = handleAsync(async (req, res) => {
    await labResultService.deleteLabResult(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab result deleted successfully'
    });
  });

  validate = handleAsync(async (req, res) => {
    const labResult = await labResultService.validateLabResult(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab result validated successfully',
      data: labResult
    });
  });

  release = handleAsync(async (req, res) => {
    const labResult = await labResultService.releaseLabResult(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab result released successfully',
      data: labResult
    });
  });

  markForValidation = handleAsync(async (req, res) => {
    const labResult = await labResultService.markForValidation(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Lab result marked for validation successfully',
      data: labResult
    });
  });

  uploadPdf = handleAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const labResult = await labResultService.uploadPdfReport(
      req.params.id,
      req.file,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'PDF report uploaded successfully',
      data: labResult
    });
  });

  getByPatient = handleAsync(async (req, res) => {
    const labResults = await labResultService.getPatientLabResults(
      req.params.patientId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: labResults
    });
  });

  getByDoctor = handleAsync(async (req, res) => {
    const labResults = await labResultService.getDoctorLabResults(
      req.params.doctorId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: labResults
    });
  });

  getCritical = handleAsync(async (req, res) => {
    const labResults = await labResultService.getCriticalLabResults(req.query);

    res.status(200).json({
      success: true,
      data: labResults
    });
  });

  getPendingValidation = handleAsync(async (req, res) => {
    const labResults = await labResultService.getPendingValidation(req.query);

    res.status(200).json({
      success: true,
      data: labResults
    });
  });

  getByStatus = handleAsync(async (req, res) => {
    const labResults = await labResultService.getLabResultsByStatus(
      req.params.status,
      req.query
    );

    res.status(200).json({
      success: true,
      data: labResults
    });
  });

  getStatistics = handleAsync(async (req, res) => {
    const stats = await labResultService.getStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });
  });
}

export default new LabResultController();
