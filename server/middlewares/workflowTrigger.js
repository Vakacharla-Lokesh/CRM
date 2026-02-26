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
export const processWorkflowTriggers = asyncCatch(async (req, res, next) => {
  // Skip if no workflow context or not an authenticated request
  if (!req.workflowContext || !req.user || !req.user.tenantId) {
    return next();
  }

  const { entityType, entityId, action, newData } = req.workflowContext;

  // Only process if entity was created/updated/deleted
  if (!entityType || !action) {
    return next();
  }

  try {
    // Find all active workflows for this tenant that match this action
    const matchingWorkflows = await workflowModel.find({
      tenantId: req.user.tenantId,
      isActive: true,
      "trigger.entity": entityType,
      "trigger.action": action,
    });

    if (matchingWorkflows.length === 0) {
      return next();
    }

    // Filter workflows by trigger conditions
    const triggeredWorkflows = matchingWorkflows.filter((workflow) => {
      return evaluateTriggerConditions(workflow.trigger.conditions, newData);
    });

    if (triggeredWorkflows.length === 0) {
      return next();
    }

    // Queue each triggered workflow
    for (const workflow of triggeredWorkflows) {
      await queueWorkflowExecution(
        req.user.tenantId,
        workflow,
        entityType,
        entityId,
        newData,
      );
    }

    // Continue to send response
    next();
  } catch (error) {
    // Log error but don't block the response
    console.error("Workflow trigger error:", error);
    next();
  }
});

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
      tenantId: tenantId.toString(),
      workflowId: workflow._id.toString(),
      workflow: {
        name: workflow.name,
        actions: workflow.actions,
      },
      entity: {
        type: entityType,
        id: entityId.toString(),
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
export function withWorkflowTriggers(entityType, action, controller) {
  return asyncCatch(async (req, res, next) => {
    // Capture context before
    req.workflowContext = {
      entityType,
      action,
      entityId: null,
      newData: null,
    };

    // Store the original send function
    const originalSend = res.send.bind(res);

    // Intercept the response to capture created/updated entity
    res.send = function (data) {
      // Parse response data
      try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;

        // Extract entity ID from response (adjust based on your response format)
        if (parsed.lead) {
          req.workflowContext.entityId = parsed.lead._id || parsed.lead.id;
          req.workflowContext.newData = parsed.lead;
        } else if (parsed.deal) {
          req.workflowContext.entityId = parsed.deal._id || parsed.deal.id;
          req.workflowContext.newData = parsed.deal;
        } else if (parsed.organization) {
          req.workflowContext.entityId =
            parsed.organization._id || parsed.organization.id;
          req.workflowContext.newData = parsed.organization;
        }
      } catch (e) {
        // Silently fail on parse error
      }

      // Call original send
      return originalSend(data);
    };

    // Call the controller
    await controller(req, res, next);

    // Process triggers after response is sent
    await processWorkflowTriggers(req, res, next);
  });
}

/**
 * Example: Using withWorkflowTriggers in a route
 *
 * import { withWorkflowTriggers } from '../middlewares/workflowTrigger.js';
 *
 * router.post(
 *   '/',
 *   authenticate,
 *   validate(leadsValidator.createLeadSchema),
 *   withWorkflowTriggers('lead', 'create', leadController.createLead),
 * );
 *
 * router.put(
 *   '/:id',
 *   authenticate,
 *   validateParams(z.object({ id: mongoIdSchema })),
 *   validate(leadsValidator.updateLeadSchema),
 *   withWorkflowTriggers('lead', 'update', leadController.updateLead),
 * );
 *
 * router.delete(
 *   '/:id',
 *   authenticate,
 *   validateParams(z.object({ id: mongoIdSchema })),
 *   withWorkflowTriggers('lead', 'delete', leadController.deleteLead),
 * );
 */

export default {
  captureRequestContext,
  processWorkflowTriggers,
  withWorkflowTriggers,
};
