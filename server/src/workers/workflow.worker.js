import { workflowExecutionEngine } from "../services/workflowExecutionService.js";
import { JOB_TYPES } from "../modules/jobs/job.types.js";
import { logger } from "../utils/logger.js";

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

  logger.info("[WorkflowWorker] Workflow execution complete", { status: result.status });

  return {
    success: result.status === "success",
    shouldRetry: result.status === "retry",
    message: `Workflow execution ${result.status}`,
  };
}
