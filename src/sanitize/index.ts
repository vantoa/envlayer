import { sanitizeEnvMap, formatSanitizeResult, SanitizeResult } from './envSanitizer';

export type { SanitizeResult };

/**
 * Sanitize an env map, removing or fixing invalid keys.
 * Returns the cleaned map and a result summary.
 */
export function sanitizeEnv(
  envMap: Record<string, string>,
  options: { stripInvalid?: boolean; warnOnly?: boolean } = {}
): { map: Record<string, string>; result: SanitizeResult } {
  const result = sanitizeEnvMap(envMap, options);
  return { map: result.sanitized, result };
}

/**
 * Returns only the valid entries from an env map.
 */
export function filterValidKeys(
  envMap: Record<string, string>
): Record<string, string> {
  const { map } = sanitizeEnv(envMap, { stripInvalid: true });
  return map;
}

/**
 * Returns a list of invalid keys found in the env map.
 */
export function getInvalidKeys(envMap: Record<string, string>): string[] {
  const result = sanitizeEnvMap(envMap, {});
  return result.invalidKeys;
}

/**
 * Print a human-readable sanitize report to stdout.
 */
export function printSanitizeResult(result: SanitizeResult): void {
  console.log(formatSanitizeResult(result));
}

/**
 * Returns true if all keys in the env map are valid.
 */
export function isClean(envMap: Record<string, string>): boolean {
  return getInvalidKeys(envMap).length === 0;
}
