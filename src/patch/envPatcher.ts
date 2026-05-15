import { EnvMap } from '../merge/types';

export interface PatchOperation {
  op: 'set' | 'unset' | 'rename' | 'default';
  key: string;
  value?: string;
  newKey?: string;
}

export interface PatchResult {
  original: EnvMap;
  patched: EnvMap;
  applied: PatchOperation[];
  skipped: PatchOperation[];
}

export function applyPatch(
  envMap: EnvMap,
  operations: PatchOperation[]
): PatchResult {
  const patched: EnvMap = { ...envMap };
  const applied: PatchOperation[] = [];
  const skipped: PatchOperation[] = [];

  for (const op of operations) {
    switch (op.op) {
      case 'set': {
        if (op.value === undefined) { skipped.push(op); break; }
        patched[op.key] = op.value;
        applied.push(op);
        break;
      }
      case 'unset': {
        if (!(op.key in patched)) { skipped.push(op); break; }
        delete patched[op.key];
        applied.push(op);
        break;
      }
      case 'rename': {
        if (!op.newKey || !(op.key in patched)) { skipped.push(op); break; }
        patched[op.newKey] = patched[op.key];
        delete patched[op.key];
        applied.push(op);
        break;
      }
      case 'default': {
        if (op.value === undefined) { skipped.push(op); break; }
        if (!(op.key in patched)) {
          patched[op.key] = op.value;
          applied.push(op);
        } else {
          skipped.push(op);
        }
        break;
      }
      default:
        skipped.push(op);
    }
  }

  return { original: envMap, patched, applied, skipped };
}

export function formatPatchResult(result: PatchResult): string {
  const lines: string[] = [];
  lines.push(`Patch applied: ${result.applied.length} operation(s), ${result.skipped.length} skipped.`);
  for (const op of result.applied) {
    if (op.op === 'set') lines.push(`  [set]    ${op.key} = ${op.value}`);
    else if (op.op === 'unset') lines.push(`  [unset]  ${op.key}`);
    else if (op.op === 'rename') lines.push(`  [rename] ${op.key} -> ${op.newKey}`);
    else if (op.op === 'default') lines.push(`  [default] ${op.key} = ${op.value}`);
  }
  if (result.skipped.length > 0) {
    lines.push('Skipped:');
    for (const op of result.skipped) {
      lines.push(`  [${op.op}] ${op.key}`);
    }
  }
  return lines.join('\n');
}
