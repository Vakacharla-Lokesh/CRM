export type LeadActivityType =
  | "CREATED"
  | "UPDATED"
  | "STATUS_CHANGED"
  | "SCORE_UPDATED"
  | "COMMENT_ADDED"
  | "COMMENT_DELETED"
  | "CALL_ADDED"
  | "CALL_DELETED"
  | "ATTACHMENT_ADDED"
  | "ATTACHMENT_REMOVED"
  | "CONVERTED_TO_DEAL";

export interface LeadActivityUser {
  _id: string;
  firstName: string;
  lastName?: string;
}

export interface LeadActivity {
  _id: string;
  leadId: string;
  tenantId?: string;
  type: LeadActivityType;
  description?: string;
  metadata?: Record<string, unknown>;
  createdBy?: LeadActivityUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivityListResponse {
  count: number;
  activities: LeadActivity[];
}
