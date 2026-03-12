export type LeadStatus = string;

export type LeadSource =
  | "API"
  | "Outsource"
  | "Phone"
  | "Website"
  | "Facebook Ads"
  | "Google Ads"
  | "Instagram"
  | "LinkedIn"
  | "Email Marketing"
  | "Referral"
  | "Cold Call"
  | "WhatsApp"
  | "Other";

export interface Lead {
  _id: string;
  leadId?: string;
  organizationId?: string;
  createdBy: string;
  assignedTo?: string | null;
  tenantId: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  source: LeadSource;
  score: number;
  status: LeadStatus;
  pipelineId?: string | null;
  rfm?: LeadRFM;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadDTO {
  organizationId?: string;
  firstName: string;
  lastName?: string;
  email: string;
  source?: LeadSource;
  score?: number;
  status: LeadStatus;
  pipelineId?: string | null;
  rfm?: LeadRFM;
  tenantId: string;
  assignedTo?: string;
}

export interface UpdateLeadDTO {
  organizationId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  source?: LeadSource;
  score?: number;
  status?: LeadStatus;
  assignedTo?: string;
  rfm?: LeadRFM;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface LeadFilter {
  status?: LeadStatus[];
  source?: LeadSource[];
  minScore?: number;
  maxScore?: number;
  userId?: string;
  organizationId?: string;
  search?: string;
}

export function isLead(obj: unknown): obj is Lead {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Lead)._id === "string" &&
    typeof (obj as Lead).email === "string" &&
    typeof (obj as Lead).status === "string"
  );
}

export function isLeadArray(obj: unknown): obj is Lead[] {
  return Array.isArray(obj) && obj.every(isLead);
}

export function getLeadStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    New: "bg-blue-100 text-blue-800",
    Converted: "bg-green-100 text-green-800",
    Dead: "bg-red-100 text-red-800",
    "Follow-Up": "bg-yellow-100 text-yellow-800",
  };
  return colors[status];
}

export function getLeadScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

export interface LeadWithComputed extends Lead {
  fullName: string;
  statusColor: string;
  scoreColor: string;
}

export function enrichLead(lead: Lead): LeadWithComputed {
  return {
    ...lead,
    fullName: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
    statusColor: getLeadStatusColor(lead.status),
    scoreColor: getLeadScoreColor(lead.score),
  };
}

export type PipelineSegment =
  | "Hot Deals"
  | "Sleeping Giants"
  | "Time Wasters"
  | "Dead Wood"
  | "Active Prospect"
  | "Unsegmented";

export interface LeadRFM {
  rScore: number;
  fScore: number;
  mScore: number;
  segment: PipelineSegment;
  lastTouchpoint?: Date | null;
  engagementCount: number;
  dealValue: number;
}

export const segmentStyles: Record<string, { badge: string; dot: string }> = {
  "Hot Deals": {
    badge:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  "Sleeping Giants": {
    badge:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  "Time Wasters": {
    badge:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  "Dead Wood": {
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
  "Active Prospect": {
    badge:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dot: "bg-green-500",
  },
  Unsegmented: {
    badge: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    dot: "bg-gray-400",
  },
};
