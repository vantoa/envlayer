/**
 * envTrimmer.ts
 * Core logic for trimming whitespace and normalizing env values.
 */

export interface TrimResult {
  original: Record<string, string>;
  trimmed: Record<string, string>;
  changed: string[];
}

/**
 * Trim leading/trailing whitespace from a single value.
 */
export function trimValue(value: string): string {
  return value.trim();
}

/**
 * Trim all values in an env map, optionally trimming keys too.
 */
export function trimEnvMap(
  env: Record<string, string>,
  options: { trimKeys?: boolean; trimValues?: boolean } = {}
): Record<string, string> {
  const { trimKeys = false, trimValues = true } = options;
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    const newKey = trimKeys ? key.trim() : key;
    const newValue = trimValues ? value.trim() : value;
    result[newKey] = newValue;
  }

  return result;
}

/**
 * Produce a TrimResult showing what changed.
 */
export function formatTrimResult(
  original: Record<string, string>,
  trimmed: Record<string, string>
): TrimResult {
  const changed = Object.keys(original).filter(
    (key) => original[key] !== trimmed[key]
  );

  return { original, trimmed, changed };
}
