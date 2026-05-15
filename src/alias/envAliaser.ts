import { EnvMap } from "../merge/types";

export interface AliasEntry {
  id: string;
  layer: string;
  alias: string;
  target: string;
  createdAt: string;
}

export interface AliasResult {
  alias: string;
  target: string;
  resolvedValue: string | undefined;
  applied: boolean;
}

const aliasStore: AliasEntry[] = [];

function generateAliasId(): string {
  return `alias_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function addAlias(layer: string, alias: string, target: string): AliasEntry {
  const existing = aliasStore.find(a => a.layer === layer && a.alias === alias);
  if (existing) {
    existing.target = target;
    return existing;
  }
  const entry: AliasEntry = {
    id: generateAliasId(),
    layer,
    alias,
    target,
    createdAt: new Date().toISOString(),
  };
  aliasStore.push(entry);
  return entry;
}

export function removeAlias(layer: string, alias: string): boolean {
  const idx = aliasStore.findIndex(a => a.layer === layer && a.alias === alias);
  if (idx === -1) return false;
  aliasStore.splice(idx, 1);
  return true;
}

export function getAliasesForLayer(layer: string): AliasEntry[] {
  return aliasStore.filter(a => a.layer === layer);
}

export function resolveAliases(layer: string, envMap: EnvMap): EnvMap {
  const aliases = getAliasesForLayer(layer);
  const result: EnvMap = { ...envMap };
  for (const { alias, target } of aliases) {
    if (target in envMap) {
      result[alias] = envMap[target];
    }
  }
  return result;
}

export function applyAlias(layer: string, alias: string, envMap: EnvMap): AliasResult {
  const entry = aliasStore.find(a => a.layer === layer && a.alias === alias);
  if (!entry) {
    return { alias, target: "", resolvedValue: undefined, applied: false };
  }
  const resolvedValue = envMap[entry.target];
  return {
    alias,
    target: entry.target,
    resolvedValue,
    applied: entry.target in envMap,
  };
}

export function clearAliases(): void {
  aliasStore.length = 0;
}
