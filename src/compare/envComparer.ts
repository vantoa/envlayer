import { CompareOptions, CompareResult } from './types';

export function compareEnvMaps(
  layerA: string,
  mapA: Record<string, string>,
  layerB: string,
  mapB: Record<string, string>,
  options: CompareOptions = {}
): CompareResult {
  const { mode = 'full', ignoreCase = false } = options;

  const normalize = (v: string) => (ignoreCase ? v.toLowerCase() : v);

  const keysA = new Set(Object.keys(mapA));
  const keysB = new Set(Object.keys(mapB));

  const onlyInA = [...keysA].filter((k) => !keysB.has(k));
  const onlyInB = [...keysB].filter((k) => !keysA.has(k));
  const inBoth = [...keysA].filter((k) => keysB.has(k));

  const diffValues =
    mode === 'keys'
      ? []
      : inBoth
          .filter((k) => normalize(mapA[k]) !== normalize(mapB[k]))
          .map((k) => ({ key: k, valueA: mapA[k], valueB: mapB[k] }));

  const identical =
    onlyInA.length === 0 && onlyInB.length === 0 && diffValues.length === 0;

  return { layerA, layerB, onlyInA, onlyInB, inBoth, diffValues, identical };
}

export function formatCompareResult(
  result: CompareResult,
  maskSecrets = false
): string[] {
  const lines: string[] = [];
  const mask = (v: string) => (maskSecrets ? '****' : v);

  if (result.identical) {
    lines.push(`✓ Layers "${result.layerA}" and "${result.layerB}" are identical.`);
    return lines;
  }

  if (result.onlyInA.length > 0) {
    lines.push(`Only in ${result.layerA}:`);
    result.onlyInA.forEach((k) => lines.push(`  + ${k}`));
  }

  if (result.onlyInB.length > 0) {
    lines.push(`Only in ${result.layerB}:`);
    result.onlyInB.forEach((k) => lines.push(`  + ${k}`));
  }

  if (result.diffValues.length > 0) {
    lines.push('Value differences:');
    result.diffValues.forEach(({ key, valueA, valueB }) => {
      lines.push(`  ~ ${key}: "${mask(valueA)}" → "${mask(valueB)}"`);
    });
  }

  return lines;
}
