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

export const callsStructure = {
  name: "Calls",
  keyPath: "call_id",
  default_obj: {
    call_id: 1,
    duration: 100,
    created_on: new Date(),
  },
};

export const commentsStructure = {
  name: "Comments",
  keyPath: "comment_id",
  default_obj: {
    comment_id: 1,
    comment_title: "Title",
    comment_desc: "Testing comments",
    lead_id: 1,
    created_on: new Date(),
  },
};

export const dealsStructure = {
  name: "Deals",
  keyPath: "deal_id",
  default_obj: {
    deal_id: 1,
    deal_value: 100,
    lead_id: 1,
    organization_id: 1,
    status: "Active",
  },
};

export const organizationsStructure = {
  name: "Organizations",
  keyPath: "organization_id",
  default_obj: {
    organization_id: 1,
    organization_name: "ORG1",
    organization_website_name: "www.google.com/",
    organization_size: 50,
    organization_industry: "Software",
  },
};
