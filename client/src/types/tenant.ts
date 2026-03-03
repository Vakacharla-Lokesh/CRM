export interface Tenant {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  name: string;
  email: string;
  mobile: string;
}

export interface UpdateTenantDto {
  name?: string;
  email?: string;
  mobile?: string;
}
