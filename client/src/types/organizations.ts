/**
 * Organization Model Types
 */

export interface Organization {
  _id: string;
  organizationName: string;
  organizationWebsite?: string;
  organizationSize: OrganizationSize;
  organizationIndustry: string;
  tenantId: string;
  userId: string; // Owner
  pointsOfContact?: PointOfContact[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationDTO {
  organizationName: string;
  organizationWebsite?: string;
  organizationSize: OrganizationSize;
  organizationIndustry: string;
}

export interface UpdateOrganizationDTO {
  organizationName?: string;
  organizationWebsite?: string;
  organizationSize?: OrganizationSize;
  organizationIndustry?: string;
  pointsOfContact?: PointOfContact[];
}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
}

export type OrganizationSize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1000+";

export interface PointOfContact {
  _id?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  contactRole?: string;
  isPrimary: boolean;
}

export function isOrganization(obj: any): obj is Organization {
  return (
    obj &&
    typeof obj._id === "string" &&
    typeof obj.organizationName === "string" &&
    typeof obj.organizationIndustry === "string"
  );
}
