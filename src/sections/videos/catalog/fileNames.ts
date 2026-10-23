/** "brasa/02-teaser.json" → "02-teaser" */
export function baseName(path: string): string {
  const fileName = path.split("/").pop()!;
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

/** Number prefixes only set the order, so "02-conference_teaser" is titled "Conference teaser". */
export function titleFromName(name: string): string {
  const words = name
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Natural order, so "2-…" comes before "10-…". */
export const compareNames = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
