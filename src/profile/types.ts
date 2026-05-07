export type ProfileName = string;

export interface EnvProfile {
  name: ProfileName;
  description?: string;
  layers: string[];
  baseDir?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileMap {
  [name: ProfileName]: EnvProfile;
}

export interface ProfileLoadResult {
  profile: EnvProfile;
  resolvedLayers: string[];
}

export interface ProfileManagerState {
  profiles: ProfileMap;
  activeProfile: ProfileName | null;
}
