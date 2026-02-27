import { Router } from "express";
import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  searchTenants,
} from "../controllers/tenantController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate, checkActive } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  createTenantSchema,
  updateTenantSchema,
} from "../validators/tenantsValidator.js";
import passport from "../config/passport.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Routes - Only super_admin can manage tenants
router.get("/", authenticate, authorize("super_admin"), getAllTenants);

router.get("/search", authenticate, authorize("super_admin"), searchTenants);

router.get("/:id", authenticate, authorize("super_admin"), getTenantById);

router.post(
  "/",
  authenticate,
  checkActive,
  authorize("super_admin"),
  validate(createTenantSchema),
  createTenant,
);

router.put(
  "/:id",
  authenticate,
  checkActive,
  authorize("super_admin"),
  validate(updateTenantSchema),
  updateTenant,
);

router.delete("/:id", authenticate, authorize("super_admin"), deleteTenant);

export default router;
