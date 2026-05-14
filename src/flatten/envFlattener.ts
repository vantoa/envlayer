import { EnvMap } from '../merge/types';

export interface FlattenOptions {
  separator?: string;
  prefix?: string;
  maxDepth?: number;
}

export interface FlattenResult {
  original: EnvMap;
  flattened: EnvMap;
  renamedKeys: Array<{ from: string; to: string }>;
  skipped: string[];
}

/**
 * Flattens nested-style keys (e.g. APP__DB__HOST) into a single-level map
 * using a configurable separator.
 */
export function flattenEnvMap(
  envMap: EnvMap,
  options: FlattenOptions = {}
): FlattenResult {
  const { separator = '__', prefix = '', maxDepth = 10 } = options;

  const flattened: EnvMap = {};
  const renamedKeys: Array<{ from: string; to: string }> = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(envMap)) {
    const parts = key.split(separator);

    if (parts.length > maxDepth) {
      skipped.push(key);
      continue;
    }

    const newKey = prefix
      ? `${prefix}${separator}${key}`
      : key;

    if (newKey !== key) {
      renamedKeys.push({ from: key, to: newKey });
    }

    flattened[newKey] = value;
  }

  return { original: envMap, flattened, renamedKeys, skipped };
}

/**
 * Unflattens a single-level map back into nested-style keys by stripping a prefix.
 */
export function unflattenEnvMap(
  envMap: EnvMap,
  prefix: string,
  separator = '__'
): EnvMap {
  const result: EnvMap = {};
  const prefixWithSep = `${prefix}${separator}`;

  for (const [key, value] of Object.entries(envMap)) {
    if (key.startsWith(prefixWithSep)) {
      const stripped = key.slice(prefixWithSep.length);
      if (stripped.length > 0) {
        result[stripped] = value;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function formatFlattenResult(result: FlattenResult): string {
  const lines: string[] = [];
  lines.push(`Flattened: ${Object.keys(result.flattened).length} keys`);
  if (result.renamedKeys.length > 0) {
    lines.push(`Renamed (${result.renamedKeys.length}):`);
    for (const { from, to } of result.renamedKeys) {
      lines.push(`  ${from} → ${to}`);
    }
  }
  if (result.skipped.length > 0) {
    lines.push(`Skipped (exceeded maxDepth): ${result.skipped.join(', ')}`);
  }
  return lines.join('\n');
}
