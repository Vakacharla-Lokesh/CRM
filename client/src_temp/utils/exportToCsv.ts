type CsvRow = Record<string, unknown>;

export function objectsToCsv(rows: CsvRow[], columns: string[]): string {
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.join(",");
  const body = rows
    .map((row) => columns.map((col) => escape(row[col])).join(","))
    .join("\n");

  return `${header}\n${body}`;
}

export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function exportAndDownloadCsv(
  rows: CsvRow[],
  columns: string[],
  filename: string,
): void {
  if (!rows.length) return;
  const csv = objectsToCsv(rows, columns);
  downloadCsv(csv, filename);
}
