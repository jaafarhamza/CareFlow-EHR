import { Router } from "express";
import validate from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { attachPermissions, requirePermissions } from "../middlewares/rbac.middleware.js";
import { PERMISSIONS } from "../utils/constants.js";
import roleController from "../controllers/role.controller.js";
import { createRoleSchema, updateRoleSchema, listRolesQuerySchema, getRoleByIdSchema } from "../validations/role.validation.js";

const router = Router();

router.use(requireAuth, attachPermissions, requirePermissions(PERMISSIONS.ROLE_MANAGE));

router.post("/", validate(createRoleSchema), roleController.create);
router.get("/", validate(listRolesQuerySchema, "query"), roleController.list);
router.get("/:id", validate(getRoleByIdSchema, "params"), roleController.getById);
router.patch("/:id", validate(getRoleByIdSchema, "params"), validate(updateRoleSchema), roleController.update);
router.delete("/:id", validate(getRoleByIdSchema, "params"), roleController.delete);

export default router;
