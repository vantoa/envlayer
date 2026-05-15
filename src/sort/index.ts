import { sortEnvMap, formatSortResult } from './envSorter';
import { SortOptions, SortResult } from './types';

export { SortOptions, SortResult };

/**
 * Sort an env map and return the sorted copy.
 */
export function sortEnv(
  env: Record<string, string>,
  options?: SortOptions
): Record<string, string> {
  return sortEnvMap(env, options).sorted;
}

/**
 * Sort an env map and return the full result including metadata.
 */
export function sortEnvFull(
  env: Record<string, string>,
  options?: SortOptions
): SortResult {
  return sortEnvMap(env, options);
}

/**
 * Return true if the env map is already in sorted order.
 */
export function isSorted(
  env: Record<string, string>,
  options?: SortOptions
): boolean {
  return !sortEnvMap(env, options).changed;
}

/**
 * Return the keys in sorted order without rebuilding the map.
 */
export function getSortedKeys(
  env: Record<string, string>,
  options?: SortOptions
): string[] {
  return sortEnvMap(env, options).newOrder;
}

/**
 * Print a human-readable sort summary to stdout.
 */
export function printSortResult(
  env: Record<string, string>,
  options?: SortOptions
): void {
  const result = sortEnvMap(env, options);
  console.log(formatSortResult(result));
}
