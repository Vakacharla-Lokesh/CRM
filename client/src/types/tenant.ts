export interface Tenant {
  _id: string;
  tenantId: string;
  tenantName: string;
  email: string;
  mobile: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  tenantName: string;
  email: string;
  mobile: string;
}

export interface UpdateTenantDto {
  tenantName?: string;
  email?: string;
  mobile?: string;
}
