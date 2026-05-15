import { EnvMap } from "../merge/types";
import {
  addAlias,
  removeAlias,
  getAliasesForLayer,
  resolveAliases,
  applyAlias,
  clearAliases,
  AliasEntry,
  AliasResult,
} from "./envAliaser";

export function defineAlias(layer: string, alias: string, target: string): AliasEntry {
  return addAlias(layer, alias, target);
}

export function deleteAlias(layer: string, alias: string): boolean {
  return removeAlias(layer, alias);
}

export function getLayerAliases(layer: string): AliasEntry[] {
  return getAliasesForLayer(layer);
}

export function applyAliases(layer: string, envMap: EnvMap): EnvMap {
  return resolveAliases(layer, envMap);
}

export function resolveAlias(layer: string, alias: string, envMap: EnvMap): AliasResult {
  return applyAlias(layer, alias, envMap);
}

export function hasAlias(layer: string, alias: string): boolean {
  return getAliasesForLayer(layer).some(a => a.alias === alias);
}

export function resetAliases(): void {
  clearAliases();
}

export type { AliasEntry, AliasResult };
