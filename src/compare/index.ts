import { compareEnvMaps, formatCompareResult } from './envComparer';
import { CompareOptions, CompareResult } from './types';

export type { CompareOptions, CompareResult };

export function compareLayers(
  layerA: string,
  mapA: Record<string, string>,
  layerB: string,
  mapB: Record<string, string>,
  options?: CompareOptions
): CompareResult {
  return compareEnvMaps(layerA, mapA, layerB, mapB, options);
}

export function printCompareResult(
  result: CompareResult,
  maskSecrets = false
): void {
  const lines = formatCompareResult(result, maskSecrets);
  lines.forEach((line) => console.log(line));
}

export function isIdentical(
  mapA: Record<string, string>,
  mapB: Record<string, string>,
  options?: CompareOptions
): boolean {
  const result = compareEnvMaps('a', mapA, 'b', mapB, options);
  return result.identical;
}

export function getKeyDiff(
  mapA: Record<string, string>,
  mapB: Record<string, string>
): { onlyInA: string[]; onlyInB: string[]; inBoth: string[] } {
  const result = compareEnvMaps('a', mapA, 'b', mapB, { mode: 'keys' });
  return {
    onlyInA: result.onlyInA,
    onlyInB: result.onlyInB,
    inBoth: result.inBoth,
  };
}
