// ─── Lead ────────────────────────────────────────────────────────────────────
// Mirrors server/models/leadModel.js exactly.

/** Matches the backend enum exactly */
export type LeadStatus = "New" | "Converted" | "Dead" | "Follow-Up";

/** Matches the backend enum exactly */
export type LeadSource = "API" | "Outsource";

export interface Lead {
  _id: string;
  /** Alias of _id (set by Mongoose alias) */
  leadId?: string;
  organizationId?: string;
  userId: string;
  tenantId: string;
  leadFirstName: string;
  leadLastName?: string | null;
  leadEmail: string;
  leadSource: LeadSource;
  /** 0 – 100 */
  leadScore: number;
  leadStatus: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadDTO {
  organizationId?: string;
  leadFirstName: string;
  leadLastName?: string;
  leadEmail: string;
  leadSource?: LeadSource;
  leadScore?: number;
  leadStatus: LeadStatus;
  tenantId: string;
}

export interface UpdateLeadDTO {
  organizationId?: string;
  leadFirstName?: string;
  leadLastName?: string;
  leadEmail?: string;
  leadSource?: LeadSource;
  leadScore?: number;
  leadStatus?: LeadStatus;
  userId?: string;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isLead(obj: unknown): obj is Lead {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Lead)._id === "string" &&
    typeof (obj as Lead).leadEmail === "string" &&
    typeof (obj as Lead).leadStatus === "string"
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
    fullName: `${lead.leadFirstName} ${lead.leadLastName ?? ""}`.trim(),
    statusColor: getLeadStatusColor(lead.leadStatus),
    scoreColor: getLeadScoreColor(lead.leadScore),
  };
}
