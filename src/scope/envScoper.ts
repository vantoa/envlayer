import { EnvMap } from '../merge/types';

export interface ScopeEntry {
  id: string;
  name: string;
  prefix: string;
  keys: string[];
  createdAt: Date;
}

const scopeStore: Map<string, ScopeEntry> = new Map();

export function generateScopeId(): string {
  return `scope_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createScope(name: string, prefix: string): ScopeEntry {
  const existing = [...scopeStore.values()].find(s => s.name === name);
  if (existing) throw new Error(`Scope '${name}' already exists`);

  const entry: ScopeEntry = {
    id: generateScopeId(),
    name,
    prefix: prefix.endsWith('_') ? prefix : `${prefix}_`,
    keys: [],
    createdAt: new Date(),
  };

  scopeStore.set(entry.id, entry);
  return entry;
}

export function extractScoped(envMap: EnvMap, prefix: string): EnvMap {
  const normalizedPrefix = prefix.endsWith('_') ? prefix : `${prefix}_`;
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(envMap)) {
    if (key.startsWith(normalizedPrefix)) {
      const stripped = key.slice(normalizedPrefix.length);
      result[stripped] = value;
    }
  }
  return result;
}

export function injectScoped(envMap: EnvMap, prefix: string): EnvMap {
  const normalizedPrefix = prefix.endsWith('_') ? prefix : `${prefix}_`;
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(envMap)) {
    result[`${normalizedPrefix}${key}`] = value;
  }
  return result;
}

export function listScopes(): ScopeEntry[] {
  return [...scopeStore.values()];
}

export function getScope(name: string): ScopeEntry | undefined {
  return [...scopeStore.values()].find(s => s.name === name);
}

export function deleteScope(name: string): boolean {
  const entry = getScope(name);
  if (!entry) return false;
  scopeStore.delete(entry.id);
  return true;
}

export function clearScopes(): void {
  scopeStore.clear();
}
