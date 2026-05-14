import { EnvGroup, GroupResult, GroupStore } from './types';

let store: GroupStore = { groups: [] };

export function generateGroupId(): string {
  return `grp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createGroup(
  name: string,
  keys: string[],
  description?: string
): EnvGroup {
  const existing = store.groups.find((g) => g.name === name);
  if (existing) {
    throw new Error(`Group '${name}' already exists`);
  }
  const now = new Date().toISOString();
  const group: EnvGroup = {
    id: generateGroupId(),
    name,
    keys: [...new Set(keys)],
    description,
    createdAt: now,
    updatedAt: now,
  };
  store.groups.push(group);
  return group;
}

export function getGroup(name: string): EnvGroup | undefined {
  return store.groups.find((g) => g.name === name);
}

export function listGroups(): EnvGroup[] {
  return [...store.groups];
}

export function updateGroup(
  name: string,
  updates: Partial<Pick<EnvGroup, 'keys' | 'description'>>
): EnvGroup {
  const group = store.groups.find((g) => g.name === name);
  if (!group) throw new Error(`Group '${name}' not found`);
  if (updates.keys !== undefined) group.keys = [...new Set(updates.keys)];
  if (updates.description !== undefined) group.description = updates.description;
  group.updatedAt = new Date().toISOString();
  return group;
}

export function deleteGroup(name: string): boolean {
  const idx = store.groups.findIndex((g) => g.name === name);
  if (idx === -1) return false;
  store.groups.splice(idx, 1);
  return true;
}

export function extractGroup(
  name: string,
  envMap: Record<string, string>
): GroupResult {
  const group = getGroup(name);
  if (!group) throw new Error(`Group '${name}' not found`);
  const matched: Record<string, string> = {};
  const missing: string[] = [];
  for (const key of group.keys) {
    if (key in envMap) {
      matched[key] = envMap[key];
    } else {
      missing.push(key);
    }
  }
  return { group, matched, missing };
}

export function resetGroups(): void {
  store = { groups: [] };
}
