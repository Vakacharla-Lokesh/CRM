export type WorkflowTriggerEntity =
  | "lead"
  | "deal"
  | "organization"
  | "call"
  | "comment";

export type WorkflowTriggerAction = "create" | "update" | "delete";

export type WorkflowConditionOperator =
  | "equals"
  | "gte"
  | "lte"
  | "contains"
  | "startsWith"
  | "isEmpty"
  | "isNotEmpty";

export type WorkflowActionType =
  | "send_email"
  | "update_field"
  | "create_task"
  | "webhook"
  | "export_s3";

export type WorkflowStatus = "success" | "failed" | "pending";

export interface WorkflowCondition {
  field: string;
  operator: WorkflowConditionOperator;
  value?: unknown;
}

export interface WorkflowTrigger {
  entity: WorkflowTriggerEntity;
  action: WorkflowTriggerAction;
  conditions?: WorkflowCondition[];
}

export interface WorkflowAction {
  type: WorkflowActionType;
  // send_email
  emailTemplate?: string;
  recipient?: string;
  subject?: string;
  body?: string;
  // update_field
  targetField?: string;
  value?: unknown;
  // webhook / slack
  webhookUrl?: string;
  method?: "POST" | "PUT";
  payload?: unknown;
  messageTemplate?: string;
  // export_s3
  format?: "csv" | "json";
  bucket?: string;
  prefix?: string;
  // create_task
  taskTitle?: string;
  taskDescription?: string;
  taskPriority?: "low" | "medium" | "high" | "urgent";
  taskAssignedTo?: string;
  taskDueDate?: string;
  taskRelationType?: "lead" | "deal" | "organization";
  taskRelationFromTrigger?: boolean;
}

export interface WorkflowSchedule {
  enabled: boolean;
  cronExpression?: string;
}

export interface Workflow {
  _id: string;
  tenantId: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  name: string;
  description?: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  totalExecutions: number;
  lastExecuted?: string;
  lastStatus: WorkflowStatus;
  schedule?: WorkflowSchedule;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecutionResult {
  actionIndex: number;
  actionType: WorkflowActionType;
  status: string;
  message?: string;
  error?: string;
  executedAt: string;
}

export interface WorkflowExecutionLog {
  _id: string;
  tenantId: string;
  workflowId: string;
  entityType: WorkflowTriggerEntity;
  entityId: string;
  triggeredAt: string;
  status: "queued" | "processing" | "success" | "failed" | "retry";
  results: WorkflowExecutionResult[];
  retryCount: number;
  maxRetries: number;
  createdAt: string;
}

export interface CreateWorkflowDTO {
  name: string;
  description?: string;
  isActive?: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  schedule?: WorkflowSchedule;
}

export type UpdateWorkflowDTO = Partial<CreateWorkflowDTO>;

export interface WorkflowListResponse {
  count: number;
  workflows: Workflow[];
  nextCursor: string | null;
  hasNextPage: boolean;
}
