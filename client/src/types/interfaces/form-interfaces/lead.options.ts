export const LEAD_SOURCES = [
  { value: "API", color: "bg-blue-500" },
  { value: "Outsource", color: "bg-purple-500" },
  { value: "Phone", color: "bg-green-500" },
  { value: "Website", color: "bg-indigo-500" },
  { value: "Facebook Ads", color: "bg-blue-700" },
  { value: "Google Ads", color: "bg-red-500" },
  { value: "Instagram", color: "bg-pink-500" },
  { value: "LinkedIn", color: "bg-blue-800" },
  { value: "Email Marketing", color: "bg-yellow-500" },
  { value: "Referral", color: "bg-teal-500" },
  { value: "Cold Call", color: "bg-orange-500" },
  { value: "WhatsApp", color: "bg-green-700" },
  { value: "Other", color: "bg-gray-500" },
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number]["value"];

export const LEAD_STATUSES = [
  { value: "New", color: "bg-green-500" },
  { value: "Follow-Up", color: "bg-yellow-500" },
  { value: "Converted", color: "bg-blue-500" },
  { value: "Dead", color: "bg-red-500" },
] as const;

export type LeadStatus = string;
