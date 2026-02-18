/**
 * Lead Model Types
 * These types must match the backend MongoDB schema and API responses
 */

export interface Lead {
  _id: string;
  leadFirstName: string;
  leadLastName: string;
  leadEmail: string;
  leadPhone?: string;
  leadSource: string;
  leadStatus: LeadStatus;
  leadScore: number;
  leadInterests: string[];
  leadCompany?: string;
  leadPosition?: string;
  organizationId: string;
  tenantId: string;
  userId: string; // Assigned user
  lastActivity?: Date;
  nextFollowUp?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadDTO {
  leadFirstName: string;
  leadLastName: string;
  leadEmail: string;
  leadPhone?: string;
  leadSource: string;
  leadStatus?: LeadStatus;
  leadScore?: number;
  leadInterests?: string[];
  leadCompany?: string;
  leadPosition?: string;
  organizationId: string;
  notes?: string;
}

export interface UpdateLeadDTO {
  leadFirstName?: string;
  leadLastName?: string;
  leadEmail?: string;
  leadPhone?: string;
  leadSource?: string;
  leadStatus?: LeadStatus;
  leadScore?: number;
  leadInterests?: string[];
  leadCompany?: string;
  leadPosition?: string;
  userId?: string;
  notes?: string;
  nextFollowUp?: Date;
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

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "negotiation"
  | "won"
  | "lost"
  | "unsubscribed";

export interface LeadFilter {
  status?: LeadStatus[];
  source?: string[];
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
  const daysSinceActivity = lead.lastActivity
    ? Math.floor(
        (Date.now() - new Date(lead.lastActivity).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

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
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    qualified: "bg-purple-100 text-purple-800",
    negotiation: "bg-orange-100 text-orange-800",
    won: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800",
    unsubscribed: "bg-gray-100 text-gray-800",
  };
  return colors[status];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}
