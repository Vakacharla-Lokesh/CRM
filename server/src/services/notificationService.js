import {
  broadcastToTenant,
  notifyUser as notifyUserSocket,
} from "../config/socketServer.js";

export const notificationTypes = {
  // Lead events
  LEAD_CREATED: "lead_created",
  LEAD_UPDATED: "lead_updated",
  LEAD_DELETED: "lead_deleted",
  LEAD_CONVERTED: "lead_converted",
  LEAD_ASSIGNED: "lead_assigned",

  // Deal events
  DEAL_CREATED: "deal_created",
  DEAL_UPDATED: "deal_updated",
  DEAL_DELETED: "deal_deleted",
  DEAL_WON: "deal_won",
  DEAL_LOST: "deal_lost",
  DEAL_ASSIGNED: "deal_assigned",

  // Organization events
  ORG_CREATED: "organization_created",
  ORG_UPDATED: "organization_updated",
  ORG_DELETED: "organization_deleted",

  // User & Team events
  USER_ADDED: "user_added",
  USER_CREATED: "user_created",
  USER_UPDATED: "user_updated",
  USER_DELETED: "user_deleted",
  USER_ASSIGNED: "user_assigned",

  // Activity events
  CALL_LOGGED: "call_logged",
  COMMENT_ADDED: "comment_added",
  ATTACHMENT_UPLOADED: "attachment_uploaded",

  // Workflow events
  WORKFLOW_CREATED: "workflow_created",
  WORKFLOW_UPDATED: "workflow_updated",
  WORKFLOW_DELETED: "workflow_deleted",
  WORKFLOW_TRIGGERED: "workflow_triggered",

  // Sync events
  SYNC_COMPLETED: "sync_completed",
  SYNC_FAILED: "sync_failed",
  OFFLINE_QUEUED: "offline_queued",

  // Tenant events
  TENANT_CREATED: "tenant_created",
  TENANT_UPDATED: "tenant_updated",
  TENANT_DELETED: "tenant_deleted",

  // Generic
  MESSAGE: "message",
  ALERT: "alert",
};

export const notifyTenant = (tenantId, options) => {
  try {
    const { type, title, message, metadata } = options;

    if (!tenantId || !type || !title || !message) {
      console.error("notifyTenant: Missing required parameters", {
        tenantId,
        type,
        title,
        message,
      });
      return false;
    }

    broadcastToTenant(tenantId, {
      type,
      title,
      message,
      metadata: metadata || {},
    });

    return true;
  } catch (error) {
    console.error("notifyTenant: Error sending notification", error);
    return false;
  }
};

export const notifyUser = (userId, options) => {
  try {
    const { type, title, message, metadata } = options;

    if (!userId || !type || !title || !message) {
      console.error("notifyUser: Missing required parameters", {
        userId,
        type,
        title,
        message,
      });
      return false;
    }

    notifyUserSocket(userId, {
      type,
      title,
      message,
      metadata: metadata || {},
    });

    return true;
  } catch (error) {
    console.error("notifyUser: Error sending notification", error);
    return false;
  }
};

export const notifyLeadEvent = (
  tenantId,
  eventType,
  leadData,
  additionalMessage = "",
) => {
  const messages = {
    [notificationTypes.LEAD_CREATED]: `New lead created: ${leadData.firstName}`,
    [notificationTypes.LEAD_UPDATED]: `Lead updated: ${leadData.firstName}`,
    [notificationTypes.LEAD_DELETED]: `Lead deleted: ${leadData.firstName}`,
    [notificationTypes.LEAD_CONVERTED]: `Lead converted to customer: ${leadData.firstName}`,
    [notificationTypes.LEAD_ASSIGNED]: `Lead assigned: ${leadData.firstName}`,
  };

  const title = eventType.replace(/_/g, " ").toUpperCase();
  const message = messages[eventType] || additionalMessage || eventType;

  notifyTenant(tenantId, {
    type: eventType,
    title,
    message,
    metadata: {
      entityId: leadData._id,
      entityType: "lead",
      leadName: leadData.firstName,
    },
  });
};

export const notifyDealEvent = (
  tenantId,
  eventType,
  dealData,
  additionalMessage = "",
) => {
  const messages = {
    [notificationTypes.DEAL_CREATED]: `New deal created: ${dealData.name}`,
    [notificationTypes.DEAL_UPDATED]: `Deal updated: ${dealData.name}`,
    [notificationTypes.DEAL_DELETED]: `Deal deleted: ${dealData.name}`,
    [notificationTypes.DEAL_WON]: `Deal won: ${dealData.name}`,
    [notificationTypes.DEAL_LOST]: `Deal lost: ${dealData.name}`,
    [notificationTypes.DEAL_ASSIGNED]: `Deal assigned: ${dealData.name}`,
  };

  const title = eventType.replace(/_/g, " ").toUpperCase();
  const message = messages[eventType] || additionalMessage || eventType;

  notifyTenant(tenantId, {
    type: eventType,
    title,
    message,
    metadata: {
      entityId: dealData._id,
      entityType: "deal",
      name: dealData.name,
      value: dealData.value,
    },
  });
};

export const notifyUserEvent = (
  tenantId,
  eventType,
  userData,
  additionalMessage = "",
) => {
  const messages = {
    [notificationTypes.USER_CREATED]: `New user created: ${userData.firstName}`,
    [notificationTypes.USER_UPDATED]: `User updated: ${userData.firstName}`,
    [notificationTypes.USER_DELETED]: `User deleted: ${userData.firstName}`,
    [notificationTypes.USER_ASSIGNED]: `User assigned: ${userData.firstName}`,
  };

  const title = eventType.replace(/_/g, " ").toUpperCase();
  const message = messages[eventType] || additionalMessage || eventType;

  notifyTenant(tenantId, {
    type: eventType,
    title,
    message,
    metadata: {
      entityId: userData._id,
      entityType: "user",
      userName: userData.firstName,
      email: userData.email,
    },
  });
};

export const notifyActivityEvent = (
  tenantId,
  eventType,
  activityData,
  additionalMessage = "",
) => {
  const messages = {
    [notificationTypes.CALL_LOGGED]: `Call logged on ${activityData.entityType}`,
    [notificationTypes.COMMENT_ADDED]: `New comment added`,
    [notificationTypes.ATTACHMENT_UPLOADED]: `File uploaded: ${activityData.fileName}`,
  };

  const title = eventType.replace(/_/g, " ").toUpperCase();
  const message = messages[eventType] || additionalMessage || eventType;

  notifyTenant(tenantId, {
    type: eventType,
    title,
    message,
    metadata: {
      entityId: activityData.entityId,
      entityType: activityData.entityType,
      relatedEntity: activityData.entityType,
    },
  });
};

export default {
  notificationTypes,
  notifyTenant,
  notifyUser,
  notifyLeadEvent,
  notifyDealEvent,
  notifyUserEvent,
  notifyActivityEvent,
};
