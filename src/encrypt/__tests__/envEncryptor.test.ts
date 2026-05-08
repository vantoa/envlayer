import {
  generateKey,
  encryptValue,
  decryptValue,
  encryptEnvMap,
  decryptEnvMap,
} from '../envEncryptor';
import { encryptEnv, decryptEnv, listEncryptedKeys, isEncryptedValue } from '../index';

describe('generateKey', () => {
  it('generates a 64-char hex key for aes-256-gcm', () => {
    const key = generateKey('aes-256-gcm');
    expect(key).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(key)).toBe(true);
  });

  it('generates a 32-char hex key for aes-128-gcm', () => {
    const key = generateKey('aes-128-gcm');
    expect(key).toHaveLength(32);
  });

  it('generates unique keys each call', () => {
    expect(generateKey()).not.toBe(generateKey());
  });
});

describe('encryptValue / decryptValue', () => {
  const key = generateKey();

  it('encrypts and decrypts a value correctly', () => {
    const original = 'super-secret-password';
    const encrypted = encryptValue(original, key);
    expect(encrypted.ciphertext).not.toBe(original);
    expect(decryptValue(encrypted, key)).toBe(original);
  });

  it('produces different ciphertext for same input (random IV)', () => {
    const enc1 = encryptValue('hello', key);
    const enc2 = encryptValue('hello', key);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });

  it('throws on wrong key', () => {
    const encrypted = encryptValue('secret', key);
    const wrongKey = generateKey();
    expect(() => decryptValue(encrypted, wrongKey)).toThrow();
  });
});

describe('encryptEnvMap / decryptEnvMap', () => {
  const key = generateKey();
  const envMap = { DB_PASS: 'hunter2', API_KEY: 'abc123', NODE_ENV: 'production' };
  const sensitiveKeys = ['DB_PASS', 'API_KEY'];

  it('encrypts only sensitive keys', () => {
    const result = encryptEnvMap(envMap, key, sensitiveKeys);
    expect(isEncryptedValue(result['DB_PASS'])).toBe(true);
    expect(isEncryptedValue(result['API_KEY'])).toBe(true);
    expect(result['NODE_ENV']).toBe('production');
  });

  it('round-trips correctly', () => {
    const encrypted = encryptEnvMap(envMap, key, sensitiveKeys);
    const decrypted = decryptEnvMap(encrypted, key);
    expect(decrypted).toEqual(envMap);
  });
});

describe('encryptEnv / decryptEnv / listEncryptedKeys', () => {
  const envMap = { SECRET: 'mypassword', PUBLIC: 'hello' };

  it('generates a key and encrypts', () => {
    const { key, encrypted } = encryptEnv(envMap, ['SECRET']);
    expect(key).toBeTruthy();
    expect(isEncryptedValue(encrypted['SECRET'])).toBe(true);
    expect(encrypted['PUBLIC']).toBe('hello');
  });

  it('uses provided key', () => {
    const existingKey = generateKey();
    const { key } = encryptEnv(envMap, ['SECRET'], existingKey);
    expect(key).toBe(existingKey);
  });

  it('lists encrypted keys', () => {
    const { encrypted } = encryptEnv(envMap, ['SECRET']);
    expect(listEncryptedKeys(encrypted)).toEqual(['SECRET']);
  });

  it('decrypts back to original map', () => {
    const { key, encrypted } = encryptEnv(envMap, ['SECRET']);
    expect(decryptEnv(encrypted, key)).toEqual(envMap);
  });
});
