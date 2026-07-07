/** Export an array of objects as a CSV file */
export function exportCSV(
filename: string,
headers: string[],
rows: (string | number | null | undefined)[][]
) {
const csv = [
headers.join(","),
...rows.map(r =>
r.map(v => `"${v ?? ""}"`).join(",")
)
].join("\n");

const blob = new Blob([csv], {
type: "text/csv;charset=utf-8;"
});

const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();

URL.revokeObjectURL(url);
}

/** Calculate days until expiry */
export function daysUntil(dateStr: string | null | undefined): number {
  if (!dateStr) return Infinity;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}


export const formatDate = (date?: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
};