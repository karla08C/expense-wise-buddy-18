type CsvValue = string | number | null | undefined;

function protectSpreadsheetValue(value: CsvValue) {
  const text = value == null ? "" : String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function escapeCsv(value: CsvValue) {
  const safe = protectSpreadsheetValue(value).replaceAll('"', '""');
  return `"${safe}"`;
}

export function downloadCsv(filename: string, headers: string[], rows: CsvValue[][]) {
  const content = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(";"))
    .join("\r\n");
  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function csvDateStamp() {
  return new Date().toISOString().slice(0, 10);
}