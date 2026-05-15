import { EnvMap } from '../merge/types';
import { inheritEnvMap, formatInheritResult, InheritResult } from './envInheritor';

/**
 * Merges a child env map on top of a base, returning the resolved map
 * with full inheritance metadata.
 */
export function applyInheritance(
  base: EnvMap,
  child: EnvMap,
  baseLabel = 'base',
  childLabel = 'child'
): InheritResult {
  return inheritEnvMap(base, child, baseLabel, childLabel);
}

/**
 * Returns only the final resolved env map after inheritance.
 */
export function resolveInherited(
  base: EnvMap,
  child: EnvMap
): EnvMap {
  return inheritEnvMap(base, child).finalMap;
}

/**
 * Returns keys that were inherited unchanged from base.
 */
export function getInheritedKeys(base: EnvMap, child: EnvMap): string[] {
  return Object.keys(inheritEnvMap(base, child).inherited);
}

/**
 * Returns keys that the child overrides from base.
 */
export function getOverriddenKeys(base: EnvMap, child: EnvMap): string[] {
  return Object.keys(inheritEnvMap(base, child).overridden);
}

/**
 * Prints a human-readable summary of the inheritance to stdout.
 */
export function printInheritResult(
  base: EnvMap,
  child: EnvMap,
  baseLabel = 'base',
  childLabel = 'child'
): void {
  const result = inheritEnvMap(base, child, baseLabel, childLabel);
  console.log(formatInheritResult(result));
}
