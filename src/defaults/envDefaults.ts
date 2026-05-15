import { EnvMap } from "../merge/types";

export interface DefaultsResult {
  applied: Record<string, string>;
  skipped: Record<string, string>;
  output: EnvMap;
}

/**
 * Apply default values to an EnvMap for keys that are missing or empty.
 * @param env - The source environment map
 * @param defaults - A map of key -> default value
 * @param overwriteEmpty - If true, also replace empty string values
 */
export function applyDefaults(
  env: EnvMap,
  defaults: EnvMap,
  overwriteEmpty = false
): DefaultsResult {
  const output: EnvMap = { ...env };
  const applied: Record<string, string> = {};
  const skipped: Record<string, string> = {};

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const existing = output[key];
    const isMissing = existing === undefined;
    const isEmpty = existing === "";

    if (isMissing || (overwriteEmpty && isEmpty)) {
      output[key] = defaultValue;
      applied[key] = defaultValue;
    } else {
      skipped[key] = existing as string;
    }
  }

  return { applied, skipped, output };
}

/**
 * Return keys that are missing from the env relative to a defaults map.
 */
export function getMissingDefaultKeys(env: EnvMap, defaults: EnvMap): string[] {
  return Object.keys(defaults).filter((key) => !(key in env));
}

/**
 * Format a DefaultsResult for human-readable display.
 */
export function formatDefaultsResult(result: DefaultsResult): string {
  const lines: string[] = [];
  const appliedKeys = Object.keys(result.applied);
  const skippedKeys = Object.keys(result.skipped);

  if (appliedKeys.length === 0) {
    lines.push("No defaults applied.");
  } else {
    lines.push(`Applied ${appliedKeys.length} default(s):`);
    for (const key of appliedKeys) {
      lines.push(`  + ${key} = ${result.applied[key]}`);
    }
  }

  if (skippedKeys.length > 0) {
    lines.push(`Skipped ${skippedKeys.length} existing key(s):`);
    for (const key of skippedKeys) {
      lines.push(`  ~ ${key}`);
    }
  }

  return lines.join("\n");
}
