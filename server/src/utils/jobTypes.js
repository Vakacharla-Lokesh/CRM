export const JOB_TYPES = {
  WORKFLOW_EXECUTION: "workflow_execution",
  EXPORT_DATA: "export_data",
  LEAD_REMINDER: "lead_reminder",
  SCHEDULED_SYNC: "scheduled_sync",
  ANALYTICS_SNAPSHOT: "analytics_snapshot",
  CAMPAIGN_EMAIL_SEND: "campaign_email_send",
};

export const JOB_TYPE_QUEUE_MAP = {
  [JOB_TYPES.WORKFLOW_EXECUTION]: "offlineWrites",
  [JOB_TYPES.EXPORT_DATA]: "exportData",
  [JOB_TYPES.LEAD_REMINDER]: "offlineWrites",
  [JOB_TYPES.SCHEDULED_SYNC]: "offlineWrites",
  [JOB_TYPES.ANALYTICS_SNAPSHOT]: "offlineWrites",
  [JOB_TYPES.CAMPAIGN_EMAIL_SEND]: "campaignEmails",
};

const VALID_JOB_TYPES = new Set(Object.values(JOB_TYPES));

export function isValidJobType(jobType) {
  return VALID_JOB_TYPES.has(jobType);
}
