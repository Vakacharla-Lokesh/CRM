import type {
  WorkflowTriggerEntity,
  WorkflowTriggerAction,
  WorkflowActionType,
} from "@/types/workflows";

export const TRIGGER_ENTITIES: WorkflowTriggerEntity[] = [
  "lead",
  "deal",
  "organization",
  "call",
  "comment",
];

export const TRIGGER_ACTIONS: WorkflowTriggerAction[] = [
  "create",
  "update",
  "delete",
];

export const ACTION_TYPES: { value: WorkflowActionType; label: string }[] = [
  { value: "send_email", label: "Send Email" },
  { value: "update_field", label: "Update Field" },
  { value: "webhook", label: "Slack Webhook" },
];

export const getAvailableVariables = (entityType: string): string[] => {
  const common = [
    "entityType",
    "entityId",
    "createdAt",
    "createdBy.firstName",
    "createdBy.lastName",
    "createdBy.email",
    "createdBy.fullName",
  ];

  const entityVars: Record<string, string[]> = {
    lead: [
      "leadName",
      "firstName",
      "lastName",
      "email",
      "phone",
      "company",
      "status",
      "source",
    ],
    deal: [
      "dealName",
      "title",
      "value",
      "stage",
      "probability",
      "expectedCloseDate",
    ],
    organization: ["orgName", "name", "industry", "website"],
    call: ["callTitle", "title", "duration", "outcome"],
    comment: ["commentTitle", "title", "description"],
  };

  return [...common, ...(entityVars[entityType] || [])];
};
