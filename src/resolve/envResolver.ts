import { EnvMap } from "../merge/types";

export interface ResolveResult {
  resolved: EnvMap;
  overrides: Record<string, { from: string; original: string; final: string }>;
  missing: string[];
}

/**
 * Resolves a final env map by applying a chain of override sources.
 * Later sources take precedence over earlier ones.
 */
export function resolveEnvChain(
  base: EnvMap,
  ...overrides: Array<{ source: string; map: EnvMap }>
): ResolveResult {
  const resolved: EnvMap = { ...base };
  const overrideLog: ResolveResult["overrides"] = {};

  for (const { source, map } of overrides) {
    for (const [key, value] of Object.entries(map)) {
      if (key in resolved && resolved[key] !== value) {
        overrideLog[key] = {
          from: source,
          original: resolved[key],
          final: value,
        };
      }
      resolved[key] = value;
    }
  }

  return { resolved, overrides: overrideLog, missing: [] };
}

/**
 * Checks which required keys are absent from the resolved map.
 */
export function findMissingKeys(resolved: EnvMap, required: string[]): string[] {
  return required.filter(
    (key) => !(key in resolved) || resolved[key] === undefined || resolved[key] === ""
  );
}

/**
 * Combines resolveEnvChain and findMissingKeys into a single pass.
 */
export function resolveWithRequired(
  base: EnvMap,
  required: string[],
  ...overrides: Array<{ source: string; map: EnvMap }>
): ResolveResult {
  const result = resolveEnvChain(base, ...overrides);
  result.missing = findMissingKeys(result.resolved, required);
  return result;
}

/**
 * Formats a ResolveResult into a human-readable summary string.
 */
export function formatResolveResult(result: ResolveResult): string {
  const lines: string[] = [];

  const overrideEntries = Object.entries(result.overrides);
  if (overrideEntries.length > 0) {
    lines.push("Overrides applied:");
    for (const [key, info] of overrideEntries) {
      lines.push(`  ${key}: "${info.original}" → "${info.final}" (from ${info.from})`);
    }
  } else {
    lines.push("No overrides applied.");
  }

  if (result.missing.length > 0) {
    lines.push(`Missing required keys: ${result.missing.join(", ")}`);
  } else {
    lines.push("All required keys present.");
  }

  return lines.join("\n");
}
