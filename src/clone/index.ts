import { CloneOptions, CloneResult, EnvMap } from './types';
import { cloneEnvMap, mergeClone, formatCloneResult } from './envCloner';

export function cloneLayer(
  source: EnvMap,
  sourceLabel: string,
  targetLabel: string,
  options: Partial<CloneOptions> = {}
): { merged: EnvMap; result: CloneResult } {
  const opts: CloneOptions = {
    strategy: options.strategy ?? 'full',
    keys: options.keys,
    overwrite: options.overwrite ?? true,
    maskSecrets: options.maskSecrets ?? false,
  };

  const { result, cloned } = cloneEnvMap(source, sourceLabel, targetLabel, opts);
  const merged = mergeClone({}, cloned, opts.overwrite ?? true);

  return { merged, result };
}

export function cloneInto(
  source: EnvMap,
  target: EnvMap,
  sourceLabel: string,
  targetLabel: string,
  options: Partial<CloneOptions> = {}
): { merged: EnvMap; result: CloneResult } {
  const opts: CloneOptions = {
    strategy: options.strategy ?? 'full',
    keys: options.keys,
    overwrite: options.overwrite ?? true,
    maskSecrets: options.maskSecrets ?? false,
  };

  const { result, cloned } = cloneEnvMap(source, sourceLabel, targetLabel, opts);
  const merged = mergeClone(target, cloned, opts.overwrite ?? true);

  return { merged, result };
}

export function printCloneResult(result: CloneResult): void {
  console.log(formatCloneResult(result));
}

export type { CloneOptions, CloneResult, EnvMap };
