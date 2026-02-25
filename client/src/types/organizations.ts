export type OrganizationIndustry = "Software" | "Textile" | "Foods" | "Others";

export const industryMap: Record<OrganizationIndustry, string> = {
  Software: "bg-blue-500",
  Textile: "bg-purple-500",
  Foods: "bg-green-500",
  Others: "bg-gray-500",
};

export interface PointOfContact {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  isPrimary?: boolean;
}

export interface Organization {
  _id: string;
  organizationId?: string;
  tenantId: string;
  userId: string;
  organizationName: string;
  organizationSize?: number;
  organizationWebsite: string;
  organizationIndustry: OrganizationIndustry;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationDTO {
  tenantId: string;
  organizationName: string;
  organizationWebsite: string;
  organizationSize?: number;
  organizationIndustry: OrganizationIndustry;
}

export interface UpdateOrganizationDTO {
  organizationName?: string;
  organizationWebsite?: string;
  organizationSize?: number;
  organizationIndustry?: OrganizationIndustry;
}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
}

export function isOrganization(obj: unknown): obj is Organization {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Organization)._id === "string" &&
    typeof (obj as Organization).organizationName === "string" &&
    typeof (obj as Organization).organizationIndustry === "string"
  );
}
