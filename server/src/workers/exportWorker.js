import exportCsvEngine from "../services/exportToCsvService.js";
import { JOB_TYPES } from "../utils/jobTypes.js";
import { logger } from "../utils/logger.js";

export const jobType = JOB_TYPES.EXPORT_DATA;

export async function handler(payload, context) {
  const { tenantId } = context;

  if (payload._meta?.tenantId && payload._meta.tenantId !== tenantId) {
    throw new Error(
      `[ExportWorker] Tenant mismatch: context=${tenantId}, payload=${payload._meta.tenantId}`,
    );
  }

  const entityType = payload.entity?.type;
  logger.info("[ExportWorker] Processing export", { entityType });

  let result;

  switch (entityType) {
    case "leads":
      result = await exportCsvEngine.exportLeads(payload);
      break;
    case "deals":
      result = await exportCsvEngine.exportDeals(payload);
      break;
    case "organizations":
      result = await exportCsvEngine.exportOrganizations(payload);
      break;
    default:
      throw new Error(`[ExportWorker] Unknown entity type: ${entityType}`);
  }

  logger.info("[ExportWorker] Export completed", { entityType, count: result.count || 0 });

  return {
    success: result.success === true,
    shouldRetry: false,
    message: `Export completed: ${entityType} (${result.count || 0} rows)`,
  };
}
