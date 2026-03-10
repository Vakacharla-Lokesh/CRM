import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";

const LEAD_COLUMN_MAP = {
  firstname: "firstName",
  first_name: "firstName",
  lastname: "lastName",
  last_name: "lastName",
  email: "email",
  source: "source",
  status: "status",
  score: "score",
  assignedto: "assignedTo",
  assigned_to: "assignedTo",
};

const VALID_SOURCES = new Set([
  "API",
  "Outsource",
  "Phone",
  "Website",
  "Facebook Ads",
  "Google Ads",
  "Instagram",
  "LinkedIn",
  "Email Marketing",
  "Referral",
  "Cold Call",
  "WhatsApp",
  "Other",
]);

export function normaliseRow(raw) {
  const row = {};
  for (const [key, value] of Object.entries(raw)) {
    const normKey =
      LEAD_COLUMN_MAP[key.trim().toLowerCase().replace(/\s+/g, "_")];
    if (normKey) row[normKey] = value === "" ? undefined : value;
  }
  return row;
}

export function validateRow(row, index) {
  if (
    !row.firstName ||
    typeof row.firstName !== "string" ||
    !row.firstName.trim()
  ) {
    return `Row ${index + 1}: 'firstName' is required`;
  }
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    return `Row ${index + 1}: '${row.email}' is not a valid email`;
  }
  if (row.source && !VALID_SOURCES.has(row.source)) {
    return `Row ${index + 1}: '${row.source}' is not a valid source`;
  }
  if (
    row.score !== undefined &&
    (isNaN(Number(row.score)) ||
      Number(row.score) < 0 ||
      Number(row.score) > 100)
  ) {
    return `Row ${index + 1}: score must be a number between 0 and 100`;
  }
  return null;
}

const ORG_COLUMN_MAP = {
  name: "name",
  website: "website",
  industry: "industry",
  size: "size",
  city: "city",
  country: "country",
};

const VALID_INDUSTRIES = new Set(["Software", "Textile", "Foods", "Others"]);

export function normaliseOrgRow(raw) {
  const row = {};
  for (const [key, value] of Object.entries(raw)) {
    const normKey =
      ORG_COLUMN_MAP[key.trim().toLowerCase().replace(/\s+/g, "_")];
    if (normKey) row[normKey] = value === "" ? undefined : value;
  }
  return row;
}

export function validateOrgRow(row, index) {
  if (!row.name || typeof row.name !== "string" || !row.name.trim()) {
    return `Row ${index + 1}: 'name' is required`;
  }
  if (!row.website || typeof row.website !== "string" || !row.website.trim()) {
    return `Row ${index + 1}: 'website' is required`;
  }
  if (!/^(ftp|http|https):\/\/.+/.test(row.website.trim())) {
    return `Row ${index + 1}: '${row.website}' is not a valid URL (must start with http/https/ftp)`;
  }
  if (!row.industry) {
    return `Row ${index + 1}: 'industry' is required`;
  }
  if (!VALID_INDUSTRIES.has(row.industry)) {
    return `Row ${index + 1}: '${row.industry}' is not a valid industry. Must be one of: ${[...VALID_INDUSTRIES].join(", ")}`;
  }
  if (
    row.size !== undefined &&
    (isNaN(Number(row.size)) ||
      Number(row.size) < 1 ||
      Number(row.size) > 10_000_000)
  ) {
    return `Row ${index + 1}: size must be a number between 1 and 10,000,000`;
  }
  return null;
}
const DEAL_COLUMN_MAP = {
  name: "name",
  leadid: "leadId",
  lead_id: "leadId",
  value: "value",
  status: "status",
  organizationid: "organizationId",
  organization_id: "organizationId",
};

const VALID_DEAL_STATUSES = new Set([
  "Prospecting",
  "Qualification",
  "Negotiation",
  "Ready to close",
  "Won",
  "Lost",
]);

export function normaliseDealRow(raw) {
  const row = {};
  for (const [key, value] of Object.entries(raw)) {
    const normKey =
      DEAL_COLUMN_MAP[key.trim().toLowerCase().replace(/\s+/g, "_")];
    if (normKey) row[normKey] = value === "" ? undefined : value;
  }
  return row;
}

export function validateDealRow(row, index) {
  if (!row.name || typeof row.name !== "string" || !row.name.trim()) {
    return `Row ${index + 1}: 'name' is required`;
  }
  if (row.name.trim().length > 100) {
    return `Row ${index + 1}: 'name' cannot exceed 100 characters`;
  }
  if (!row.leadId || typeof row.leadId !== "string" || !row.leadId.trim()) {
    return `Row ${index + 1}: 'leadId' is required`;
  }
  if (!/^[a-f\d]{24}$/i.test(row.leadId.trim())) {
    return `Row ${index + 1}: '${row.leadId}' is not a valid leadId (must be a 24-character MongoDB ObjectId)`;
  }
  if (
    row.value !== undefined &&
    (isNaN(Number(row.value)) ||
      Number(row.value) < 0 ||
      Number(row.value) > 1_000_000)
  ) {
    return `Row ${index + 1}: value must be a number between 0 and 1,000,000`;
  }
  if (row.status && !VALID_DEAL_STATUSES.has(row.status)) {
    return `Row ${index + 1}: '${row.status}' is not a valid status. Must be one of: ${[...VALID_DEAL_STATUSES].join(", ")}`;
  }
  return null;
}

export function parseFile(file) {
  const { mimetype, buffer } = file;

  if (mimetype === "text/csv") {
    return parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }

  // Excel (.xlsx / .xls)
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}
