export const dealsStructure = {
  name: "Deals",
  keyPath: "_id",
  default_obj: {
    _id: 1,
    dealName: "Sample Deal",
    dealValue: 50000,
    leadId: null,
    organizationId: null,
    dealStatus: "Prospecting",
    tenantId: "tenant_123",
    userId: "user_123",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  indexes: [
    {
      name: "tenantId",
      keyPath: "tenantId",
      options: { unique: false },
    },
    {
      name: "userId",
      keyPath: "userId",
      options: { unique: false },
    },
    {
      name: "dealStatus",
      keyPath: "dealStatus",
      options: { unique: false },
    },
  ],
};
