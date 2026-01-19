export const leadsStructure = {
  name: "Leads",
  keyPath: "lead_id",
  default_obj: {
    lead_id: 1,
    lead_name: "lead1",
    lead_email: "lead1@gmail.com",
    organization_id: "ORG1",
    lead_source: "API",
    lead_score: 100,
    comment_ids: [],
    created_on: new Date(),
    modified_on: new Date(),
    call_ids: [],
  },
};
