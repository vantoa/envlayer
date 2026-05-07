import { EnvMap, InterpolationOptions, InterpolationResult, InterpolationError } from './types';

const VAR_PATTERN = /\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/gi;

export function interpolateValue(
  value: string,
  env: EnvMap,
  options: InterpolationOptions = {},
  visited: string[] = []
): InterpolationResult {
  const { allowMissing = false, maxDepth = 10, fallback = '' } = options;
  const resolvedRefs: string[] = [];
  const missingRefs: string[] = [];

  if (visited.length >= maxDepth) {
    return { value, resolvedRefs, missingRefs };
  }

  const result = value.replace(VAR_PATTERN, (_match, braced, bare) => {
    const refName = braced || bare;

    if (visited.includes(refName)) {
      throw { key: refName, message: `Circular reference detected`, circularPath: [...visited, refName] } as InterpolationError;
    }

    if (refName in env) {
      resolvedRefs.push(refName);
      const nested = interpolateValue(env[refName], env, options, [...visited, refName]);
      resolvedRefs.push(...nested.resolvedRefs);
      missingRefs.push(...nested.missingRefs);
      return nested.value;
    }

    missingRefs.push(refName);
    if (!allowMissing) {
      throw { key: refName, message: `Undefined variable: ${refName}` } as InterpolationError;
    }
    return fallback;
  });

  return { value: result, resolvedRefs, missingRefs };
}

export function interpolateEnvMap(
  env: EnvMap,
  options: InterpolationOptions = {}
): { result: EnvMap; errors: InterpolationError[] } {
  const result: EnvMap = {};
  const errors: InterpolationError[] = [];

  for (const [key, value] of Object.entries(env)) {
    try {
      const interp = interpolateValue(value, env, options);
      result[key] = interp.value;
    } catch (err) {
      errors.push(err as InterpolationError);
      result[key] = value;
    }
  }

  return { result, errors };
}

export function hasInterpolation(value: string): boolean {
  VAR_PATTERN.lastIndex = 0;
  return VAR_PATTERN.test(value);
}
