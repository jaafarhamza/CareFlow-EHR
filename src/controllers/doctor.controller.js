import {
  createDoctor,
  listDoctors,
  getDoctorById,
  getDoctorByUserId,
  updateDoctor,
  updateDoctorByUserId,
  deleteDoctor
} from '../services/doctor.service.js';

export default {
  create: async (req, res, next) => {
    try {
      const doctor = await createDoctor(req.body, req.user?.sub);
      res.status(201).json({ success: true, data: doctor });
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const result = await listDoctors(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const doctor = await getDoctorById(req.params.id);
      res.json({ success: true, data: doctor });
    } catch (error) {
      next(error);
    }
  },

  getMyProfile: async (req, res, next) => {
    try {
      const doctor = await getDoctorByUserId(req.user.sub);
      res.json({ success: true, data: doctor });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const doctor = await updateDoctor(req.params.id, req.body, req.user?.sub);
      res.json({ success: true, data: doctor });
    } catch (error) {
      next(error);
    }
  },

  updateMyProfile: async (req, res, next) => {
    try {
      const doctor = await updateDoctorByUserId(req.user.sub, req.body);
      res.json({ success: true, data: doctor });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const doctor = await deleteDoctor(req.params.id);
      res.json({ success: true, data: doctor });
    } catch (error) {
      next(error);
    }
  }
};
