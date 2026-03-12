import { Router } from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";
import { validate } from "../../../middlewares/validate.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import {
  requirePermission,
  injectTenantContext,
} from "../../../middlewares/rbac.js";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../validators/roleValidators.js";

const router = Router();

// All role routes require authentication + tenant scoping
router.use(authenticateRequest, injectTenantContext);

router.get("/", requirePermission("roles:read"), getAllRoles);

router.get("/:id", requirePermission("roles:read"), getRoleById);

router.post(
  "/",
  requirePermission("roles:write"),
  validate(createRoleSchema),
  createRole,
);

router.put(
  "/:id",
  requirePermission("roles:write"),
  validate(updateRoleSchema),
  updateRole,
);

router.delete("/:id", requirePermission("roles:delete"), deleteRole);

export default router;
