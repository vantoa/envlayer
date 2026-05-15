import { EnvMap } from '../parser/types';
import { CoerceRule, CoerceResult, coerceEnvMap, formatCoerceResult } from './envCoercer';

export type { CoerceRule, CoerceResult };

/**
 * Coerce env values according to the given rules.
 * Returns the resulting EnvMap with coerced values.
 */
export function coerceEnv(env: EnvMap, rules: CoerceRule[]): EnvMap {
  return coerceEnvMap(env, rules).coerced;
}

/**
 * Coerce env values and return full result including changed/failed metadata.
 */
export function coerceEnvFull(env: EnvMap, rules: CoerceRule[]): CoerceResult {
  return coerceEnvMap(env, rules);
}

/**
 * Return keys that were successfully coerced (value changed).
 */
export function getCoercedKeys(env: EnvMap, rules: CoerceRule[]): string[] {
  return coerceEnvMap(env, rules).changed;
}

/**
 * Return keys that failed coercion.
 */
export function getFailedCoercions(env: EnvMap, rules: CoerceRule[]): { key: string; reason: string }[] {
  return coerceEnvMap(env, rules).failed;
}

/**
 * Returns true if all rules applied without failures.
 */
export function isFullyCoercible(env: EnvMap, rules: CoerceRule[]): boolean {
  return coerceEnvMap(env, rules).failed.length === 0;
}

/**
 * Print a human-readable coerce result summary.
 */
export function printCoerceResult(env: EnvMap, rules: CoerceRule[]): void {
  const result = coerceEnvMap(env, rules);
  console.log(formatCoerceResult(result));
}
