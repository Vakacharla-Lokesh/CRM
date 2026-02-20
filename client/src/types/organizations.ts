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

/**
 * Convert numeric organization size to display category
 */
export function getOrganizationSizeCategory(size: number): OrganizationSize {
  if (size <= 10) return "1-10";
  if (size <= 50) return "11-50";
  if (size <= 200) return "51-200";
  if (size <= 500) return "201-500";
  if (size <= 1000) return "501-1000";
  return "1000+";
}
