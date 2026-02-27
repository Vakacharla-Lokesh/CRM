import { Router } from "express";
import {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentsByLead,
} from "../controllers/commentController.js";
import { validate } from "../middlewares/validate.js";
import { authenticateRequest } from "../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../middlewares/rbac.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/commentsValidator.js";

const router = Router();

router.get(
  "/",
  authenticateRequest,
  requirePermission("comments:read"),
  injectTenantContext,
  getAllComments,
);
router.get(
  "/:id",
  authenticateRequest,
  requirePermission("comments:read"),
  injectTenantContext,
  getCommentById,
);
router.post(
  "/",
  authenticateRequest,
  requirePermission("comments:write"),
  injectTenantContext,
  validate(createCommentSchema),
  createComment,
);
router.put(
  "/:id",
  authenticateRequest,
  requirePermission("comments:write"),
  injectTenantContext,
  validate(updateCommentSchema),
  updateComment,
);
router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("comments:delete"),
  injectTenantContext,
  deleteComment,
);
router.get(
  "/lead/:leadId",
  authenticateRequest,
  requirePermission("comments:read"),
  injectTenantContext,
  getCommentsByLead,
);

export default router;
