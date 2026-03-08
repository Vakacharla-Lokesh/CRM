import leadModel from "../models/leadModel.js";
import AppError from "../utils/appError.js";
import { updateLeadScore } from "../utils/leadScoreUtils.js";
import {
  getDefaultPipeline,
  validateStatusInPipeline,
} from "./pipelineService.js";

export const getAllLeads = async (filter, { limit = 20, cursor } = {}) => {
  if (cursor) {
    const lastUpdatedAt = Buffer.from(cursor, "base64").toString("utf8");
    filter.updatedAt = { $lt: new Date(lastUpdatedAt) };
  }

  const leads = await leadModel
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(limit + 1);

  const hasNextPage = leads.length > limit;
  if (hasNextPage) leads.pop();

  const nextCursor =
    hasNextPage && leads.length > 0
      ? Buffer.from(leads[leads.length - 1].updatedAt.toISOString()).toString(
          "base64",
        )
      : null;

  return { leads, nextCursor, hasNextPage };
};

export const getLeadById = async (id, tenantId) => {
  const lead = await leadModel.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);

  if (tenantId && lead.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden: You cannot access this lead", 403);
  }

  return lead;
};

export const createLead = async (leadData) => {
  let pipelineId = leadData.pipelineId ?? null;

  if (!pipelineId) {
    const defaultPipeline = await getDefaultPipeline(leadData.createdBy);
    if (defaultPipeline) {
      pipelineId = defaultPipeline._id;
    }
  }

  if (pipelineId && leadData.status) {
    await validateStatusInPipeline(pipelineId, leadData.status);
  }

  const lead = await leadModel.create({ ...leadData, pipelineId });
  await updateLeadScore(lead._id);
  return leadModel.findById(lead._id);
};

export const updateLead = async (id, tenantId, updates, lastKnownUpdatedAt) => {
  const lead = await leadModel.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);

  if (tenantId && lead.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden: You cannot update this lead", 403);
  }

  if (lastKnownUpdatedAt) {
    const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
    const serverTimestamp = new Date(lead.updatedAt).getTime();

    if (clientTimestamp !== serverTimestamp) {
      throw new AppError(
        "This lead was modified by someone else. Please refresh and try again.",
        409,
      );
    }
  }

  const updatedLead = await leadModel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  await updateLeadScore(id);
  return leadModel.findById(id);
};

export const deleteLead = async (id, tenantId) => {
  const lead = await leadModel.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);

  if (tenantId && lead.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden: You cannot delete this lead", 403);
  }

  await leadModel.findByIdAndDelete(id);
  return lead;
};

export const getLeadsByTenant = async (tenantId) => {
  return leadModel.find({ tenantId });
};

export const getLeadsByUser = async (userId, tenantId) => {
  const filter = { assignedTo: userId };
  if (tenantId) filter.tenantId = tenantId;
  return leadModel.find(filter);
};

export const getLeadsByOrganization = async (organizationId, tenantId) => {
  const filter = { organizationId };
  if (tenantId) filter.tenantId = tenantId;
  return leadModel.find(filter);
};

export const updateLeadStatus = async (
  id,
  tenantId,
  status,
  lastKnownUpdatedAt,
) => {
  const lead = await leadModel.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);

  if (tenantId && lead.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden: You cannot update this lead", 403);
  }

  if (lastKnownUpdatedAt) {
    const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
    const serverTimestamp = new Date(lead.updatedAt).getTime();
    if (clientTimestamp !== serverTimestamp) {
      throw new AppError(
        "This lead was modified by someone else. Please refresh and try again.",
        409,
      );
    }
  }

  if (lead.pipelineId) {
    await validateStatusInPipeline(lead.pipelineId, status);
  }

  const previousStatus = lead.status;
  lead.status = status;
  await lead.save();

  await updateLeadScore(id);
  const updatedLead = await leadModel.findById(id);

  return { updatedLead, previousStatus };
};

export const updateLeadScoreManually = async (
  id,
  tenantId,
  score,
  lastKnownUpdatedAt,
) => {
  const lead = await leadModel.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);

  if (tenantId && lead.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden: You cannot update this lead", 403);
  }

  if (lastKnownUpdatedAt) {
    const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
    const serverTimestamp = new Date(lead.updatedAt).getTime();
    if (clientTimestamp !== serverTimestamp) {
      throw new AppError(
        "This lead was modified by someone else. Please refresh and try again.",
        409,
      );
    }
  }

  lead.score = score;
  await lead.save();
  return lead;
};

export const convertLeadToDeal = async (id, tenantId, dealData, userId) => {
  const lead = await leadModel.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);

  if (tenantId && lead.tenantId?.toString() !== tenantId?.toString()) {
    throw new AppError("Forbidden: You cannot convert this lead", 403);
  }

  if (lead.status === "Converted") {
    throw new AppError("Lead has already been converted to a deal", 400);
  }

  const dealModel = (await import("../models/dealModel.js")).default;

  const deal = await dealModel.create({
    leadId: lead._id,
    organizationId: lead.organizationId,
    tenantId: lead.tenantId,
    userId: lead.assignedTo || lead.createdBy || userId,
    name: `${lead.firstName} ${lead.lastName || ""}`.trim(),
    value: dealData.value || 0,
    status: dealData.status || "Prospecting",
  });

  lead.status = "Converted";
  await lead.save();

  return { deal, lead };
};

export const searchLeads = async (
  filter,
  { q, status, source, limit = 25 },
) => {
  if (!q || q.trim() === "") {
    throw new AppError("Search query 'q' is required", 400);
  }

  const searchRegex = new RegExp(q.trim(), "i");

  filter.$or = [
    { firstName: searchRegex },
    { lastName: searchRegex },
    { email: searchRegex },
  ];

  if (status) filter.status = status;
  if (source) filter.source = source;

  return leadModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(limit), 25));
};

export const assignLead = async (id, tenantId, assignedTo) => {
  if (!assignedTo) throw new AppError("assignedTo userId is required", 400);

  const lead = await leadModel.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);

  if (tenantId && lead.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden: You cannot assign this lead", 403);
  }

  const previousAssignee = lead.assignedTo?.toString() || null;
  lead.assignedTo = assignedTo;
  await lead.save();

  return { lead, previousAssignee };
};
