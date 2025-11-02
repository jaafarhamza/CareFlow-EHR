import prescriptionService from '../services/prescription.service.js';

const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class PrescriptionController {
  create = handleAsync(async (req, res) => {
    const prescription = await prescriptionService.createPrescription(
      req.body,
      req.user.sub
    );

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });
  });

  list = handleAsync(async (req, res) => {
    const result = await prescriptionService.listPrescriptions(
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
    const prescription = await prescriptionService.getPrescriptionById(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: prescription
    });
  });

  update = handleAsync(async (req, res) => {
    const prescription = await prescriptionService.updatePrescription(
      req.params.id,
      req.body,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: prescription
    });
  });

  delete = handleAsync(async (req, res) => {
    await prescriptionService.deletePrescription(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  });

  sign = handleAsync(async (req, res) => {
    const prescription = await prescriptionService.signPrescription(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Prescription signed successfully',
      data: prescription
    });
  });

  sendToPharmacy = handleAsync(async (req, res) => {
    const prescription = await prescriptionService.sendToPharmacy(
      req.params.id,
      req.body.pharmacyId,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Prescription sent to pharmacy successfully',
      data: prescription
    });
  });

  dispense = handleAsync(async (req, res) => {
    const prescription = await prescriptionService.dispensePrescription(
      req.params.id,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Prescription dispensed successfully',
      data: prescription
    });
  });

  cancel = handleAsync(async (req, res) => {
    const prescription = await prescriptionService.cancelPrescription(
      req.params.id,
      req.body.reason,
      req.user.sub,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Prescription cancelled successfully',
      data: prescription
    });
  });

  getMyPrescriptions = handleAsync(async (req, res) => {
    const prescriptions = await prescriptionService.getMyPrescriptions(
      req.user.sub,
      req.user.role,
      req.query
    );

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  });

  getByPatient = handleAsync(async (req, res) => {
    const prescriptions = await prescriptionService.getPatientPrescriptions(
      req.params.patientId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  });

  getByDoctor = handleAsync(async (req, res) => {
    const prescriptions = await prescriptionService.getDoctorPrescriptions(
      req.params.doctorId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  });

  getByPharmacy = handleAsync(async (req, res) => {
    const prescriptions = await prescriptionService.getPharmacyPrescriptions(
      req.params.pharmacyId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  });

  getByConsultation = handleAsync(async (req, res) => {
    const prescriptions = await prescriptionService.getConsultationPrescriptions(
      req.params.consultationId
    );

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  });

  getActive = handleAsync(async (req, res) => {
    const prescriptions = await prescriptionService.getActivePrescriptions(
      req.params.patientId
    );

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  });
}

export default new PrescriptionController();
