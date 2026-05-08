import { cloneEnvMap, mergeClone, formatCloneResult } from '../envCloner';
import { CloneOptions } from '../types';

const sampleEnv = {
  APP_NAME: 'myapp',
  DB_HOST: 'localhost',
  DB_PASSWORD: 'supersecretpassword123',
  PORT: '3000',
  DEBUG: 'true',
};

describe('cloneEnvMap', () => {
  it('clones all keys with full strategy', () => {
    const opts: CloneOptions = { strategy: 'full' };
    const { result, cloned } = cloneEnvMap(sampleEnv, 'dev', 'staging', opts);
    expect(result.keysCloned).toHaveLength(5);
    expect(result.keysSkipped).toHaveLength(0);
    expect(cloned).toEqual(sampleEnv);
  });

  it('clones only key names with keys-only strategy', () => {
    const opts: CloneOptions = { strategy: 'keys-only' };
    const { cloned } = cloneEnvMap(sampleEnv, 'dev', 'staging', opts);
    expect(Object.keys(cloned)).toEqual(Object.keys(sampleEnv));
    expect(Object.values(cloned).every((v) => v === '')).toBe(true);
  });

  it('clones selected keys with selective strategy', () => {
    const opts: CloneOptions = { strategy: 'selective', keys: ['APP_NAME', 'PORT'] };
    const { result, cloned } = cloneEnvMap(sampleEnv, 'dev', 'staging', opts);
    expect(result.keysCloned).toEqual(['APP_NAME', 'PORT']);
    expect(result.keysSkipped).toHaveLength(3);
    expect(cloned).toEqual({ APP_NAME: 'myapp', PORT: '3000' });
  });

  it('masks secret values when maskSecrets is true', () => {
    const opts: CloneOptions = { strategy: 'full', maskSecrets: true };
    const { cloned } = cloneEnvMap(sampleEnv, 'dev', 'staging', opts);
    expect(cloned['DB_PASSWORD']).not.toBe('supersecretpassword123');
    expect(cloned['APP_NAME']).toBe('myapp');
  });

  it('returns correct metadata in result', () => {
    const opts: CloneOptions = { strategy: 'full' };
    const { result } = cloneEnvMap(sampleEnv, 'dev', 'prod', opts);
    expect(result.source).toBe('dev');
    expect(result.target).toBe('prod');
    expect(result.strategy).toBe('full');
    expect(result.timestamp).toBeInstanceOf(Date);
  });
});

describe('mergeClone', () => {
  it('merges cloned keys into target', () => {
    const target = { EXISTING: 'value' };
    const cloned = { NEW_KEY: 'new' };
    const merged = mergeClone(target, cloned, true);
    expect(merged).toEqual({ EXISTING: 'value', NEW_KEY: 'new' });
  });

  it('does not overwrite existing keys when overwrite is false', () => {
    const target = { APP_NAME: 'original' };
    const cloned = { APP_NAME: 'cloned' };
    const merged = mergeClone(target, cloned, false);
    expect(merged['APP_NAME']).toBe('original');
  });

  it('overwrites existing keys when overwrite is true', () => {
    const target = { APP_NAME: 'original' };
    const cloned = { APP_NAME: 'cloned' };
    const merged = mergeClone(target, cloned, true);
    expect(merged['APP_NAME']).toBe('cloned');
  });
});

describe('formatCloneResult', () => {
  it('formats result as readable string', () => {
    const opts: CloneOptions = { strategy: 'selective', keys: ['PORT'] };
    const { result } = cloneEnvMap(sampleEnv, 'dev', 'staging', opts);
    const formatted = formatCloneResult(result);
    expect(formatted).toContain('dev');
    expect(formatted).toContain('staging');
    expect(formatted).toContain('selective');
    expect(formatted).toContain('Cloned: 1');
  });
});
