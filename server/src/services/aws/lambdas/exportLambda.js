import exportCsvEngine from "../../../services/exportToCsvService.js";
import { JOB_TYPES } from "../../../utils/jobTypes.js";
import { logger } from "../../../utils/logger.js";
import { requestStore } from "../../../utils/requestContext.js";
import mongoose from "mongoose";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../../../.env") });

export const jobType = JOB_TYPES.EXPORT_DATA;

export async function handler(payload, context) {
  const { tenantId } = context;

  console.log("[ExportLambda] 🚀 Handler called", {
    tenantId,
    payloadKeys: Object.keys(payload),
    entityType: payload.entity?.type,
    email: payload.email,
    idCount: payload.ids?.length,
  });

  if (payload._meta?.tenantId && payload._meta.tenantId !== tenantId) {
    throw new Error(
      `[ExportWorker] Tenant mismatch: context=${tenantId}, payload=${payload._meta.tenantId}`,
    );
  }

  const entityType = payload.entity?.type;
  console.log("[ExportLambda] Processing export", { entityType, tenantId });
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

  console.log("[ExportLambda] ✓ Export completed", {
    entityType,
    count: result.count || 0,
    success: result.success,
  });

  logger.info("[ExportWorker] Export completed", {
    entityType,
    count: result.count || 0,
  });

  return {
    success: result.success === true,
    shouldRetry: false,
    message: `Export completed: ${entityType} (${result.count || 0} rows)`,
  };
}

let _dbConnected = false;

async function ensureDb() {
  if (_dbConnected) return;
  const uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("[ExportWorker Lambda] No MongoDB URI found");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    logger.info("[ExportWorker Lambda] Connected to MongoDB");
  }
  _dbConnected = true;
}

export const lambdaHandler = async (event, _context) => {
  await ensureDb();

  const records = event.Records;

  if (records) {
    const batchItemFailures = [];

    for (const record of records) {
      try {
        const body = JSON.parse(record.body);
        const context = {
          tenantId: body.tenantId || body.payload?._meta?.tenantId,
          userId: body.payload?._meta?.userId || null,
          requestId: body.payload?._meta?.requestId || record.messageId,
          traceId: body.payload?._meta?.traceId || null,
        };

        const result = await new Promise((resolve, reject) => {
          requestStore.run(
            { ...context, tenantId: context.tenantId?.toString(), jobType },
            () =>
              handler(body.payload || body, context)
                .then(resolve)
                .catch(reject),
          );
        });

        if (result.shouldRetry) {
          batchItemFailures.push({ itemIdentifier: record.messageId });
        }
      } catch (err) {
        logger.error("[ExportWorker Lambda] Record failed", {
          error: err.message,
          messageId: record.messageId,
        });
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }

    return { batchItemFailures };
  }

  // Direct invocation
  const context = {
    tenantId: event.detail?.tenantId || event.tenantId,
    userId: event.detail?.userId || null,
    requestId: event.detail?.requestId || "direct-invoke",
    traceId: event.detail?.traceId || null,
  };

  const payload = event.detail || event;

  const result = await new Promise((resolve, reject) => {
    requestStore.run(
      { ...context, tenantId: context.tenantId?.toString(), jobType },
      () => handler(payload, context).then(resolve).catch(reject),
    );
  });

  return { statusCode: 200, body: JSON.stringify(result) };
};
