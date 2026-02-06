import { Router } from "express";
import leadModel from "../models/leadModel.js";
import { validate } from "../middlewares/validate.js";
import { createLeadSchema } from "../validators/leads.validators.js";

const router = Router();

router.get("/all", async (req, res) => {
  const leads = await leadModel.find();

  res.json(leads);
});

router.post("/create", validate(createLeadSchema), async (req, res) => {
  console.log(req.body);
  const lead = await leadModel.create(req.body);
  res.status(201).json(lead);
});

router.post("/logout", (req, res) => {
  res.json({ message: "User logged out" });
});

router.post("/refresh", (req, res) => {
  res.json({ message: "Token refreshed" });
});

export default router;
