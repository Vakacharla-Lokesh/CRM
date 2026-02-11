export const leadsStructure = {
  name: "Leads",
  keyPath: "_id",
  default_obj: {
    _id: 1,
    leadFirstName: "lead1",
    leadLastName: "lead1",
    leadEmail: "lead1@gmail.com",
    leadMobileNumber: "1234567890",
    organizationId: null,
    organizationName: "",
    leadSource: "API",
    leadScore: 0,
    leadStatus: "New",
    userId: "1",
    tenantId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  indexes: [
    {
      name: "leadEmail",
      keyPath: "leadEmail",
      options: { unique: false },
    },
    {
      name: "leadStatus",
      keyPath: "leadStatus",
      options: { unique: false },
    },
    {
      name: "organizationId",
      keyPath: "organizationId",
      options: { unique: false },
    },
    {
      name: "userId",
      keyPath: "userId",
      options: {
        unique: false,
      },
    },
    {
      name: "tenantId",
      keyPath: "tenantId",
      options: {
        unique: false,
      },
    },
  ],
};
