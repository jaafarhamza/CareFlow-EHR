import { Router } from "express";
import validate from "../middlewares/validate.middleware.js";
import { requireAuth, requireRoles } from "../middlewares/auth.middleware.js";
import userController from "../controllers/user.controller.js";
import { createUserSchema, updateUserSchema, listUsersQuerySchema, getUserByIdSchema } from "../validations/user.validation.js";

const router = Router();

// Admin protected routes
router.use(requireAuth, requireRoles());

router.post("/", validate(createUserSchema), userController.create);
router.get("/", validate(listUsersQuerySchema, "query"), userController.list);
router.get("/:id", validate(getUserByIdSchema, "params"), userController.getById);
router.patch("/:id", validate(getUserByIdSchema, "params"), validate(updateUserSchema), userController.update);
router.post("/:id/suspend", validate(getUserByIdSchema, "params"), userController.suspend);
router.post("/:id/reactivate", validate(getUserByIdSchema, "params"), userController.reactivate);
router.delete("/:id", validate(getUserByIdSchema, "params"), userController.delete);

export default router;