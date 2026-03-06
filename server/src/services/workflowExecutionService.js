import workflowExecutionLogModel from "../models/workflows/workflowExecutionLogModel.js";
import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";
import taskModel from "../models/taskModel.js";

import emailController from "../controllers/emailController.js";
import {
  sendSlackMessageWithRetry,
  buildSlackVariables,
} from "./slackService.js";

class WorkflowExecutionEngine {
  constructor() {}

  async executeWorkflow(message) {
    const {
      executionLogId,
      workflow,
      entity,
      tenantId,
      retryCount = 0,
      maxRetries = 3,
    } = message;

    const executionLog = {
      results: [],
      status: "processing",
    };

    try {
      console.log(
        `\n▶ Starting workflow: ${workflow.name} (Execution: ${executionLogId})`,
      );

      for (let i = 0; i < workflow.actions.length; i++) {
        const action = workflow.actions[i];
        console.log(
          `  → Action ${i + 1}/${workflow.actions.length}: ${action.type}`,
        );

        try {
          const result = await this.executeAction(action, entity, tenantId);

          executionLog.results.push({
            actionIndex: i,
            actionType: action.type,
            status: "success",
            message: result.message,
            executedAt: new Date(),
          });

          console.log(`    ✓ ${result.message}`);
        } catch (error) {
          console.error(`    ✗ Action failed:`, error.message);

          executionLog.results.push({
            actionIndex: i,
            actionType: action.type,
            status: "failed",
            error: error.message,
            executedAt: new Date(),
          });

          if (action.critical) {
            throw error;
          }
        }
      }

      executionLog.status = "success";
      console.log(`✓ Workflow completed: ${workflow.name}\n`);
    } catch (error) {
      executionLog.status = "failed";
      executionLog.error = error.message;
      console.error(`✗ Workflow failed: ${error.message}\n`);

      if (retryCount < maxRetries) {
        console.log(`⟳ Scheduling retry ${retryCount + 1}/${maxRetries}...`);
        executionLog.status = "retry";
      }
    }

    await this.updateExecutionLog(executionLogId, executionLog);

    return executionLog;
  }

  async executeAction(action, entity, tenantId) {
    switch (action.type) {
      case "send_email":
        return await this.executeSendEmail(action, entity);

      case "update_field":
        return await this.executeUpdateField(action, entity);

      case "create_task":
        return await this.executeCreateTask(action, entity, tenantId);

      case "webhook":
        return await this.executeWebhook(action, entity);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  async executeSendEmail(action, entity) {
    const { subject, body, recipient } = action;

    const resolvedRecipient = this.resolveTemplateValue(recipient, entity.data);
    const resolvedSubject = this.resolveTemplateValue(subject, entity.data);
    const resolvedBody = this.resolveTemplateValue(body, entity.data);

    await emailController.sendEmail({
      to: resolvedRecipient,
      subject: resolvedSubject,
      html: resolvedBody,
    });

    return {
      message: `Email sent to ${resolvedRecipient}`,
    };
  }

  async executeUpdateField(action, entity) {
    const { targetField, value } = action;
    const Model = this.getModelForEntity(entity.type);
    const resolvedValue = this.resolveTemplateValue(value, entity.data);

    const updated = await Model.findByIdAndUpdate(
      entity.id,
      { [targetField]: resolvedValue },
      { new: true },
    );

    if (!updated) {
      throw new Error(`${entity.type} not found: ${entity.id}`);
    }

    return {
      message: `Field ${targetField} updated to ${resolvedValue}`,
    };
  }

  async executeCreateTask(action, entity, tenantId) {
    const {
      taskTitle,
      taskDescription,
      taskPriority = "medium",
      taskAssignedTo,
      taskDueDate,
      taskRelationType,
      taskRelationFromTrigger = true,
    } = action;

    // Build variables from entity for template resolution
    const variables = buildSlackVariables(entity.data, entity.type, null);

    const resolvedTitle = this.resolveTemplate(taskTitle, variables);
    const resolvedDescription = this.resolveTemplate(
      taskDescription,
      variables,
    );
    const resolvedPriority = this.resolveTemplate(taskPriority, variables);
    const resolvedAssignedTo = this.resolveTemplate(taskAssignedTo, variables);
    const resolvedDueDate = this.resolveTemplate(taskDueDate, variables);

    if (!resolvedTitle) {
      throw new Error("create_task action missing taskTitle");
    }

    // Determine relation — default to the triggering entity
    let relationType = null;
    let relationId = null;

    if (taskRelationFromTrigger && entity.type && entity.id) {
      // Only lead/deal/organization are valid task relation types
      if (["lead", "deal", "organization"].includes(entity.type)) {
        relationType = entity.type;
        relationId = entity.id;
      }
    } else if (taskRelationType) {
      relationType = taskRelationType;
    }

    const taskData = {
      tenantId,
      title: resolvedTitle,
      description: resolvedDescription || undefined,
      priority: resolvedPriority || "medium",
      status: "todo",
      relationType,
      relationId,
      dueDate: resolvedDueDate ? new Date(resolvedDueDate) : null,
      assignedTo: resolvedAssignedTo || null,
      createdBy: null, // system-created via workflow
    };

    const task = await taskModel.create(taskData);

    return {
      message: `Task created: "${task.title}" (id: ${task._id})`,
    };
  }

  async executeWebhook(action, entity) {
    const { webhookUrl, messageTemplate } = action;

    // Validate
    if (!webhookUrl) {
      throw new Error("Webhook action missing webhookUrl");
    }
    if (!messageTemplate) {
      throw new Error("Webhook action missing messageTemplate");
    }

    // Build variables for Slack message
    const variables = buildSlackVariables(entity.data, entity.type, null);

    const resolvedTemplate = this.resolveTemplate(messageTemplate, variables);

    // Send with retry
    const result = await sendSlackMessageWithRetry(
      webhookUrl,
      resolvedTemplate,
      variables,
      2, // max retries
    );

    if (!result.success) {
      throw new Error(`Slack webhook failed: ${result.error}`);
    }

    console.log(`✓ Slack sent (${result.attempts} attempt(s))`);

    return {
      message: `Slack notification sent (${result.attempts} attempt(s))`,
    };
  }

  // Resolve {{variable}} templates against a flat variables object (Slack-style)
  resolveTemplate(template, variables) {
    if (!template || typeof template !== "string") return template ?? null;
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return variables?.[key.trim()] ?? match;
    });
  }

  // Legacy resolver for send_email / update_field that use raw entity.data paths
  resolveTemplateValue(template, data) {
    if (!template) return null;

    if (typeof template === "object") {
      return Object.fromEntries(
        Object.entries(template).map(([key, val]) => [
          key,
          this.resolveTemplateValue(val, data),
        ]),
      );
    }

    if (typeof template !== "string") {
      return template;
    }

    // Support both {{var}} and ${var} syntax
    return template
      .replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const value = this.getNestedValue(data, path.trim());
        return value ?? match;
      })
      .replace(/\$\{([^}]+)\}/g, (match, path) => {
        const value = this.getNestedValue(data, path.trim());
        return value ?? match;
      });
  }

  getNestedValue(obj, path) {
    return path.split(".").reduce((current, part) => current?.[part], obj);
  }

  getModelForEntity(entityType) {
    const models = {
      lead: leadModel,
      deal: dealModel,
      organization: organizationModel,
    };

    if (!models[entityType]) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    return models[entityType];
  }

  async updateExecutionLog(executionLogId, updates) {
    await workflowExecutionLogModel.findByIdAndUpdate(executionLogId, {
      ...updates,
      updatedAt: new Date(),
    });
  }
}

export const workflowExecutionEngine = new WorkflowExecutionEngine();
export default workflowExecutionEngine;
