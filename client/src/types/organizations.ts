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
  name: string;
  size?: number;
  website: string;
  industry: OrganizationIndustry;
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationDTO {
  tenantId: string;
  name: string;
  website: string;
  size?: number;
  industry: OrganizationIndustry;
  city?: string;
  country?: string;
}

export interface UpdateOrganizationDTO {
  name?: string;
  website?: string;
  size?: number;
  industry?: OrganizationIndustry;
  city?: string;
  country?: string;
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
    typeof (obj as Organization).name === "string" &&
    typeof (obj as Organization).industry === "string"
  );
}
