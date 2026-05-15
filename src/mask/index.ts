import { isSensitiveKey, maskString, maskEnvMap, formatMaskResult } from './envMasker';
import type { EnvMap } from '../parser/types';

export interface MaskOptions {
  placeholder?: string;
  visibleChars?: number;
  customKeys?: string[];
}

/**
 * Mask sensitive values in an env map.
 * Returns a new map with masked values.
 */
export function maskEnv(
  env: EnvMap,
  options: MaskOptions = {}
): EnvMap {
  return maskEnvMap(env, {
    placeholder: options.placeholder ?? '***',
    visibleChars: options.visibleChars ?? 0,
    extraKeys: options.customKeys ?? [],
  });
}

/**
 * Mask a single value if the key is considered sensitive.
 */
export function maskIfSensitive(
  key: string,
  value: string,
  options: MaskOptions = {}
): string {
  const sensitive = isSensitiveKey(key, options.customKeys ?? []);
  if (!sensitive) return value;
  return maskString(value, {
    placeholder: options.placeholder ?? '***',
    visibleChars: options.visibleChars ?? 0,
  });
}

/**
 * Return only the keys that would be masked in the given env map.
 */
export function getSensitiveKeys(
  env: EnvMap,
  customKeys: string[] = []
): string[] {
  return Object.keys(env).filter((key) => isSensitiveKey(key, customKeys));
}

/**
 * Print a formatted summary of the masking result to stdout.
 */
export function printMaskResult(
  original: EnvMap,
  masked: EnvMap
): void {
  const result = formatMaskResult(original, masked);
  console.log(result);
}

/**
 * Determine whether any sensitive keys exist in the env map.
 */
export function hasSensitiveKeys(
  env: EnvMap,
  customKeys: string[] = []
): boolean {
  return getSensitiveKeys(env, customKeys).length > 0;
}
