import { EnvMap } from "../merge/types";

export interface SanitizeOptions {
  stripEmptyValues?: boolean;
  trimWhitespace?: boolean;
  removeInvalidKeys?: boolean;
  allowedKeyPattern?: RegExp;
}

export interface SanitizeResult {
  sanitized: EnvMap;
  removed: string[];
  modified: string[];
}

const DEFAULT_KEY_PATTERN = /^[A-Z_][A-Z0-9_]*$/i;

export function isValidKey(key: string, pattern: RegExp = DEFAULT_KEY_PATTERN): boolean {
  return pattern.test(key);
}

export function sanitizeEnvMap(
  env: EnvMap,
  options: SanitizeOptions = {}
): SanitizeResult {
  const {
    stripEmptyValues = false,
    trimWhitespace = true,
    removeInvalidKeys = true,
    allowedKeyPattern = DEFAULT_KEY_PATTERN,
  } = options;

  const sanitized: EnvMap = {};
  const removed: string[] = [];
  const modified: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (removeInvalidKeys && !isValidKey(key, allowedKeyPattern)) {
      removed.push(key);
      continue;
    }

    if (stripEmptyValues && (value === "" || value === undefined || value === null)) {
      removed.push(key);
      continue;
    }

    const originalValue = value ?? "";
    const processedValue = trimWhitespace ? originalValue.trim() : originalValue;

    if (processedValue !== originalValue) {
      modified.push(key);
    }

    sanitized[key] = processedValue;
  }

  return { sanitized, removed, modified };
}

export function formatSanitizeResult(result: SanitizeResult): string {
  const lines: string[] = [];

  if (result.modified.length > 0) {
    lines.push(`Modified (${result.modified.length}): ${result.modified.join(", ")}`);
  }

  if (result.removed.length > 0) {
    lines.push(`Removed (${result.removed.length}): ${result.removed.join(", ")}`);
  }

  if (lines.length === 0) {
    lines.push("No changes made during sanitization.");
  }

  return lines.join("\n");
}
