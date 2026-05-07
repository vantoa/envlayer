import {
  createProfile,
  deleteProfile,
  exportProfiles,
  getActiveProfile,
  getProfile,
  importProfiles,
  listProfiles,
  resetProfileState,
  setActiveProfile,
  updateProfile,
} from './profileManager';
import { EnvProfile, ProfileMap, ProfileName } from './types';

export function addProfile(
  name: ProfileName,
  layers: string[],
  options?: { description?: string; baseDir?: string }
): EnvProfile {
  return createProfile(name, layers, options?.description, options?.baseDir);
}

export function removeProfile(name: ProfileName): boolean {
  return deleteProfile(name);
}

export function activateProfile(name: ProfileName): EnvProfile {
  setActiveProfile(name);
  const profile = getProfile(name);
  if (!profile) throw new Error(`Profile "${name}" not found after activation`);
  return profile;
}

export function deactivateProfile(): void {
  setActiveProfile(null);
}

export function currentProfile(): EnvProfile | null {
  return getActiveProfile();
}

export {
  exportProfiles,
  getProfile,
  importProfiles,
  listProfiles,
  resetProfileState,
  updateProfile,
};

export type { EnvProfile, ProfileMap, ProfileName };
