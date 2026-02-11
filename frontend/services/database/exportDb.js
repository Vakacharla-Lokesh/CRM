export function downloadCsvFromData(storeName, data) {
  const objectKeys = {
    Leads: ["_id", "organizationId", "tenantId", "userId"],
    Organizations: ["_id", "tenantId", "userId"],
    Deals: ["_id", "leadId", "organizationId", "tenantId", "userId"],
    Tenants: ["_id", "tenantId"],
  };

  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const idKey = objectKeys[storeName];

  const headers = Array.from(
    new Set(
      data.flatMap((obj) =>
        Object.keys(obj).filter((key) => !idKey.includes(key)),
      ),
    ),
  );

  const escapeCsv = (value) => {
    if (value == null) return "";
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => escapeCsv(row[h])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${storeName}_export.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
