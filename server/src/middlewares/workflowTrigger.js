import workflowModel from "../models/workflows/workflowModel.js";
import workflowExecutionLogModel from "../models/workflows/workflowExecutionLogModel.js";
import { jobDispatcher } from "../modules/jobs/jobDispatcher.js";
import { JOB_TYPES } from "../utils/jobTypes.js";
import asyncCatch from "../utils/asyncCatch.js";

export const captureRequestContext = (req, res, next) => {
  req.workflowContext = {
    entityType: null,
    entityId: null,
    action: null,
    originalData: null,
    newData: null,
  };
  next();
};

export async function fireWorkflowTrigger(
  req,
  entityType,
  action,
  entityId,
  newData,
) {
  if (!req.user?.userId) return;

  try {
    const matchingWorkflows = await workflowModel.find({
      createdBy: req.user.userId,
      isActive: true,
      "trigger.entity": entityType,
      "trigger.action": action,
    });

    if (!matchingWorkflows.length) return;

    const triggeredWorkflows = matchingWorkflows.filter((workflow) =>
      evaluateTriggerConditions(workflow.trigger.conditions, newData),
    );

    if (!triggeredWorkflows.length) return;

    for (const workflow of triggeredWorkflows) {
      await queueWorkflowExecution(
        workflow.tenantId,
        workflow,
        entityType,
        entityId,
        newData,
      );
    }
  } catch (error) {
    console.error("Workflow trigger error:", error);
  }
}

function evaluateTriggerConditions(conditions, data) {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return true;
  }

  return conditions.every((condition) => {
    const { field, operator, value } = condition;
    const fieldValue = getNestedValue(data, field);

    switch (operator) {
      case "equals":
        return fieldValue === value;

      case "gte":
        return Number(fieldValue) >= Number(value);

      case "lte":
        return Number(fieldValue) <= Number(value);

      case "contains":
        return String(fieldValue).includes(String(value));

      case "startsWith":
        return String(fieldValue).startsWith(String(value));

      case "isEmpty":
        return !fieldValue || fieldValue === "" || fieldValue.length === 0;

      case "isNotEmpty":
        return fieldValue && fieldValue !== "" && fieldValue.length > 0;

      default:
        return false;
    }
  });
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((current, part) => current?.[part], obj);
}

async function queueWorkflowExecution(
  tenantId,
  workflow,
  entityType,
  entityId,
  entityData,
) {
  try {
    const executionLog = await workflowExecutionLogModel.create({
      tenantId,
      workflowId: workflow._id,
      entityType,
      entityId,
      status: "queued",
      triggeredAt: new Date(),
    });

    const message = {
      executionLogId: executionLog._id.toString(),
      tenantId: tenantId ? tenantId.toString() : null,
      workflowId: workflow._id.toString(),
      workflow: {
        name: workflow.name,
        actions: workflow.actions,
      },
      entity: {
        type: entityType,
        id: entityId ? entityId.toString() : null,
        data: entityData,
      },
      retryCount: 0,
      maxRetries: 3,
    };

    const { messageId } = await jobDispatcher.dispatch({
      jobType: JOB_TYPES.WORKFLOW_EXECUTION,
      payload: message,
      tenantId: tenantId ? tenantId.toString() : null,
    });

    await workflowExecutionLogModel.findByIdAndUpdate(executionLog._id, {
      sqsMessageId: messageId,
      status: "processing",
    });

    console.log(
      `✓ Workflow triggered: ${workflow.name} (execution: ${executionLog._id})`,
    );

    await workflowModel.findByIdAndUpdate(workflow._id, {
      $inc: { totalExecutions: 1 },
      lastExecuted: new Date(),
    });
  } catch (error) {
    console.error("Failed to queue workflow:", error);
  }
}

export default {
  captureRequestContext,
  fireWorkflowTrigger,
};
