import { EnvMap } from '../merge/types';
import { dedupeEnvMap, findDuplicates, formatDedupeResult, DedupeResult } from './envDeduper';

/**
 * Removes keys from `target` that are identical in `base`.
 * Returns the deduped map.
 */
export function dedupeLayer(target: EnvMap, base: EnvMap): EnvMap {
  const { deduped } = dedupeEnvMap(target, base);
  return deduped;
}

/**
 * Returns the full DedupeResult including removed keys and count.
 */
export function dedupeLayerFull(target: EnvMap, base: EnvMap): DedupeResult {
  return dedupeEnvMap(target, base);
}

/**
 * Returns keys that are identical between target and base.
 */
export function getDuplicateKeys(target: EnvMap, base: EnvMap): string[] {
  const { duplicates } = dedupeEnvMap(target, base);
  return Object.keys(duplicates);
}

/**
 * Returns true if target has no keys that are identical in base.
 */
export function isUnique(target: EnvMap, base: EnvMap): boolean {
  const { removedCount } = dedupeEnvMap(target, base);
  return removedCount === 0;
}

/**
 * Finds duplicate key=value tokens across multiple maps.
 */
export function findCrossDuplicates(maps: EnvMap[]): Record<string, string[]> {
  return findDuplicates(maps);
}

/**
 * Prints a human-readable deduplication summary.
 */
export function printDedupeResult(target: EnvMap, base: EnvMap): void {
  const result = dedupeEnvMap(target, base);
  console.log(formatDedupeResult(result));
}
