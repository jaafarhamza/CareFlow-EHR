import { createRole, listRoles, getRoleById, updateRole, deleteRole } from "../services/role.service.js";

export default {
  create: async (req, res, next) => {
    try {
      const created = await createRole(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (e) { next(e); }
  },
  list: async (req, res, next) => {
    try {
      const result = await listRoles(req.query);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  },
  getById: async (req, res, next) => {
    try {
      const role = await getRoleById(req.params.id);
      res.json({ success: true, data: role });
    } catch (e) { next(e); }
  },
  update: async (req, res, next) => {
    try {
      const updated = await updateRole(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (e) { next(e); }
  },
  delete: async (req, res, next) => {
    try {
      await deleteRole(req.params.id);
      res.status(204).end();
    } catch (e) { next(e); }
  },
};
