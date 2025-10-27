import {
  createPatient,
  listPatients,
  getPatientById,
  getPatientByUserId,
  updatePatient,
  updatePatientByUserId,
  deletePatient
} from '../services/patient.service.js';

export default {
  create: async (req, res, next) => {
    try {
      const patient = await createPatient(req.body, req.user?.sub);
      res.status(201).json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const result = await listPatients(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const patient = await getPatientById(req.params.id);
      res.json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  },

  getMyProfile: async (req, res, next) => {
    try {
      const patient = await getPatientByUserId(req.user.sub);
      res.json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const patient = await updatePatient(req.params.id, req.body, req.user?.sub);
      res.json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  },

  updateMyProfile: async (req, res, next) => {
    try {
      const patient = await updatePatientByUserId(req.user.sub, req.body);
      res.json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const patient = await deletePatient(req.params.id);
      res.json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  }
};
