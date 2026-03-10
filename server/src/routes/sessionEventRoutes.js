import { Router } from "express";
import { batchCreateSessionEvents } from "../controllers/sessionEventController.js";

const router = Router();

router.post("/batch", batchCreateSessionEvents);

export default router;
