import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../../../.env") });

import { JOB_TYPES } from "../../../utils/jobTypes.js";
import { logger } from "../../../utils/logger.js";
import { requestStore } from "../../../utils/requestContext.js";
import {
  saveAnalyticsSnapshot,
  getAllTenantsWithUsers,
  TENANT_SCOPE_KEY,
} from "../../../modules/analytics/services/analyticsSnapshotService.js";

export const jobType = JOB_TYPES.ANALYTICS_SNAPSHOT;

export async function handler(_payload, _context) {
  logger.info("[AnalyticsSnapshotWorker] Starting nightly snapshot run");

  const tenants = await getAllTenantsWithUsers();

  if (tenants.length === 0) {
    logger.info("[AnalyticsSnapshotWorker] No active tenants found, skipping");
    return { success: true, shouldRetry: false, message: "No active tenants" };
  }

  let successCount = 0;
  let failCount = 0;

  for (const { tenantId, userIds } of tenants) {
    try {
      await saveAnalyticsSnapshot(
        tenantId,
        TENANT_SCOPE_KEY,
        { tenantId },
        { tenantId },
      );
      successCount++;
    } catch (err) {
      failCount++;
      logger.error(
        `[AnalyticsSnapshotWorker] Tenant snapshot failed: ${tenantId}`,
        {
          error: err.message,
        },
      );
    }

    for (const userId of userIds) {
      try {
        const leadFilter = { tenantId, assignedTo: userId };
        const dealFilter = { tenantId, userId };

        await saveAnalyticsSnapshot(
          tenantId,
          userId.toString(),
          leadFilter,
          dealFilter,
        );
        successCount++;
      } catch (err) {
        failCount++;
        logger.error(
          `[AnalyticsSnapshotWorker] User snapshot failed — tenant: ${tenantId}, user: ${userId}`,
          { error: err.message },
        );
      }
    }
  }

  const totalSnapshots = tenants.reduce(
    (sum, t) => sum + 1 + t.userIds.length,
    0,
  );
  const message = `Snapshot run complete. Total: ${totalSnapshots}, Success: ${successCount}, Failed: ${failCount}`;

  logger.info(`[AnalyticsSnapshotWorker] ${message}`);

  return { success: true, shouldRetry: false, message };
}

let _dbConnected = false;

async function ensureDb() {
  if (_dbConnected) return;
  const uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!uri)
    throw new Error("[AnalyticsSnapshotWorker Lambda] No MongoDB URI found");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    logger.info("[AnalyticsSnapshotWorker Lambda] Connected to MongoDB");
  }
  _dbConnected = true;
}

export const lambdaHandler = async (event, _context) => {
  await ensureDb();

  const context = {
    tenantId: event.detail?.tenantId || "system-scheduler",
    userId: null,
    requestId: event.detail?.requestId || "scheduled-run",
    traceId: event.detail?.traceId || null,
  };

  const result = await new Promise((resolve, reject) => {
    requestStore.run(
      { ...context, tenantId: context.tenantId?.toString(), jobType },
      () =>
        handler(event.detail || {}, context)
          .then(resolve)
          .catch(reject),
    );
  });

  return { statusCode: 200, body: JSON.stringify(result) };
};
