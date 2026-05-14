import {
  createGroup,
  getGroup,
  listGroups,
  updateGroup,
  deleteGroup,
  extractGroup,
  resetGroups,
} from './envGrouper';
import { EnvGroup, GroupResult } from './types';

export function defineGroup(
  name: string,
  keys: string[],
  description?: string
): EnvGroup {
  return createGroup(name, keys, description);
}

export function removeGroup(name: string): boolean {
  return deleteGroup(name);
}

export function getGroupByName(name: string): EnvGroup | undefined {
  return getGroup(name);
}

export function getAllGroups(): EnvGroup[] {
  return listGroups();
}

export function addKeysToGroup(name: string, keys: string[]): EnvGroup {
  const group = getGroup(name);
  if (!group) throw new Error(`Group '${name}' not found`);
  const merged = [...new Set([...group.keys, ...keys])];
  return updateGroup(name, { keys: merged });
}

export function removeKeysFromGroup(name: string, keys: string[]): EnvGroup {
  const group = getGroup(name);
  if (!group) throw new Error(`Group '${name}' not found`);
  const filtered = group.keys.filter((k) => !keys.includes(k));
  return updateGroup(name, { keys: filtered });
}

export function extractGroupValues(
  name: string,
  envMap: Record<string, string>
): GroupResult {
  return extractGroup(name, envMap);
}

export function isGroupComplete(
  name: string,
  envMap: Record<string, string>
): boolean {
  const result = extractGroup(name, envMap);
  return result.missing.length === 0;
}

export { resetGroups };
