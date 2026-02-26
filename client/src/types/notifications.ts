export type NotificationEventType =
  // Lead events
  | "lead_created"
  | "lead_updated"
  | "lead_deleted"
  | "lead_converted"
  // Deal events
  | "deal_created"
  | "deal_updated"
  | "deal_deleted"
  | "deal_won"
  | "deal_lost"
  // Organization events
  | "organization_created"
  | "organization_updated"
  | "organization_deleted"
  // User & team events
  | "user_added"
  | "user_created"
  | "user_updated"
  | "user_deleted"
  // Activity events
  | "call_logged"
  | "comment_added"
  | "attachment_uploaded"
  // Sync / offline events
  | "sync_completed"
  | "sync_failed"
  | "offline_queued"
  // tenant events
  | "tenant_created"
  | "tenant_updated"
  | "tenant_deleted"
  // Workflow events
  | "workflow_created"
  | "workflow_updated"
  | "workflow_deleted";

export interface AppNotification {
  id: string;
  type: NotificationEventType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}

export interface NotifyEventPayload {
  type: NotificationEventType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  notifyEvent: (payload: NotifyEventPayload) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
