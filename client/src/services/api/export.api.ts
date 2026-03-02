import { API_BASE_URL, getToken, APIError } from "./core";
import { downloadCsv } from "../../utils";

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

async function downloadExport(
  endpoint: string,
  ids?: string[],
  filename?: string,
): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body: { ids?: string[] } = {};
  if (ids?.length) body.ids = ids;

  const response = await fetch(`${API_BASE_URL}/export/${endpoint}`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      response.status,
      errorData,
      errorData.message || "Export failed",
    );
  }

  const csvText = await response.text();
  downloadCsv(csvText, filename ?? "export.csv");
}

async function emailExport(
  endpoint: string,
  ids?: string[],
  email?: string,
): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body: { ids?: string[]; email?: string } = {};
  if (ids?.length) body.ids = ids;
  if (email) body.email = email;

  const response = await fetch(`${API_BASE_URL}/export/${endpoint}`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      response.status,
      errorData,
      errorData.message || "Export failed",
    );
  }
}

export const exportAPI = {
  leads: (ids?: string[]): Promise<void> =>
    downloadExport("leads", ids, `leads_${timestamp()}.csv`),

  organizations: (ids?: string[]): Promise<void> =>
    downloadExport("organizations", ids, `organizations_${timestamp()}.csv`),

  deals: (ids?: string[]): Promise<void> =>
    downloadExport("deals", ids, `deals_${timestamp()}.csv`),

  emailLeads: (ids?: string[], email?: string): Promise<void> =>
    emailExport("leads/toemail", ids, email),

  emailOrganizations: (ids?: string[], email?: string): Promise<void> =>
    emailExport("organizations/toemail", ids, email),

  emailDeals: (ids?: string[], email?: string): Promise<void> =>
    emailExport("deals/toemail", ids, email),
};
