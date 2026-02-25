// src/services/labeling/patternParser.ts

/**
 * Parses a pattern string and generates an array of labels.
 * Examples:
 * - "A{1..3}" -> ["A1", "A2", "A3"]
 * - "{A..C}1" -> ["A1", "B1", "C1"]
 * - "{A..B}{1..2}" -> ["A1", "A2", "B1", "B2"]
 */
export const parsePattern = (pattern: string): string[] => {
  // Regex to find patterns like {1..10} or {A..Z}
  const rangeRegex = /\{([^}]+)\}/g;
  const matches = Array.from(pattern.matchAll(rangeRegex));

  if (matches.length === 0) {
    return [pattern];
  }

  // Pre-calculate segments for each match
  const expandedSegments: string[][] = [];

  for (const match of matches) {
    const rawContent = match[1];
    const parts = rawContent.split("..");

    if (parts.length !== 2) {
      // Not a valid range, treat as plain text for now or return original
      expandedSegments.push([`{${rawContent}}`]);
      continue;
    }

    const startStr = parts[0].trim();
    const endStr = parts[1].trim();

    // Check if numeric range
    if (
      startStr !== "" &&
      endStr !== "" &&
      !isNaN(Number(startStr)) &&
      !isNaN(Number(endStr))
    ) {
      const s = Number(startStr);
      const e = Number(endStr);
      const step = s <= e ? 1 : -1;
      const range: string[] = [];
      for (let i = s; s <= e ? i <= e : i >= e; i += step) {
        range.push(String(i));
      }
      expandedSegments.push(range);
    }
    // Check if alphabetic range (single char)
    else if (
      startStr.length === 1 &&
      endStr.length === 1 &&
      isAlpha(startStr) &&
      isAlpha(endStr)
    ) {
      const s = startStr.charCodeAt(0);
      const e = endStr.charCodeAt(0);
      const step = s <= e ? 1 : -1;
      const range: string[] = [];
      for (let i = s; s <= e ? i <= e : i >= e; i += step) {
        range.push(String.fromCharCode(i));
      }
      expandedSegments.push(range);
    } else {
      expandedSegments.push([`{${rawContent}}`]);
    }
  }

  // Calculate cartesian product of all parts
  // Split the rest of the string around the placeholders
  const staticParts = pattern.split(rangeRegex);
  // staticParts has format: [Prefix, Pattern1, Middle, Pattern2, Suffix]
  // BUT Regex match segments are what we expanded.
  // A better way to rebuild is to use a cartesian product of ALL parts (static and expanded)

  let results: string[] = [""];

  // Re-split to get static parts and then interleave
  // Pattern: "A{1..2}B{3..4}"
  // Static: ["A", "B", ""]
  // Expanded: [["1","2"], ["3","4"]]

  for (let i = 0; i < expandedSegments.length; i++) {
    const prefix = staticParts[i * 2];
    const currentExpanded = expandedSegments[i];
    const nextResults: string[] = [];

    for (const res of results) {
      for (const val of currentExpanded) {
        nextResults.push(res + prefix + val);
      }
    }
    results = nextResults;
  }

  // Add the last static part/suffix
  const suffix = staticParts[staticParts.length - 1];
  results = results.map((r) => r + suffix);

  return results;
};

const isAlpha = (str: string) => /^[a-zA-Z]$/.test(str);
