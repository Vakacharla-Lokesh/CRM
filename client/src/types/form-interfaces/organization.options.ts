export const ORGANIZATION_INDUSTRIES = [
  { value: "Software", color: "bg-blue-500" },
  { value: "Textile", color: "bg-purple-500" },
  { value: "Foods", color: "bg-green-500" },
  { value: "Others", color: "bg-gray-500" },
] as const;

export type OrganizationIndustry =
  (typeof ORGANIZATION_INDUSTRIES)[number]["value"];
