import { castEnvMap, formatCastResult, CastResult } from './envCaster';

export type { CastResult } from './envCaster';

/**
 * Cast all values in an env map using type inference.
 * Returns a plain Record<string, unknown> with typed values.
 */
export function castEnv(env: Record<string, string>): Record<string, unknown> {
  const result = castEnvMap(env);
  return result.casted;
}

/**
 * Cast all values and return the full CastResult including metadata.
 */
export function castEnvFull(env: Record<string, string>): CastResult {
  return castEnvMap(env);
}

/**
 * Return keys whose values were successfully cast to a non-string type.
 */
export function getCastedKeys(env: Record<string, string>): string[] {
  const result = castEnvMap(env);
  return result.castedKeys;
}

/**
 * Return keys whose values could not be cast (remained as strings).
 */
export function getUncastedKeys(env: Record<string, string>): string[] {
  const result = castEnvMap(env);
  return result.uncastedKeys;
}

/**
 * Returns true if all values were cast to a non-string type.
 */
export function isFullyCasted(env: Record<string, string>): boolean {
  const result = castEnvMap(env);
  return result.uncastedKeys.length === 0;
}

/**
 * Print a human-readable summary of cast results.
 */
export function printCastResult(env: Record<string, string>): void {
  const result = castEnvMap(env);
  console.log(formatCastResult(result));
}
