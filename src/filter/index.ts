import { EnvMap } from '../merge/types';
import { FilterOptions, FilterResult, filterEnvMap } from './envFilter';

export function filterEnv(env: EnvMap, options: FilterOptions): EnvMap {
  const result = filterEnvMap(env, options);
  return result.matched;
}

export function filterEnvFull(env: EnvMap, options: FilterOptions): FilterResult {
  return filterEnvMap(env, options);
}

export function pickKeys(env: EnvMap, keys: string[]): EnvMap {
  return filterEnv(env, { keys });
}

export function omitKeys(env: EnvMap, keys: string[]): EnvMap {
  return filterEnv(env, { keys, invert: true });
}

export function filterByPrefix(env: EnvMap, prefix: string, strip = false): EnvMap {
  const filtered = filterEnv(env, { prefix });
  if (!strip) return filtered;
  return Object.fromEntries(
    Object.entries(filtered).map(([k, v]) => [k.slice(prefix.length), v])
  );
}

export function filterByPattern(env: EnvMap, pattern: RegExp): EnvMap {
  return filterEnv(env, { pattern });
}

export function printFilterResult(result: FilterResult): void {
  console.log(`Filter result: ${result.matchedCount} matched, ${result.excludedCount} excluded`);
  if (result.matchedCount > 0) {
    console.log('Matched keys:', Object.keys(result.matched).join(', '));
  }
  if (result.excludedCount > 0) {
    console.log('Excluded keys:', Object.keys(result.excluded).join(', '));
  }
}
