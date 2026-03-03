export type DealStatus =
  | "Prospecting"
  | "Qualification"
  | "Negotiation"
  | "Ready to close"
  | "Won"
  | "Lost";

export const statuses: DealStatus[] = [
  "Prospecting",
  "Qualification",
  "Negotiation",
  "Ready to close",
  "Won",
  "Lost",
];

export interface Deal {
  _id: string;
  dealId?: string;
  leadId: string;
  organizationId: string;
  tenantId: string;
  userId: string;
  name: string;
  value: number;
  status: DealStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDealDTO {
  leadId: string;
  organizationId: string;
  name: string;
  value?: number;
  status?: DealStatus;
}

export type UpdateDealDTO = Partial<
  Pick<Deal, "name" | "value" | "status">
>;

export interface DealListResponse {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
}

export function isDeal(obj: unknown): obj is Deal {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Deal)._id === "string" &&
    typeof (obj as Deal).name === "string" &&
    typeof (obj as Deal).value === "number"
  );
}

export function getDealStatusColor(status: DealStatus): string {
  const colors: Record<DealStatus, string> = {
    Prospecting: "bg-blue-100 text-blue-800",
    Qualification: "bg-cyan-100 text-cyan-800",
    Negotiation: "bg-orange-100 text-orange-800",
    "Ready to close": "bg-purple-100 text-purple-800",
    Won: "bg-green-100 text-green-800",
    Lost: "bg-red-100 text-red-800",
  };
  return colors[status];
}

export interface DealWithMetadata extends Deal {
  statusColor: string;
}

export function enrichDeal(deal: Deal): DealWithMetadata {
  return {
    ...deal,
    statusColor: getDealStatusColor(deal.status),
  };
}
