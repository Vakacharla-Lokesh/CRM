import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";
import CampaignTemplate from "../models/campaignTemplateModel.js";
import {
  createTemplateSchema,
  updateTemplateSchema,
} from "../validators/campaignTemplateValidator.js";

function getTenantId(req) {
  return req.tenantContext?.scope === "tenant"
    ? req.tenantContext.tenantId
    : null;
}

export const listTemplates = asyncCatch(async (req, res) => {
  const tenantId = getTenantId(req);
  const templates = await CampaignTemplate.find({ tenantId })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ count: templates.length, templates });
});

export const createTemplate = asyncCatch(async (req, res) => {
  const parsed = createTemplateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  const tenantId = getTenantId(req);
  const template = await CampaignTemplate.create({
    ...parsed.data,
    tenantId,
    createdBy: req.auth.userId,
  });

  res.status(201).json({ template });
});

export const updateTemplate = asyncCatch(async (req, res) => {
  const parsed = updateTemplateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  const tenantId = getTenantId(req);
  const template = await CampaignTemplate.findOneAndUpdate(
    { _id: req.params.id, tenantId },
    { $set: parsed.data },
    { new: true, runValidators: true },
  ).lean();

  if (!template) throw new AppError("Template not found", 404);
  res.json({ template });
});

export const deleteTemplate = asyncCatch(async (req, res) => {
  const tenantId = getTenantId(req);
  const template = await CampaignTemplate.findOneAndDelete({
    _id: req.params.id,
    tenantId,
  });
  if (!template) throw new AppError("Template not found", 404);
  res.json({ message: "Template deleted" });
});

export const incrementTemplateUsage = asyncCatch(async (req, res) => {
  const tenantId = getTenantId(req);
  await CampaignTemplate.findOneAndUpdate(
    { _id: req.params.id, tenantId },
    { $inc: { usageCount: 1 } },
  );
  res.json({ ok: true });
});
