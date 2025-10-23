import {
  adminCreateUser,
  adminListUsers,
  adminGetUserProfile,
  adminUpdateUser,
  adminSuspendUser,
  adminReactivateUser,
  adminDeleteUser
} from '../services/user.service.js';

export default {
  create: async (req, res, next) => {
    try {
      const user = await adminCreateUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const result = await adminListUsers(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const user = await adminGetUserProfile(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const user = await adminUpdateUser(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  suspend: async (req, res, next) => {
    try {
      const user = await adminSuspendUser(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  reactivate: async (req, res, next) => {
    try {
      const user = await adminReactivateUser(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const user = await adminDeleteUser(req.params.id, req.user?.sub);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
};
