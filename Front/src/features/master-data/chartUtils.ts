/** Export an array of objects as a CSV file */
export function exportCSV(data: Record<string, unknown>[], filename = "export.csv") {
  if (!data || data.length === 0) return;
  const keys = Object.keys(data[0]);
  const header = keys.join(",");
  const rows = data.map(row =>
    keys.map(k => {
      const val = row[k];
      if (val === null || val === undefined) return "";
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") || str.includes("\n") ? `"${str}"` : str;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Format a date string as DD-MMM-YYYY */
export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

/** Calculate days until expiry */
export function daysUntil(dateStr: string | null | undefined): number {
  if (!dateStr) return Infinity;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
