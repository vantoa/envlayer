import { resolveEnvChain, findMissingKeys, resolveWithRequired, formatResolveResult } from './envResolver';
import type { EnvMap } from '../merge/types';

export interface ResolveOptions {
  required?: string[];
  fallback?: EnvMap;
  strict?: boolean;
}

export interface ResolveResult {
  resolved: EnvMap;
  missing: string[];
  sources: Record<string, string>;
  ok: boolean;
}

/**
 * Resolve an env map from a chain of layers, with optional required keys and fallback.
 */
export function resolveEnv(
  layers: EnvMap[],
  options: ResolveOptions = {}
): ResolveResult {
  const { required = [], fallback = {}, strict = false } = options;

  const base = fallback ? [fallback, ...layers] : layers;
  const { resolved, sources } = resolveEnvChain(base);

  const missing = required.length > 0 ? findMissingKeys(resolved, required) : [];

  if (strict && missing.length > 0) {
    throw new Error(`Missing required env keys: ${missing.join(', ')}`);
  }

  return {
    resolved,
    missing,
    sources,
    ok: missing.length === 0,
  };
}

/**
 * Resolve with required keys enforced — throws if any are absent.
 */
export function resolveRequired(
  layers: EnvMap[],
  required: string[],
  fallback?: EnvMap
): EnvMap {
  const base = fallback ? [fallback, ...layers] : layers;
  return resolveWithRequired(base, required);
}

/**
 * Return only keys missing from the resolved env.
 */
export function getMissingKeys(resolved: EnvMap, required: string[]): string[] {
  return findMissingKeys(resolved, required);
}

/**
 * Check if all required keys are present.
 */
export function isFullyResolved(resolved: EnvMap, required: string[]): boolean {
  return findMissingKeys(resolved, required).length === 0;
}

/**
 * Print a human-readable resolve result.
 */
export function printResolveResult(result: ResolveResult): void {
  console.log(formatResolveResult(result.resolved, result.missing, result.sources));
}
