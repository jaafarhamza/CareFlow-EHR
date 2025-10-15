export function parseDurationMs(expr) {
  const str = String(expr || "").trim();
  const num = parseInt(str, 10);
  if (str.endsWith("ms")) return num;
  if (str.endsWith("s")) return num * 1000;
  if (str.endsWith("m")) return num * 60 * 1000;
  if (str.endsWith("h")) return num * 60 * 60 * 1000;
  if (str.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  return isNaN(num) ? 0 : num;
}


