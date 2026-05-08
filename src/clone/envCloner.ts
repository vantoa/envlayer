import { CloneOptions, CloneResult, EnvMap } from './types';
import { detectSecret, maskValue } from '../secrets/secretMasker';

export function cloneEnvMap(
  source: EnvMap,
  sourceLabel: string,
  targetLabel: string,
  options: CloneOptions
): { result: CloneResult; cloned: EnvMap } {
  const { strategy, keys, overwrite = true, maskSecrets = false } = options;

  const keysCloned: string[] = [];
  const keysSkipped: string[] = [];
  const cloned: EnvMap = {};

  const sourceKeys = Object.keys(source);

  const candidateKeys =
    strategy === 'selective' && keys && keys.length > 0
      ? sourceKeys.filter((k) => keys.includes(k))
      : sourceKeys;

  for (const key of sourceKeys) {
    if (!candidateKeys.includes(key)) {
      keysSkipped.push(key);
      continue;
    }

    if (strategy === 'keys-only') {
      cloned[key] = '';
      keysCloned.push(key);
      continue;
    }

    const value = source[key];
    const shouldMask = maskSecrets && detectSecret(key, value);
    cloned[key] = shouldMask ? maskValue(value) : value;
    keysCloned.push(key);
  }

  const result: CloneResult = {
    source: sourceLabel,
    target: targetLabel,
    strategy,
    keysCloned,
    keysSkipped,
    timestamp: new Date(),
  };

  return { result, cloned };
}

export function mergeClone(
  target: EnvMap,
  cloned: EnvMap,
  overwrite: boolean
): EnvMap {
  const merged: EnvMap = { ...target };
  for (const [key, value] of Object.entries(cloned)) {
    if (!overwrite && key in merged) continue;
    merged[key] = value;
  }
  return merged;
}

export function formatCloneResult(result: CloneResult): string {
  const lines: string[] = [
    `Clone: ${result.source} → ${result.target}`,
    `Strategy: ${result.strategy}`,
    `Cloned: ${result.keysCloned.length} key(s)`,
    `Skipped: ${result.keysSkipped.length} key(s)`,
    `Timestamp: ${result.timestamp.toISOString()}`,
  ];
  if (result.keysSkipped.length > 0) {
    lines.push(`Skipped keys: ${result.keysSkipped.join(', ')}`);
  }
  return lines.join('\n');
}
