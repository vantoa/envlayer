import { EnvMap } from '../merge/types';

export interface FilterOptions {
  keys?: string[];
  prefix?: string;
  suffix?: string;
  pattern?: RegExp;
  invert?: boolean;
}

export interface FilterResult {
  matched: EnvMap;
  excluded: EnvMap;
  matchedCount: number;
  excludedCount: number;
}

export function filterByKeys(env: EnvMap, keys: string[]): EnvMap {
  const keySet = new Set(keys);
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => keySet.has(k))
  );
}

export function filterByPrefix(env: EnvMap, prefix: string): EnvMap {
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => k.startsWith(prefix))
  );
}

export function filterBySuffix(env: EnvMap, suffix: string): EnvMap {
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => k.endsWith(suffix))
  );
}

export function filterByPattern(env: EnvMap, pattern: RegExp): EnvMap {
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => pattern.test(k))
  );
}

export function filterEnvMap(env: EnvMap, options: FilterOptions): FilterResult {
  let matched: EnvMap = { ...env };

  if (options.keys && options.keys.length > 0) {
    matched = filterByKeys(matched, options.keys);
  }
  if (options.prefix) {
    matched = filterByPrefix(matched, options.prefix);
  }
  if (options.suffix) {
    matched = filterBySuffix(matched, options.suffix);
  }
  if (options.pattern) {
    matched = filterByPattern(matched, options.pattern);
  }

  if (options.invert) {
    const matchedKeys = new Set(Object.keys(matched));
    const inverted = Object.fromEntries(
      Object.entries(env).filter(([k]) => !matchedKeys.has(k))
    );
    const excluded = matched;
    return {
      matched: inverted,
      excluded,
      matchedCount: Object.keys(inverted).length,
      excludedCount: Object.keys(excluded).length,
    };
  }

  const matchedKeys = new Set(Object.keys(matched));
  const excluded = Object.fromEntries(
    Object.entries(env).filter(([k]) => !matchedKeys.has(k))
  );

  return {
    matched,
    excluded,
    matchedCount: Object.keys(matched).length,
    excludedCount: Object.keys(excluded).length,
  };
}
