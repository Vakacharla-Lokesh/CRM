import { exportAPI } from "./api";

export async function exportLeads(selectedIds?: string[]): Promise<void> {
  await exportAPI.leads(selectedIds);
}

export async function exportOrganizations(
  selectedIds?: string[],
): Promise<void> {
  await exportAPI.organizations(selectedIds);
}

export async function exportDeals(selectedIds?: string[]): Promise<void> {
  await exportAPI.deals(selectedIds);
}

export async function exportEmailLeads(selectedIds?: string[], email?: string): Promise<void> {
  await exportAPI.emailLeads(selectedIds, email);
}

export default {
  exportLeads,
  exportOrganizations,
  exportDeals,
};
