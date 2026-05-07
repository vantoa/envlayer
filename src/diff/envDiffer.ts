import { EnvDiffEntry, EnvDiffResult, DiffOptions, ChangeKind } from './types';
import { maskValue, detectSecret } from '../secrets/secretMasker';

function maybeМask(key: string, value: string, mask: boolean): string {
  if (mask && detectSecret(key, value)) {
    return maskValue(value);
  }
  return value;
}

export function diffEnvMaps(
  base: Record<string, string>,
  target: Record<string, string>,
  options: DiffOptions = {}
): EnvDiffResult {
  const { includeUnchanged = false, maskSecrets = false } = options;
  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);
  const entries: EnvDiffEntry[] = [];

  for (const key of allKeys) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inTarget = Object.prototype.hasOwnProperty.call(target, key);

    let kind: ChangeKind;
    let oldValue: string | undefined;
    let newValue: string | undefined;

    if (inBase && !inTarget) {
      kind = 'removed';
      oldValue = maybeМask(key, base[key], maskSecrets);
    } else if (!inBase && inTarget) {
      kind = 'added';
      newValue = maybeМask(key, target[key], maskSecrets);
    } else if (base[key] !== target[key]) {
      kind = 'modified';
      oldValue = maybeМask(key, base[key], maskSecrets);
      newValue = maybeМask(key, target[key], maskSecrets);
    } else {
      kind = 'unchanged';
      if (!includeUnchanged) continue;
      oldValue = maybeМask(key, base[key], maskSecrets);
      newValue = oldValue;
    }

    entries.push({ key, kind, oldValue, newValue });
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    entries,
    added: entries.filter((e) => e.kind === 'added'),
    removed: entries.filter((e) => e.kind === 'removed'),
    modified: entries.filter((e) => e.kind === 'modified'),
    unchanged: entries.filter((e) => e.kind === 'unchanged'),
    hasChanges: entries.some((e) => e.kind !== 'unchanged'),
  };
}

export function formatDiff(result: EnvDiffResult): string {
  const lines: string[] = [];
  for (const entry of result.entries) {
    switch (entry.kind) {
      case 'added':
        lines.push(`+ ${entry.key}=${entry.newValue}`);
        break;
      case 'removed':
        lines.push(`- ${entry.key}=${entry.oldValue}`);
        break;
      case 'modified':
        lines.push(`~ ${entry.key}: ${entry.oldValue} → ${entry.newValue}`);
        break;
      case 'unchanged':
        lines.push(`  ${entry.key}=${entry.oldValue}`);
        break;
    }
  }
  return lines.join('\n');
}
