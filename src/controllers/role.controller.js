import {
  createRole,
  listRoles,
  getRoleById,
  updateRole,
  deleteRole
} from '../services/role.service.js';

export default {
  create: async (req, res, next) => {
    try {
      const created = await createRole(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const result = await listRoles(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const role = await getRoleById(req.params.id);
      res.json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const updated = await updateRole(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await deleteRole(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
};
