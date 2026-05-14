import { flattenEnvMap, unflattenEnvMap, formatFlattenResult } from './envFlattener';
import type { FlattenOptions, FlattenResult, UnflattenResult } from './types';

export function flattenEnv(
  envMap: Record<string, string>,
  options: FlattenOptions = {}
): FlattenResult {
  return flattenEnvMap(envMap, options);
}

export function unflattenEnv(
  envMap: Record<string, string>,
  separator: FlattenOptions['separator'] = '.'
): UnflattenResult {
  return unflattenEnvMap(envMap, separator);
}

export function printFlattenResult(result: FlattenResult): void {
  console.log(formatFlattenResult(result));
}

export function getFlattenedKeys(
  envMap: Record<string, string>,
  options: FlattenOptions = {}
): string[] {
  const result = flattenEnvMap(envMap, options);
  return result.keysAdded;
}

export function isFlattened(
  envMap: Record<string, string>,
  separator: FlattenOptions['separator'] = '.'
): boolean {
  return Object.keys(envMap).some((key) => key.includes(separator));
}

export function flattenCount(
  envMap: Record<string, string>,
  options: FlattenOptions = {}
): number {
  const result = flattenEnvMap(envMap, options);
  return result.keysAdded.length;
}

export type { FlattenOptions, FlattenResult, UnflattenResult, FlattenSeparator } from './types';
