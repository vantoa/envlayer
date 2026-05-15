import { EnvMap } from '../merge/types';

export interface DedupeResult {
  deduped: EnvMap;
  duplicates: Record<string, string[]>;
  removedCount: number;
}

/**
 * Finds keys that appear in multiple maps with the same value.
 */
export function findDuplicates(maps: EnvMap[]): Record<string, string[]> {
  const keyValueSources: Record<string, Set<string>> = {};

  maps.forEach((map, idx) => {
    for (const [key, value] of Object.entries(map)) {
      const token = `${key}=${value}`;
      if (!keyValueSources[token]) {
        keyValueSources[token] = new Set();
      }
      keyValueSources[token].add(`layer[${idx}]`);
    }
  });

  const duplicates: Record<string, string[]> = {};
  for (const [token, sources] of Object.entries(keyValueSources)) {
    if (sources.size > 1) {
      duplicates[token] = Array.from(sources);
    }
  }
  return duplicates;
}

/**
 * Removes duplicate key-value pairs from an env map by comparing against
 * a base map. Keys present in base with identical values are removed from target.
 */
export function dedupeEnvMap(target: EnvMap, base: EnvMap): DedupeResult {
  const deduped: EnvMap = {};
  const duplicates: Record<string, string[]> = {};
  let removedCount = 0;

  for (const [key, value] of Object.entries(target)) {
    if (base[key] === value) {
      duplicates[key] = [value];
      removedCount++;
    } else {
      deduped[key] = value;
    }
  }

  return { deduped, duplicates, removedCount };
}

export function formatDedupeResult(result: DedupeResult): string {
  const lines: string[] = [];
  lines.push(`Deduplication complete: ${result.removedCount} duplicate(s) removed.`);
  if (result.removedCount > 0) {
    lines.push('Removed keys:');
    for (const key of Object.keys(result.duplicates)) {
      lines.push(`  - ${key}`);
    }
  }
  return lines.join('\n');
}
