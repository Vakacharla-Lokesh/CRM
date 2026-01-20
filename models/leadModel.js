export const leadsStructure = {
  name: "Leads",
  keyPath: "lead_id",
  default_obj: {
    lead_id: 1,
    lead_first_name: "lead1",
    lead_last_name: "lead1",
    lead_email: "lead1@gmail.com",
    lead_mobile_number: "99000000000",
    organization_id: 1,
    lead_source: "API",
    lead_score: 100,
    comment_ids: [],
    call_ids: [],
    created_on: new Date(),
    modified_on: new Date(),
  },
};