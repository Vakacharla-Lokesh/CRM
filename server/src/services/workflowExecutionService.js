import workflowExecutionLogModel from "../models/workflows/workflowExecutionLogModel.js";
import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";

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
    const { title, description, assignee } = action;

    const resolvedTitle = this.resolveTemplateValue(title, entity.data);
    const resolvedDescription = this.resolveTemplateValue(
      description,
      entity.data,
    );
    const resolvedAssignee = this.resolveTemplateValue(assignee, entity.data);

    return {
      message: `Task created: "${resolvedTitle}" assigned to ${resolvedAssignee}`,
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

    // Send with retry
    const result = await sendSlackMessageWithRetry(
      webhookUrl,
      messageTemplate,
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

    return template.replace(/\$\{([^}]+)\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
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
