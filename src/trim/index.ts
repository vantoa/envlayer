/**
 * trim/index.ts
 * Public API for the trim module.
 */

import { trimEnvMap, formatTrimResult, TrimResult } from './envTrimmer';

export type { TrimResult };

/**
 * Trim all values (and optionally keys) in an env map.
 * Returns the trimmed map.
 */
export function trimEnv(
  env: Record<string, string>,
  options: { trimKeys?: boolean; trimValues?: boolean } = {}
): Record<string, string> {
  return trimEnvMap(env, options);
}

/**
 * Trim env map and return full result including changed keys.
 */
export function trimEnvFull(
  env: Record<string, string>,
  options: { trimKeys?: boolean; trimValues?: boolean } = {}
): TrimResult {
  const trimmed = trimEnvMap(env, options);
  return formatTrimResult(env, trimmed);
}

/**
 * Return list of keys whose values contain leading/trailing whitespace.
 */
export function getUntrimmedKeys(env: Record<string, string>): string[] {
  return Object.keys(env).filter((key) => env[key] !== env[key].trim());
}

/**
 * Return true if all values are already trimmed.
 */
export function isFullyTrimmed(env: Record<string, string>): boolean {
  return getUntrimmedKeys(env).length === 0;
}

/**
 * Print a human-readable summary of trim changes.
 */
export function printTrimResult(result: TrimResult): void {
  if (result.changed.length === 0) {
    console.log('No values needed trimming.');
    return;
  }
  console.log(`Trimmed ${result.changed.length} value(s):`);
  for (const key of result.changed) {
    console.log(`  ${key}: ${JSON.stringify(result.original[key])} → ${JSON.stringify(result.trimmed[key])}`);
  }
}
