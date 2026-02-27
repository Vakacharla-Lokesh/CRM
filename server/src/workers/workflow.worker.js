import { workflowExecutionEngine } from "../../services/workflowExecutionService.js";
import { JOB_TYPES } from "../modules/jobs/job.types.js";

export const jobType = JOB_TYPES.WORKFLOW_EXECUTION;

export async function handler(payload, context) {
  const { tenantId } = context;

  if (payload._meta?.tenantId && payload._meta.tenantId !== tenantId) {
    throw new Error(
      `[WorkflowWorker] Tenant mismatch: context=${tenantId}, payload=${payload._meta.tenantId}`,
    );
  }

  console.log(
    `[WorkflowWorker] Processing workflow execution (tenant: ${tenantId})`,
  );

  const result = await workflowExecutionEngine.executeWorkflow(payload);

  return {
    success: result.status === "success",
    shouldRetry: result.status === "retry",
    message: `Workflow execution ${result.status}`,
  };
}
