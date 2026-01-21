export const dealsStructure = {
  name: "Deals",
  keyPath: "deal_id",
  default_obj: {
    deal_id: Date.now(),
    deal_name: "Sample Deal",
    deal_value: 50000,
    lead_id: 1,
    lead_first_name: "",
    lead_last_name: "",
    organization_id: 1,
    organization_name: "",
    deal_status: "Prospecting",
    created_on: new Date(),
    modified_on: new Date(),
  },
};
