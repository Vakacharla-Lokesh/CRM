export const tenantsStructure = {
  name: "Tenants",
  keyPath: "tenant_id",
  default_obj: {
    tenant_id: 1,
    tenant_name: "Default Tenant",
    email: "tenant@example.com",
    mobile: "9000000000",
    created_at: new Date(),
    updated_at: new Date(),
  },
  indexes: [
    {
      name: "tenant_id",
      keyPath: "tenant_id",
      options: { unique: true },
    },
  ],
};
