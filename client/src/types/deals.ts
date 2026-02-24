export type DealStatus =
  | "Prospecting"
  | "Qualification"
  | "Negotiation"
  | "Ready to close"
  | "Won"
  | "Lost";

export const dealStatuses: DealStatus[] = [
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
  dealName: string;
  dealValue: number;
  dealStatus: DealStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDealDTO {
  leadId: string;
  organizationId: string;
  dealName: string;
  dealValue?: number;
  dealStatus?: DealStatus;
}

export type UpdateDealDTO = Partial<
  Pick<Deal, "dealName" | "dealValue" | "dealStatus">
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
    typeof (obj as Deal).dealName === "string" &&
    typeof (obj as Deal).dealValue === "number"
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
    statusColor: getDealStatusColor(deal.dealStatus),
  };
}
