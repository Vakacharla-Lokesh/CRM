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
import { validate } from "../../../middlewares/validate.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../../../middlewares/rbac.js";
import {
  createWorkflowSchema,
  updateWorkflowSchema,
} from "../validators/workflowValidator.js";

const router = Router();
router.use(authenticateRequest);
router.use(injectTenantContext);

router.get("/", requirePermission("settings:read"), getAllWorkflows);
router.get("/:id", requirePermission("settings:read"), getWorkflowById);
router.post(
  "/",
  requirePermission("settings:write"),
  validate(createWorkflowSchema),
  createWorkflow,
);
router.put(
  "/:id",
  requirePermission("settings:write"),
  validate(updateWorkflowSchema),
  updateWorkflow,
);
router.patch(
  "/:id/toggle",
  requirePermission("settings:write"),
  toggleWorkflow,
);
router.delete("/:id", requirePermission("settings:write"), deleteWorkflow);
router.get("/:id/logs", requirePermission("settings:read"), getWorkflowLogs);

export default router;
