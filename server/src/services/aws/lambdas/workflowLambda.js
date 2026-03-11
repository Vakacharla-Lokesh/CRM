import { workflowExecutionEngine } from "../../../modules/workflows/services/workflowExecutionService.js";
import { JOB_TYPES } from "../../../utils/jobTypes.js";
import { logger } from "../../../utils/logger.js";
import { requestStore } from "../../../utils/requestContext.js";
import mongoose from "mongoose";
import envConfig from "../../../config/envConfig.js";

export const jobType = JOB_TYPES.WORKFLOW_EXECUTION;

export async function handler(payload, context) {
  const { tenantId } = context;

  if (payload._meta?.tenantId && payload._meta.tenantId !== tenantId) {
    throw new Error(
      `[WorkflowWorker] Tenant mismatch: context=${tenantId}, payload=${payload._meta.tenantId}`,
    );
  }

  logger.info("[WorkflowWorker] Processing workflow execution");

  const result = await workflowExecutionEngine.executeWorkflow(payload);

  logger.info("[WorkflowWorker] Workflow execution complete", {
    status: result.status,
  });

  return {
    success: result.status === "success",
    shouldRetry: result.status === "retry",
    message: `Workflow execution ${result.status}`,
  };
}

let _dbConnected = false;

async function ensureDb() {
  if (_dbConnected) return;
  const uri = envConfig.dbUri;
  if (!uri) throw new Error("[WorkflowWorker Lambda] No MongoDB URI found");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    logger.info("[WorkflowWorker Lambda] Connected to MongoDB");
  }
  _dbConnected = true;
}

export const lambdaHandler = async (event, _context) => {
  await ensureDb();

  // Supports both direct invocation and SQS record wrapping
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
        logger.error("[WorkflowWorker Lambda] Record failed", {
          error: err.message,
          messageId: record.messageId,
        });
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }

    return { batchItemFailures };
  }

  // Direct EventBridge / test invocation
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
