import consultationService from '../services/consultation.service.js';

const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class ConsultationController {
  create = handleAsync(async (req, res) => {
    const consultation = await consultationService.createConsultation(
      req.body,
      req.user.sub
    );

    res.status(201).json({
      success: true,
      message: 'Consultation created successfully',
      data: consultation
    });
  });

  list = handleAsync(async (req, res) => {
    const result = await consultationService.listConsultations(
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
    const consultation = await consultationService.getConsultationById(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: consultation
    });
  });

  update = handleAsync(async (req, res) => {
    const consultation = await consultationService.updateConsultation(
      req.params.id,
      req.body,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Consultation updated successfully',
      data: consultation
    });
  });

  delete = handleAsync(async (req, res) => {
    await consultationService.deleteConsultation(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Consultation deleted successfully'
    });
  });

  getMyConsultations = handleAsync(async (req, res) => {
    const consultations = await consultationService.getMyConsultations(
      req.user.sub,
      req.user.role,
      req.query
    );

    res.status(200).json({
      success: true,
      data: consultations
    });
  });

  getByPatient = handleAsync(async (req, res) => {
    const consultations = await consultationService.getPatientConsultations(
      req.params.patientId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: consultations
    });
  });

  getByDoctor = handleAsync(async (req, res) => {
    const consultations = await consultationService.getDoctorConsultations(
      req.params.doctorId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: consultations
    });
  });

  getByAppointment = handleAsync(async (req, res) => {
    const consultation = await consultationService.getConsultationByAppointment(
      req.params.appointmentId,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: consultation
    });
  });
}

export default new ConsultationController();
