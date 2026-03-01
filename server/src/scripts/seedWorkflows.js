import Workflow from "../models/workflows/workflowModel.js";

export async function seedWorkflows(tenants, users) {
  // Clear existing workflows
  await Workflow.deleteMany({});

  const allWorkflows = [];

  for (const tenant of tenants) {
    const tenantUsers = users.filter(
      (u) =>
        u.tenantId.toString() === tenant._id.toString() &&
        u.role !== "super_admin",
    );

    if (tenantUsers.length === 0) continue; // Skip if no eligible users

    const adminUser = tenantUsers[0]; // Use first available user

    const workflows = [
      {
        tenantId: tenant._id,
        createdBy: adminUser._id,
        name: "Auto-assign high-score leads",
        description:
          "Automatically assign leads with score > 80 to sales team member",
        isActive: true,
        trigger: {
          entity: "lead",
          action: "create",
          conditions: [
            {
              field: "leadScore",
              operator: "gte",
              value: 80,
            },
          ],
        },
        actions: [
          {
            type: "update_field",
            targetField: "userId",
            value:
              tenantUsers[Math.floor(Math.random() * tenantUsers.length)]._id,
          },
        ],
      },
      {
        tenantId: tenant._id,
        createdBy: adminUser._id,
        name: "Mark dead leads after inactivity",
        description: "Update lead status to Dead if not contacted in 90 days",
        isActive: true,
        trigger: {
          entity: "lead",
          action: "update",
          conditions: [
            {
              field: "leadStatus",
              operator: "equals",
              value: "New",
            },
          ],
        },
        actions: [
          {
            type: "update_field",
            targetField: "leadStatus",
            value: "Follow-Up",
          },
        ],
      },
      {
        tenantId: tenant._id,
        createdBy: adminUser._id,
        name: "Send email on deal creation",
        description: "Send confirmation email when a new deal is created",
        isActive: true,
        trigger: {
          entity: "deal",
          action: "create",
          conditions: [],
        },
        actions: [
          {
            type: "send_email",
            subject: "New Deal Created",
            body: "A new deal has been created. Review and update as needed.",
            recipient: "admin@example.com",
          },
        ],
      },
      {
        tenantId: tenant._id,
        createdBy: adminUser._id,
        name: "Webhook notification on won deals",
        description: "Send webhook when a deal is marked as won",
        isActive: false, // Disabled by default as webhook URL is example
        trigger: {
          entity: "deal",
          action: "update",
          conditions: [
            {
              field: "dealStatus",
              operator: "equals",
              value: "Won",
            },
          ],
        },
        actions: [
          {
            type: "webhook",
            webhookUrl: "https://webhook.site/example-id",
            method: "POST",
            payload: {
              event: "deal.won",
            },
          },
        ],
      },
      {
        tenantId: tenant._id,
        createdBy: adminUser._id,
        name: "Create task on organization created",
        description: "Create follow-up task when new organization is added",
        isActive: true,
        trigger: {
          entity: "organization",
          action: "create",
          conditions: [],
        },
        actions: [
          {
            type: "create_task",
          },
        ],
      },
      {
        tenantId: tenant._id,
        createdBy: adminUser._id,
        name: "Export high-value deals",
        description: "Export deals over $50k to S3 for reporting",
        isActive: false, // Disabled by default as S3 bucket is example
        trigger: {
          entity: "deal",
          action: "update",
          conditions: [
            {
              field: "dealValue",
              operator: "gte",
              value: 50000,
            },
          ],
        },
        actions: [
          {
            type: "export_s3",
            format: "json",
            bucket: "crm-exports",
            prefix: `deals/high-value/${new Date().getFullYear()}`,
          },
        ],
        schedule: {
          enabled: false,
          cronExpression: "0 0 1 * *", // First day of month at midnight
        },
      },
    ];

    const created = await Workflow.insertMany(workflows);
    allWorkflows.push(...created);
  }

  return allWorkflows;
}
