import { EnvMap } from "../merge/types";
import {
  applyDefaults,
  getMissingDefaultKeys,
  formatDefaultsResult,
  DefaultsResult,
} from "./envDefaults";

export type { DefaultsResult };

/**
 * Apply defaults to an env map, returning only the merged output.
 */
export function withDefaults(
  env: EnvMap,
  defaults: EnvMap,
  overwriteEmpty = false
): EnvMap {
  return applyDefaults(env, defaults, overwriteEmpty).output;
}

/**
 * Apply defaults and return the full result including applied/skipped metadata.
 */
export function withDefaultsFull(
  env: EnvMap,
  defaults: EnvMap,
  overwriteEmpty = false
): DefaultsResult {
  return applyDefaults(env, defaults, overwriteEmpty);
}

/**
 * Return keys from the defaults map that are absent in the env.
 */
export function missingDefaults(env: EnvMap, defaults: EnvMap): string[] {
  return getMissingDefaultKeys(env, defaults);
}

/**
 * Return true if all default keys are present in the env.
 */
export function hasAllDefaults(env: EnvMap, defaults: EnvMap): boolean {
  return getMissingDefaultKeys(env, defaults).length === 0;
}

/**
 * Print a human-readable summary of the defaults application result.
 */
export function printDefaultsResult(result: DefaultsResult): void {
  console.log(formatDefaultsResult(result));
}
