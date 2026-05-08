export type CloneStrategy = 'full' | 'keys-only' | 'selective';

export interface CloneOptions {
  strategy: CloneStrategy;
  keys?: string[];
  overwrite?: boolean;
  maskSecrets?: boolean;
}

export interface CloneResult {
  source: string;
  target: string;
  strategy: CloneStrategy;
  keysCloned: string[];
  keysSkipped: string[];
  timestamp: Date;
}

export interface EnvMap {
  [key: string]: string;
}
