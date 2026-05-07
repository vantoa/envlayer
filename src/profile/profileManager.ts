import { EnvProfile, ProfileMap, ProfileManagerState, ProfileName } from './types';

let state: ProfileManagerState = {
  profiles: {},
  activeProfile: null,
};

export function createProfile(
  name: ProfileName,
  layers: string[],
  description?: string,
  baseDir?: string
): EnvProfile {
  const now = new Date().toISOString();
  const profile: EnvProfile = {
    name,
    description,
    layers,
    baseDir,
    createdAt: now,
    updatedAt: now,
  };
  state.profiles[name] = profile;
  return profile;
}

export function getProfile(name: ProfileName): EnvProfile | undefined {
  return state.profiles[name];
}

export function listProfiles(): EnvProfile[] {
  return Object.values(state.profiles);
}

export function updateProfile(
  name: ProfileName,
  updates: Partial<Pick<EnvProfile, 'layers' | 'description' | 'baseDir'>>
): EnvProfile | null {
  const profile = state.profiles[name];
  if (!profile) return null;
  const updated: EnvProfile = {
    ...profile,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  state.profiles[name] = updated;
  return updated;
}

export function deleteProfile(name: ProfileName): boolean {
  if (!state.profiles[name]) return false;
  delete state.profiles[name];
  if (state.activeProfile === name) state.activeProfile = null;
  return true;
}

export function setActiveProfile(name: ProfileName | null): void {
  if (name !== null && !state.profiles[name]) {
    throw new Error(`Profile "${name}" does not exist`);
  }
  state.activeProfile = name;
}

export function getActiveProfile(): EnvProfile | null {
  if (!state.activeProfile) return null;
  return state.profiles[state.activeProfile] ?? null;
}

export function resetProfileState(): void {
  state = { profiles: {}, activeProfile: null };
}

export function importProfiles(profiles: ProfileMap): void {
  state.profiles = { ...state.profiles, ...profiles };
}

export function exportProfiles(): ProfileMap {
  return { ...state.profiles };
}
