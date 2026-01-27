export const dealsStructure = {
  name: "Deals",
  keyPath: "deal_id",
  default_obj: {
    deal_id: 1,
    deal_name: "Sample Deal",
    deal_value: 50000,
    lead_id: null,
    lead_first_name: "",
    lead_last_name: "",
    organization_id: null,
    organization_name: "",
    deal_status: "Prospecting",
    created_on: new Date(),
    modified_on: new Date(),
    tenant_id: "tenant_123",
  },
  indexes: [
    {
      name: "tenant_id",
      keyPath: "tenant_id",
      options: { unique: true },
    },
  ],
};
