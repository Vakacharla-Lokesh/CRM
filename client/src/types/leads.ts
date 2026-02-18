/**
 * Lead Model Types
 * These types must match the backend MongoDB schema and API responses
 */

export interface Lead {
  _id: string;
  leadId?: string; // Alias for _id
  leadFirstName: string;
  leadLastName?: string;
  leadEmail: string;
  leadSource: LeadSource;
  leadStatus: LeadStatus;
  leadScore: number;
  organizationId?: string;
  tenantId: string;
  userId: string; // Assigned user
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadDTO {
  leadFirstName: string;
  leadLastName?: string;
  leadEmail: string;
  leadSource?: LeadSource;
  leadStatus?: LeadStatus;
  leadScore?: number;
  organizationId?: string;
  tenantId: string;
}

export interface UpdateLeadDTO {
  leadFirstName?: string;
  leadLastName?: string;
  leadEmail?: string;
  leadSource?: LeadSource;
  leadStatus?: LeadStatus;
  leadScore?: number;
  userId?: string;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface LeadSegment {
  segmentId: string;
  count: number;
  avgScore: number;
  leads: Lead[];
}

export type LeadStatus = "New" | "Converted" | "Dead" | "Follow-Up";

export type LeadSource = "API" | "Outsource";

export interface LeadFilter {
  status?: LeadStatus[];
  source?: LeadSource[];
  minScore?: number;
  maxScore?: number;
  userId?: string;
  organizationId?: string;
  search?: string; // For email/name search
}

export interface LeadActivityLog {
  _id: string;
  leadId: string;
  userId: string;
  action: "created" | "updated" | "called" | "emailed" | "assigned";
  details: Record<string, any>;
  timestamp: Date;
}

/**
 * Type guards
 */
export function isLead(obj: any): obj is Lead {
  return (
    obj &&
    typeof obj._id === "string" &&
    typeof obj.leadEmail === "string" &&
    typeof obj.leadStatus === "string"
  );
}

export function isLeadArray(obj: any): obj is Lead[] {
  return Array.isArray(obj) && obj.every(isLead);
}

/**
 * Computed Lead properties
 */
export interface LeadWithComputed extends Lead {
  fullName: string;
  statusColor: string;
  scoreColor: string;
  daysSinceActivity: number;
}

export function enrichLead(lead: Lead): LeadWithComputed {
  const fullName = `${lead.leadFirstName} ${lead.leadLastName}`.trim();
  const statusColor = getStatusColor(lead.leadStatus);
  const scoreColor = getScoreColor(lead.leadScore);
  // lastActivity property doesn't exist in current Lead schema
  const daysSinceActivity = 0;

  return {
    ...lead,
    fullName,
    statusColor,
    scoreColor,
    daysSinceActivity,
  };
}

function getStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    New: "bg-blue-100 text-blue-800",
    Converted: "bg-green-100 text-green-800",
    Dead: "bg-red-100 text-red-800",
    "Follow-Up": "bg-yellow-100 text-yellow-800",
  };
  return colors[status];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}
