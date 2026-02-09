export const leadsStructure = {
  name: "Leads",
  keyPath: "lead_id",
  default_obj: {
    lead_id: 1,
    lead_first_name: "lead1",
    lead_last_name: "lead1",
    lead_email: "lead1@gmail.com",
    lead_mobile_number: "1234567890",
    organization_id: null,
    organization_name: "",
    lead_source: "API",
    lead_score: 0,
    lead_status: "New",
    user_id: "1",
    tenant_id: null,
    created_on: new Date(),
    modified_on: new Date(),
  },
  indexes: [
    {
      name: "lead_email",
      keyPath: "lead_email",
      options: { unique: false },
    },
    {
      name: "lead_status",
      keyPath: "lead_status",
      options: { unique: false },
    },
    {
      name: "organization_id",
      keyPath: "organization_id",
      options: { unique: false },
    },
    {
      name: "user_id",
      keyPath: "user_id",
      options: {
        unique: false,
      },
    },
    {
      name: "tenant_id",
      keyPath: "tenant_id",
      options: {
        unique: false,
      },
    },
  ],
};
