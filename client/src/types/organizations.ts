/**
 * Organization Model Types
 */

export interface Organization {
  _id: string;
  organizationName: string;
  organizationWebsite?: string;
  organizationSize: number; // Server stores as number (1-10000000)
  organizationIndustry: string;
  tenantId: string;
  userId: string; // Owner
  pointsOfContact?: PointOfContact[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationDTO {
  tenantId: string;
  organizationName: string;
  organizationWebsite?: string;
  organizationSize: number; // Server expects number (1-10000000)
  organizationIndustry: string;
}

export interface UpdateOrganizationDTO {
  organizationName?: string;
  organizationWebsite?: string;
  organizationSize?: number; // Server expects number (1-10000000)
  organizationIndustry?: string;
  pointsOfContact?: PointOfContact[];
}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
}

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