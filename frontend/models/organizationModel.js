export const organizationsStructure = {
  name: "Organizations",
  keyPath: "_id",
  default_obj: {
    _id: 1,
    organizationName: "ORG1",
    organizationWebsite: "www.google.com/",
    organizationSize: "50",
    organizationIndustry: "Software",
    contactName: "",
    contactNumber: "",
    tenantId: "tenant_123",
    userId: "user_123",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  indexes: [
    {
      name: "organizationId",
      keyPath: "_id",
      options: { unique: true },
    },
    {
      name: "organizationName",
      keyPath: "organizationName",
      options: { unique: false },
    },
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
  ],
};
