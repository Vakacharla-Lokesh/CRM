export const organizationsStructure = {
  name: "Organizations",
  keyPath: "organization_id",
  default_obj: {
    organization_id: 1,
    organization_name: "ORG1",
    organization_website_name: "www.google.com/",
    organization_size: "50",
    organization_industry: "Software",
    contact_name: "",
    contact_number: "",
    tenant_id: "tenant_123",
    user_id: "user_123",
    created_on: new Date(),
    modified_on: new Date(),
  },
  indexes: [
    {
      name: "organization_id",
      keyPath: "organization_id",
      options: { unique: true },
    },
    {
      name: "organization_name",
      keyPath: "organization_name",
      options: { unique: false },
    },
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
  ],
};
