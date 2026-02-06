export const leadsStructure = {
  name: "Leads",
  keyPath: "lead_id",
  default_obj: {
    lead_id: 1,
    lead_first_name: "lead1",
    lead_last_name: "lead1",
    lead_email: "lead1@gmail.com",
    lead_mobile_number: "99000000000",
    organization_id: null,
    organization_name: "",
    lead_source: "API",
    lead_score: 0,
    lead_status: "New",
    comment_ids: [],
    call_ids: [],
    user_id: "1",
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
  ],
};
