export type EncryptionAlgorithm = 'aes-256-gcm' | 'aes-128-gcm';

export interface EncryptionOptions {
  algorithm?: EncryptionAlgorithm;
  encoding?: BufferEncoding;
}

export interface EncryptedValue {
  ciphertext: string;
  iv: string;
  tag: string;
  algorithm: EncryptionAlgorithm;
}

export interface EncryptedEnvMap {
  [key: string]: EncryptedValue | string;
}

export interface EncryptionResult {
  key: string;
  encrypted: EncryptedEnvMap;
}
