import { Router } from "express";
import {
  getAllCalls,
  getCallById,
  createCall,
  updateCall,
  deleteCall,
  getCallsByLead,
} from "../controllers/callController.js";
import { validate } from "../../../middlewares/validate.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../../../middlewares/rbac.js";
import {
  createCallSchema,
  updateCallSchema,
} from "../validators/callsValidator.js";

const router = Router();

router.get(
  "/",
  authenticateRequest,
  requirePermission("calls:read"),
  injectTenantContext,
  getAllCalls,
);
router.get(
  "/:id",
  authenticateRequest,
  requirePermission("calls:read"),
  injectTenantContext,
  getCallById,
);
router.post(
  "/",
  authenticateRequest,
  requirePermission("calls:write"),
  injectTenantContext,
  validate(createCallSchema),
  createCall,
);
router.put(
  "/:id",
  authenticateRequest,
  requirePermission("calls:write"),
  injectTenantContext,
  validate(updateCallSchema),
  updateCall,
);
router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("calls:delete"),
  injectTenantContext,
  deleteCall,
);
router.get(
  "/lead/:leadId",
  authenticateRequest,
  requirePermission("calls:read"),
  injectTenantContext,
  getCallsByLead,
);

export default router;
