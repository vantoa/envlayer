import { EnvMap } from '../merge/types';
import {
  createScope,
  extractScoped,
  injectScoped,
  listScopes,
  getScope,
  deleteScope,
  clearScopes,
  ScopeEntry,
} from './envScoper';

export function defineScope(name: string, prefix: string): ScopeEntry {
  return createScope(name, prefix);
}

export function extractScope(envMap: EnvMap, prefix: string): EnvMap {
  return extractScoped(envMap, prefix);
}

export function injectScope(envMap: EnvMap, prefix: string): EnvMap {
  return injectScoped(envMap, prefix);
}

export function getScopes(): ScopeEntry[] {
  return listScopes();
}

export function findScope(name: string): ScopeEntry | undefined {
  return getScope(name);
}

export function removeScope(name: string): boolean {
  return deleteScope(name);
}

export function resetScopes(): void {
  clearScopes();
}

export function scopeKeys(envMap: EnvMap, prefix: string): string[] {
  const normalizedPrefix = prefix.endsWith('_') ? prefix : `${prefix}_`;
  return Object.keys(envMap).filter(k => k.startsWith(normalizedPrefix));
}

export function hasScopedKeys(envMap: EnvMap, prefix: string): boolean {
  return scopeKeys(envMap, prefix).length > 0;
}
