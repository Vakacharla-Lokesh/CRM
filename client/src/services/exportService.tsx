import type { Lead } from "@/types/leads";
import type { Organization } from "@/types/organizations";
import type { Deal } from "@/types/deals";
import { exportAndDownloadCsv } from "@/utils";
import leadService from "@/services/leadService";
import organizationService from "@/services/organizationService";
import dealService from "@/services/dealService";

const LEAD_COLUMNS: (keyof Omit<Lead, "_id" | "tenantId">)[] = [
  "leadFirstName",
  "leadLastName",
  "leadEmail",
  "leadSource",
  "leadStatus",
  "leadScore",
  "createdAt",
  "updatedAt",
];

const ORGANIZATION_COLUMNS: (keyof Omit<Organization, "_id" | "tenantId">)[] = [
  "organizationName",
  "organizationWebsite",
  "organizationSize",
  "organizationIndustry",
  "createdAt",
  "updatedAt",
];

const DEAL_COLUMNS: (keyof Omit<Deal, "_id" | "tenantId">)[] = [
  "dealId",
  "dealName",
  "dealValue",
  "dealStatus",
  "leadId",
  "organizationId",
  "userId",
  "createdAt",
  "updatedAt",
];

function stripInternalFields<T extends Record<string, unknown>>(
  items: T[],
  columns: string[],
): Record<string, unknown>[] {
  return items.map((item) => {
    const row: Record<string, unknown> = {};
    for (const col of columns) {
      row[col] = (item as Record<string, unknown>)[col];
    }
    return row;
  });
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function exportLeads(selectedIds?: string[]): Promise<void> {
  const all = await leadService.getAllLeads();
  const leads = selectedIds?.length
    ? all.leads.filter((l) => selectedIds.includes(l._id))
    : all.leads;

  const columns = LEAD_COLUMNS as string[];
  const rows = stripInternalFields(
    leads as unknown as Record<string, unknown>[],
    columns,
  );
  exportAndDownloadCsv(rows, columns, `leads_${timestamp()}.csv`);
}

export async function exportOrganizations(
  selectedIds?: string[],
): Promise<void> {
  const all = await organizationService.getAllOrganizations();
  const orgs = selectedIds?.length
    ? all.filter((o) => selectedIds.includes(o._id))
    : all;

  const columns = ORGANIZATION_COLUMNS as string[];
  const rows = stripInternalFields(
    orgs as unknown as Record<string, unknown>[],
    columns,
  );
  exportAndDownloadCsv(rows, columns, `organizations_${timestamp()}.csv`);
}

export async function exportDeals(selectedIds?: string[]): Promise<void> {
  const all = await dealService.getAllDeals();
  const deals = selectedIds?.length
    ? all.filter((d) => selectedIds.includes(d._id))
    : all;

  const columns = DEAL_COLUMNS as string[];
  const rows = stripInternalFields(
    deals as unknown as Record<string, unknown>[],
    columns,
  );
  exportAndDownloadCsv(rows, columns, `deals_${timestamp()}.csv`);
}
