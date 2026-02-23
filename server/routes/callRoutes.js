import { Router } from "express";
import {
  getAllCalls,
  getCallById,
  createCall,
  updateCall,
  deleteCall,
  getCallsByLead,
} from "../controllers/callController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  createCallSchema,
  updateCallSchema,
} from "../validators/callsValidator.js";
import passport from "../config/passport.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Routes
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getAllCalls,
);

router.get(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getCallById,
);

router.post(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(createCallSchema),
  createCall,
);

router.put(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(updateCallSchema),
  updateCall,
);

router.delete(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  deleteCall,
);

router.get(
  "/lead/:leadId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getCallsByLead,
);

export default router;
