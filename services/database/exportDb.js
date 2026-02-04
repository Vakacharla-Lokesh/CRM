export function downloadCsvFromData(storeName, data) {
  const objectKeys = {
    Leads: ["lead_id", "organization_id", "tenant_id", "user_id"],
    Organizations: ["organization_id", "tenant_id", "user_id"],
    Deals: ["deal_id", "lead_id", "organization_id", "tenant_id", "user_id"],
    Tenants: ["tenant_id"],
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
