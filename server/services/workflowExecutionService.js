import nodemailer from "nodemailer";
import { s3Manager } from "./s3Manager.js";
import workflowExecutionLogModel from "../models/workflowExecutionLogModel.js";
import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";

function initializeEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

class WorkflowExecutionEngine {
  constructor() {
    this.emailTransporter = initializeEmailTransporter();
  }

  /**
   * Execute a workflow
   *
   * @param {Object} message - Message from SQS queue
   * @returns {Promise<Object>} - Execution results
   */
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

      // Execute each action in sequence
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

          console.log(`    ✓ Success: ${result.message}`);
        } catch (actionError) {
          executionLog.results.push({
            actionIndex: i,
            actionType: action.type,
            status: "failed",
            message: actionError.message,
            error: actionError.message,
            executedAt: new Date(),
          });

          console.error(`    ✗ Failed: ${actionError.message}`);
          // Continue to next action (don't stop workflow)
        }
      }

      // Update execution log with success
      executionLog.status = "success";
      await this.updateExecutionLog(executionLogId, executionLog);

      console.log(`✓ Workflow completed: ${workflow.name}\n`);
      return { success: true, executionLogId, results: executionLog.results };
    } catch (error) {
      console.error(`✗ Workflow failed: ${workflow.name}`, error);

      // Determine if we should retry
      if (retryCount < maxRetries) {
        executionLog.status = "retry";
        console.log(
          `  ↻ Queuing for retry (${retryCount + 1}/${maxRetries})...`,
        );
      } else {
        executionLog.status = "failed";
        console.log(`  ✗ Max retries exceeded`);
      }

      await this.updateExecutionLog(executionLogId, executionLog);

      return {
        success: false,
        executionLogId,
        error: error.message,
        shouldRetry: retryCount < maxRetries,
        results: executionLog.results,
      };
    }
  }

  /**
   * Execute a single action
   */
  async executeAction(action, entity, tenantId) {
    switch (action.type) {
      case "send_email":
        return await this.executeSendEmail(action, entity);

      case "update_field":
        return await this.executeUpdateField(action, entity);

      case "webhook":
        return await this.executeWebhook(action, entity);

      case "export_s3":
        return await this.executeExportS3(action, entity, tenantId);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Action: Send Email
   */
  async executeSendEmail(action, entity) {
    const { recipient, subject, body } = action;

    // Resolve recipient from entity data
    const resolvedRecipient = this.resolveTemplateValue(recipient, entity.data);

    if (!resolvedRecipient || !resolvedRecipient.includes("@")) {
      throw new Error(`Invalid recipient email: ${resolvedRecipient}`);
    }

    const emailSubject = this.resolveTemplateValue(subject, entity.data);
    const emailBody = this.resolveTemplateValue(body, entity.data);

    // Send email
    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@campaignflux.com",
      to: resolvedRecipient,
      subject: emailSubject,
      html: emailBody,
    });

    return {
      message: `Email sent to ${resolvedRecipient}`,
    };
  }

  /**
   * Action: Update Field
   */
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

  /**
   * Action: Call Webhook
   */
  async executeWebhook(action, entity) {
    const { webhookUrl, method = "POST", payload } = action;

    if (!webhookUrl) {
      throw new Error("Webhook URL not specified");
    }

    const resolvedPayload = this.resolveTemplateValue(payload, entity.data);

    const response = await fetch(webhookUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timestamp: new Date(),
        entity,
        ...resolvedPayload,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Webhook returned ${response.status}: ${await response.text()}`,
      );
    }

    return {
      message: `Webhook called: ${webhookUrl}`,
    };
  }

  /**
   * Action: Export to S3
   */
  async executeExportS3(action, entity, tenantId) {
    const {
      format = "json",
      bucket = "crm-workflows",
      prefix = "exports/",
    } = action;

    const filename = `${prefix}${entity.type}-${entity.id}-${Date.now()}.${format}`;

    let content;
    if (format === "json") {
      content = JSON.stringify(entity.data, null, 2);
    } else if (format === "csv") {
      content = this.convertToCSV(entity.data);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }

    const url = await s3Manager.uploadString(
      bucket,
      filename,
      content,
      format === "json" ? "application/json" : "text/csv",
    );

    return {
      message: `Exported to S3: ${url}`,
    };
  }

  /**
   * Resolve template values (e.g., "${lead.email}" → actual email)
   */
  resolveTemplateValue(template, data) {
    if (!template) return null;

    if (typeof template === "object") {
      // Recursively resolve nested objects
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

    // Replace ${field} with actual values
    return template.replace(/\$\{([^}]+)\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value ?? match;
    });
  }

  /**
   * Get nested value by path (e.g., "organization.size")
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, part) => current?.[part], obj);
  }

  /**
   * Convert object to CSV
   */
  convertToCSV(obj) {
    const keys = Object.keys(obj);
    const headers = keys.join(",");
    const values = keys
      .map((key) => {
        const value = obj[key];
        if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",");

    return `${headers}\n${values}`;
  }

  /**
   * Get Model class for entity type
   */
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

  /**
   * Update execution log in database
   */
  async updateExecutionLog(executionLogId, updates) {
    await workflowExecutionLogModel.findByIdAndUpdate(executionLogId, {
      ...updates,
      updatedAt: new Date(),
    });
  }
}

// Export singleton
export const workflowExecutionEngine = new WorkflowExecutionEngine();
export default workflowExecutionEngine;
