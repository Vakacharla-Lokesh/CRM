import { Router } from "express";
import {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  toggleWorkflow,
  getWorkflowLogs,
} from "../controllers/workflowController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import {
  createWorkflowSchema,
  updateWorkflowSchema,
} from "../validators/workflowValidator.js";
import passport from "../config/passport.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// List all workflows for tenant
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  getAllWorkflows,
);

// Get single workflow
router.get(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getWorkflowById,
);

// Create workflow
router.post(
  "/",
  authenticate,
  authorize("admin", "super_admin"),
  validate(createWorkflowSchema),
  createWorkflow,
);

// Update workflow
router.put(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  validate(updateWorkflowSchema),
  updateWorkflow,
);

// Toggle active/inactive
router.patch(
  "/:id/toggle",
  authenticate,
  authorize("admin", "super_admin"),
  toggleWorkflow,
);

// Delete workflow
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  deleteWorkflow,
);

// Get execution logs for a workflow
router.get(
  "/:id/logs",
  authenticate,
  authorize("admin", "super_admin"),
  getWorkflowLogs,
);

export default router;
