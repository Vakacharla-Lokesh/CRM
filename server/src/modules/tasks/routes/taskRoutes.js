import { Router } from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController.js";
import { validate } from "../../../middlewares/validate.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../../../middlewares/rbac.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "../validators/taskValidator.js";

const router = Router();

router.get(
  "/",
  authenticateRequest,
  requirePermission("tasks:read"),
  injectTenantContext,
  getAllTasks,
);
router.get(
  "/:id",
  authenticateRequest,
  requirePermission("tasks:read"),
  injectTenantContext,
  getTaskById,
);
router.post(
  "/",
  authenticateRequest,
  requirePermission("tasks:write"),
  injectTenantContext,
  validate(createTaskSchema),
  createTask,
);
router.put(
  "/:id",
  authenticateRequest,
  requirePermission("tasks:write"),
  injectTenantContext,
  validate(updateTaskSchema),
  updateTask,
);
router.patch(
  "/:id/status",
  authenticateRequest,
  requirePermission("tasks:write"),
  injectTenantContext,
  validate(updateTaskStatusSchema),
  updateTaskStatus,
);
router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("tasks:delete"),
  injectTenantContext,
  deleteTask,
);

export default router;
