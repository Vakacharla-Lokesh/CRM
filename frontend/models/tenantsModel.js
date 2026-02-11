export const tenantsStructure = {
  name: "Tenants",
  keyPath: "_id",
  default_obj: {
    _id: 1,
    tenantName: "Default Tenant",
    email: "tenant@example.com",
    mobile: "9000000000",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  indexes: [
    {
      name: "tenantId",
      keyPath: "_id",
      options: { unique: true },
    },
  ],
};
