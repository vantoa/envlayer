import { interpolateEnvMap, interpolateValue, hasInterpolation } from './envInterpolator';
import { EnvMap, InterpolationOptions, InterpolationResult } from './types';

export { hasInterpolation };

/**
 * Interpolate all variable references in an env map.
 * Throws if any references are missing and allowMissing is not set.
 */
export function resolveInterpolations(
  env: EnvMap,
  options?: InterpolationOptions
): EnvMap {
  const { result, errors } = interpolateEnvMap(env, options);
  if (errors.length > 0) {
    const messages = errors.map(e => `  ${e.key}: ${e.message}`).join('\n');
    throw new Error(`Interpolation failed:\n${messages}`);
  }
  return result;
}

/**
 * Interpolate all variable references, returning errors instead of throwing.
 */
export function tryResolveInterpolations(
  env: EnvMap,
  options?: InterpolationOptions
): { env: EnvMap; errors: Array<{ key: string; message: string }> } {
  const { result, errors } = interpolateEnvMap(env, options);
  return { env: result, errors };
}

/**
 * Interpolate a single value against a given env map.
 */
export function resolveValue(
  value: string,
  env: EnvMap,
  options?: InterpolationOptions
): InterpolationResult {
  return interpolateValue(value, env, options);
}
