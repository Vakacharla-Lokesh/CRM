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
  ],
};
