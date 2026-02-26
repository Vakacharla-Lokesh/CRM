/**
 * WORKFLOW TRIGGER MIDDLEWARE
 *
 * Detects which workflows should execute based on the current request
 * Queues matched workflows to SQS for async processing
 *
 * File: server/middlewares/workflowTrigger.js
 */

import workflowModel from "../models/workflows/workflowModel.js";
import workflowExecutionLogModel from "../models/workflows/workflowExecutionLogModel.js";
import { queueManager } from "../services/queueManager.js";
import asyncCatch from "../utils/asyncCatch.js";

/**
 * Attach workflow context to request for later use
 * Called BEFORE controller
 */
export const captureRequestContext = (req, res, next) => {
  // Store original data for comparison
  req.workflowContext = {
    entityType: null,
    entityId: null,
    action: null,
    originalData: null,
    newData: null,
  };
  next();
};

/**
 * Process workflow triggers
 * Called AFTER controller (in route handler or wrapper)
 *
 * Usage in route:
 * router.post('/',
 *   authenticate,
 *   captureRequestContext,
 *   asyncCatch(leadController.createLead),
 *   processWorkflowTriggers  // ← Add this
 * );
 */
/**
 * Fire workflow triggers from within a controller.
 * Call this after a successful DB mutation, before res.json().
 *
 * @param {Object} req       - Express request (needs req.user.userId)
 * @param {string} entityType - 'lead' | 'deal' | 'organization' | 'call' | 'comment'
 * @param {string} action     - 'create' | 'update' | 'delete'
 * @param {*}      entityId   - MongoDB ObjectId of the entity
 * @param {Object} newData    - Plain entity document (call .toObject() if needed)
 */
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
    // Never re-throw – workflow failures must not affect the HTTP response
    console.error("Workflow trigger error:", error);
  }
}

/**
 * Evaluate trigger conditions against entity data
 *
 * @param {Array} conditions - Array of { field, operator, value }
 * @param {Object} data - Entity data to check against
 * @returns {boolean} - True if all conditions match
 */
function evaluateTriggerConditions(conditions, data) {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return true; // No conditions = always trigger
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

/**
 * Get nested object value by dot notation
 * e.g., "organization.size" → data.organization.size
 */
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, part) => current?.[part], obj);
}

/**
 * Queue workflow for async execution via SQS
 * Also creates execution log for audit trail
 */
async function queueWorkflowExecution(
  tenantId,
  workflow,
  entityType,
  entityId,
  entityData,
) {
  try {
    // Create execution log (status: queued)
    const executionLog = await workflowExecutionLogModel.create({
      tenantId,
      workflowId: workflow._id,
      entityType,
      entityId,
      status: "queued",
      triggeredAt: new Date(),
    });

    // Prepare message for SQS
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

    // Push to SQS queue
    const messageId = await queueManager.sendMessage(message);

    // Update execution log with SQS message ID
    await workflowExecutionLogModel.findByIdAndUpdate(executionLog._id, {
      sqsMessageId: messageId,
      status: "processing",
    });

    console.log(
      `✓ Workflow triggered: ${workflow.name} (execution: ${executionLog._id})`,
    );

    // Increment workflow execution count
    await workflowModel.findByIdAndUpdate(workflow._id, {
      $inc: { totalExecutions: 1 },
      lastExecuted: new Date(),
    });
  } catch (error) {
    console.error("Failed to queue workflow:", error);
    // Don't re-throw - we don't want to block the original request
  }
}

/**
 * Wrapper to use in route handlers
 *
 * Usage:
 * const createLeadWithTriggers = withWorkflowTriggers(
 *   'lead',
 *   'create',
 *   leadController.createLead
 * );
 *
 * router.post('/', authenticate, createLeadWithTriggers);
 */
export default {
  captureRequestContext,
  fireWorkflowTrigger,
};
