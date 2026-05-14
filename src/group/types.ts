export interface EnvGroup {
  id: string;
  name: string;
  keys: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupResult {
  group: EnvGroup;
  matched: Record<string, string>;
  missing: string[];
}

export interface GroupStore {
  groups: EnvGroup[];
}

export type GroupMap = Record<string, EnvGroup>;
