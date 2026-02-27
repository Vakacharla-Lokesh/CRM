import exportCsvEngine from "../../services/exportToCsvService.js";
import { JOB_TYPES } from "../modules/jobs/job.types.js";

export const jobType = JOB_TYPES.EXPORT_DATA;

export async function handler(payload, context) {
  const { tenantId } = context;

  if (payload._meta?.tenantId && payload._meta.tenantId !== tenantId) {
    throw new Error(
      `[ExportWorker] Tenant mismatch: context=${tenantId}, payload=${payload._meta.tenantId}`,
    );
  }

  const entityType = payload.entity?.type;
  console.log(
    `[ExportWorker] Processing export: ${entityType} (tenant: ${tenantId})`,
  );

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

  return {
    success: result.success === true,
    shouldRetry: false,
    message: `Export completed: ${entityType} (${result.count || 0} rows)`,
  };
}
