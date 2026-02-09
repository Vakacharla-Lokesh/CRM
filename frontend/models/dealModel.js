export const dealsStructure = {
  name: "Deals",
  keyPath: "deal_id",
  default_obj: {
    deal_id: 1,
    deal_name: "Sample Deal",
    deal_value: 50000,
    lead_id: null,
    organization_id: null,
    deal_status: "Prospecting",
    tenant_id: "tenant_123",
    user_id: "user_123",
    created_on: new Date(),
    modified_on: new Date(),
  },
  indexes: [
    {
      name: "tenant_id",
      keyPath: "tenant_id",
      options: { unique: false },
    },
    {
      name: "user_id",
      keyPath: "user_id",
      options: { unique: false },
    },
    {
      name: "deal_status",
      keyPath: "deal_status",
      options: { unique: false },
    },
  ],
};
