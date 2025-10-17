import {
  adminCreateUser,
  adminListUsers,
  adminGetUserProfile,
  adminUpdateUser,
  adminSuspendUser,
  adminReactivateUser,
  adminDeleteUser,
} from "../services/user.service.js";

export default {
  create: async (req, res, next) => {
    try {
      const user = await adminCreateUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (e) { next(e); }
  },
  list: async (req, res, next) => {
    try {
      const result = await adminListUsers(req.query);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  },
  getById: async (req, res, next) => {
    try {
      const user = await adminGetUserProfile(req.params.id);
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  },
  update: async (req, res, next) => {
    try {
      const user = await adminUpdateUser(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  },
  suspend: async (req, res, next) => {
    try {
      const user = await adminSuspendUser(req.params.id);
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  },
  reactivate: async (req, res, next) => {
    try {
      const user = await adminReactivateUser(req.params.id);
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  },
  delete: async (req, res, next) => {
    try {
      const user = await adminDeleteUser(req.params.id, req.user?.sub);
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  },
};


