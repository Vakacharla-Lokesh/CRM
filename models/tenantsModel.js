export const tenantsStructure = {
  name: "Tenants",
  keyPath: "tenant_id",
  default_obj: {
    tenant_id: 1,
    tenant_name: "Default Tenant",
    created_at: new Date(),
  },
  indexes: [
    {
      name: "tenant_id",
      keyPath: "tenant_id",
      options: { unique: true },
    },
  ],
};
