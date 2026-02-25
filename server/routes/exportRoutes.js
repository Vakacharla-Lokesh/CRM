import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { injectTenantFilter } from "../middlewares/rbac.js";

const router = Router();

const auth = [authenticate, injectTenantFilter];

router.get("/leads", ...auth);
router.get("/organizations", ...auth);
router.get("/deals", ...auth);

export default router;
