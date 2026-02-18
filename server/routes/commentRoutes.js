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
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/commentsValidator.js";

const router = Router();

// Routes
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getAllComments,
);

router.get(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getCommentById,
);

router.post(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(createCommentSchema),
  createComment,
);

router.put(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(updateCommentSchema),
  updateComment,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  deleteComment,
);

router.get(
  "/lead/:leadId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getCommentsByLead,
);

export default router;
