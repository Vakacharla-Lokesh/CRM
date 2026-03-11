import mongoose from "mongoose";
import AppError from "../utils/appError.js";

import { getDefaultPipeline } from "../modules/pipelines/services/pipelineService.js";

import {
  normaliseRow,
  normaliseOrgRow,
  normaliseDealRow,
  parseFile,
  validateRow,
  validateOrgRow,
  validateDealRow,
} from "../utils/importHelpers.js";

import leadModel from "../modules/leads/models/leadModel.js";
import organizationModel from "../modules/organizations/models/organizationModel.js";
import dealModel from "../modules/deals/models/dealModel.js";

export async function bulkImportLeads(file, context) {
  const { userId, tenantId, defaultStatus, defaultSource } = context;

  let rawRows;
  try {
    rawRows = parseFile(file);
  } catch (err) {
    throw new AppError(`Could not parse file: ${err.message}`, 400);
  }

  if (!rawRows || rawRows.length === 0) {
    throw new AppError(
      "The uploaded file is empty or has no readable rows",
      400,
    );
  }

  if (rawRows.length > 1000) {
    throw new AppError("Import limit is 1000 rows per upload", 400);
  }

  const defaultPipeline = await getDefaultPipeline(userId);
  const defaultPipelineId = defaultPipeline?._id ?? null;

  const validDocs = [];
  const errors = [];

  for (let i = 0; i < rawRows.length; i++) {
    const normalised = normaliseRow(rawRows[i]);

    const error = validateRow(normalised, i);
    if (error) {
      errors.push(error);
      continue;
    }

    validDocs.push({
      firstName: normalised.firstName.trim(),
      lastName: normalised.lastName?.trim() ?? null,
      email: normalised.email?.trim() ?? undefined,
      source: normalised.source ?? defaultSource,
      status: normalised.status ?? defaultStatus,
      score: normalised.score !== undefined ? Number(normalised.score) : 0,
      assignedTo: normalised.assignedTo
        ? new mongoose.Types.ObjectId(normalised.assignedTo)
        : new mongoose.Types.ObjectId(userId),
      createdBy: new mongoose.Types.ObjectId(userId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
      pipelineId: defaultPipelineId,
      idempotencyKey: normalised.email
        ? `import:${tenantId}:${normalised.email.toLowerCase()}`
        : null,
    });
  }

  if (validDocs.length === 0) {
    return { imported: 0, skipped: 0, failed: errors.length, errors };
  }

  const keysToCheck = validDocs.map((d) => d.idempotencyKey).filter(Boolean);

  const existingKeys = new Set(
    (
      await leadModel
        .find({ idempotencyKey: { $in: keysToCheck } })
        .select("idempotencyKey")
        .lean()
    ).map((d) => d.idempotencyKey),
  );

  const newDocs = validDocs.filter(
    (d) => !d.idempotencyKey || !existingKeys.has(d.idempotencyKey),
  );
  const skipped = validDocs.length - newDocs.length;

  let imported = 0;
  if (newDocs.length > 0) {
    const inserted = await leadModel.insertMany(newDocs, { ordered: false });
    imported = inserted.length;
  }

  return {
    imported,
    skipped,
    failed: errors.length,
    errors,
  };
}

export async function bulkImportOrganizations(file, context) {
  const { userId, tenantId } = context;

  let rawRows;
  try {
    rawRows = parseFile(file);
  } catch (err) {
    throw new AppError(`Could not parse file: ${err.message}`, 400);
  }

  if (!rawRows || rawRows.length === 0) {
    throw new AppError(
      "The uploaded file is empty or has no readable rows",
      400,
    );
  }
  if (rawRows.length > 1000) {
    throw new AppError("Import limit is 1000 rows per upload", 400);
  }

  const validDocs = [];
  const errors = [];

  for (let i = 0; i < rawRows.length; i++) {
    const normalised = normaliseOrgRow(rawRows[i]);

    const error = validateOrgRow(normalised, i);
    if (error) {
      errors.push(error);
      continue;
    }

    validDocs.push({
      name: normalised.name.trim(),
      website: normalised.website.trim(),
      industry: normalised.industry,
      size: normalised.size !== undefined ? Number(normalised.size) : undefined,
      city: normalised.city?.trim() ?? undefined,
      country: normalised.country?.trim() ?? undefined,
      userId: new mongoose.Types.ObjectId(userId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
      idempotencyKey: `import:${tenantId}:org:${normalised.name.trim().toLowerCase()}`,
    });
  }

  if (validDocs.length === 0) {
    return { imported: 0, skipped: 0, failed: errors.length, errors };
  }

  const keysToCheck = validDocs.map((d) => d.idempotencyKey);

  const existingKeys = new Set(
    (
      await organizationModel
        .find({ idempotencyKey: { $in: keysToCheck } })
        .select("idempotencyKey")
        .lean()
    ).map((d) => d.idempotencyKey),
  );

  const newDocs = validDocs.filter((d) => !existingKeys.has(d.idempotencyKey));
  const skipped = validDocs.length - newDocs.length;

  let imported = 0;
  if (newDocs.length > 0) {
    const inserted = await organizationModel.insertMany(newDocs, {
      ordered: false,
    });
    imported = inserted.length;
  }

  return { imported, skipped, failed: errors.length, errors };
}

export async function bulkImportDeals(file, context) {
  const { userId, tenantId, defaultStatus } = context;

  let rawRows;
  try {
    rawRows = parseFile(file);
  } catch (err) {
    throw new AppError(`Could not parse file: ${err.message}`, 400);
  }

  if (!rawRows || rawRows.length === 0) {
    throw new AppError(
      "The uploaded file is empty or has no readable rows",
      400,
    );
  }
  if (rawRows.length > 1000) {
    throw new AppError("Import limit is 1000 rows per upload", 400);
  }

  const validDocs = [];
  const errors = [];

  const candidateLeadIds = [];

  for (let i = 0; i < rawRows.length; i++) {
    const normalised = normaliseDealRow(rawRows[i]);
    const error = validateDealRow(normalised, i);
    if (error) {
      errors.push(error);
      continue;
    }
    candidateLeadIds.push(normalised.leadId.trim());
    validDocs.push({ _normalisedIndex: i, ...normalised });
  }

  const existingLeadIds = new Set(
    (
      await leadModel
        .find({
          _id: {
            $in: candidateLeadIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
          tenantId: new mongoose.Types.ObjectId(tenantId),
        })
        .select("_id")
        .lean()
    ).map((d) => d._id.toString()),
  );

  const confirmedDocs = [];
  for (const doc of validDocs) {
    if (!existingLeadIds.has(doc.leadId.trim())) {
      errors.push(
        `Row ${doc._normalisedIndex + 1}: leadId '${doc.leadId}' does not exist or does not belong to this tenant`,
      );
      continue;
    }

    confirmedDocs.push({
      name: doc.name.trim(),
      leadId: new mongoose.Types.ObjectId(doc.leadId.trim()),
      organizationId: doc.organizationId
        ? new mongoose.Types.ObjectId(doc.organizationId.trim())
        : undefined,
      value: doc.value !== undefined ? Number(doc.value) : 0,
      status: doc.status ?? defaultStatus ?? "Prospecting",
      userId: new mongoose.Types.ObjectId(userId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
      idempotencyKey: `import:${tenantId}:deal:${doc.name.trim().toLowerCase()}:${doc.leadId.trim()}`,
    });
  }

  if (confirmedDocs.length === 0) {
    return { imported: 0, skipped: 0, failed: errors.length, errors };
  }

  const keysToCheck = confirmedDocs.map((d) => d.idempotencyKey);

  const existingKeys = new Set(
    (
      await dealModel
        .find({ idempotencyKey: { $in: keysToCheck } })
        .select("idempotencyKey")
        .lean()
    ).map((d) => d.idempotencyKey),
  );

  const newDocs = confirmedDocs.filter(
    (d) => !existingKeys.has(d.idempotencyKey),
  );
  const skipped = confirmedDocs.length - newDocs.length;

  let imported = 0;
  if (newDocs.length > 0) {
    const inserted = await dealModel.insertMany(newDocs, { ordered: false });
    imported = inserted.length;
  }

  return { imported, skipped, failed: errors.length, errors };
}
