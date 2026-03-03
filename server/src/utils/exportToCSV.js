import leadModel from "../models/leadModel.js";
import organizationModel from "../models/organizationModel.js";
import dealModel from "../models/dealModel.js";
import AppError from "../utils/AppError.js";

export const EXPORT_COLUMNS = {
  leads: [
    "firstName",
    "lastName",
    "email",
    "source",
    "status",
    "score",
    "createdAt",
    "updatedAt",
  ],
  organizations: [
    "name",
    "website",
    "size",
    "industry",
    "createdAt",
    "updatedAt",
  ],
  deals: [
    "dealId",
    "name",
    "value",
    "status",
    "leadId",
    "organizationId",
    "userId",
    "createdAt",
    "updatedAt",
  ],
};

export function transformDocToRow(doc, columns) {
  const row = {};
  for (const col of columns) {
    const value = doc[col];
    if (value instanceof Date) {
      row[col] = value.toISOString();
    } else if (typeof value === "object" && value !== null) {
      row[col] = JSON.stringify(value);
    } else {
      row[col] = value ?? "";
    }
  }
  return row;
}

export async function getExportCursor(entityType, filter = {}) {
  switch (entityType) {
    case "leads":
      return leadModel.find(filter).lean().cursor({ batchSize: 1000 });
    case "organizations":
      return organizationModel.find(filter).lean().cursor({ batchSize: 1000 });
    case "deals":
      return dealModel.find(filter).lean().cursor({ batchSize: 1000 });
    default:
      throw new AppError("Invalid entity type", 400);
  }
}

export default {
  transformDocToRow,
  getExportCursor,
  EXPORT_COLUMNS,
};
