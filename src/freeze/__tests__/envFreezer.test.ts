import {
  freezeKeys,
  unfreezeKeys,
  getFreezeEntry,
  isFrozen,
  applyFreeze,
  clearFreezeStore,
} from '../envFreezer';
import { EnvMap } from '../../merge/types';

beforeEach(() => {
  clearFreezeStore();
});

describe('freezeKeys', () => {
  it('freezes existing keys in the env map', () => {
    const env: EnvMap = { API_URL: 'http://prod.example.com', DEBUG: 'false' };
    const result = freezeKeys('production', env, ['API_URL']);
    expect(result.frozen).toEqual(['API_URL']);
    expect(result.skipped).toEqual([]);
  });

  it('skips keys not present in the env map', () => {
    const env: EnvMap = { DEBUG: 'false' };
    const result = freezeKeys('production', env, ['API_URL']);
    expect(result.frozen).toEqual([]);
    expect(result.skipped).toEqual(['API_URL']);
  });

  it('skips already frozen keys', () => {
    const env: EnvMap = { API_URL: 'http://prod.example.com' };
    freezeKeys('production', env, ['API_URL']);
    const result = freezeKeys('production', env, ['API_URL']);
    expect(result.frozen).toEqual([]);
    expect(result.skipped).toEqual(['API_URL']);
  });

  it('stores a reason when provided', () => {
    const env: EnvMap = { API_URL: 'http://prod.example.com' };
    freezeKeys('production', env, ['API_URL'], 'immutable in prod');
    const entry = getFreezeEntry('production');
    expect(entry?.reason).toBe('immutable in prod');
  });
});

describe('unfreezeKeys', () => {
  it('removes frozen keys', () => {
    const env: EnvMap = { API_URL: 'http://prod.example.com', DEBUG: 'false' };
    freezeKeys('production', env, ['API_URL', 'DEBUG']);
    const removed = unfreezeKeys('production', ['API_URL']);
    expect(removed).toEqual(['API_URL']);
    expect(isFrozen('production', 'API_URL')).toBe(false);
    expect(isFrozen('production', 'DEBUG')).toBe(true);
  });

  it('cleans up the entry when all keys are unfrozen', () => {
    const env: EnvMap = { API_URL: 'http://prod.example.com' };
    freezeKeys('production', env, ['API_URL']);
    unfreezeKeys('production', ['API_URL']);
    expect(getFreezeEntry('production')).toBeUndefined();
  });

  it('returns empty array when layer has no freeze entry', () => {
    const removed = unfreezeKeys('staging', ['API_URL']);
    expect(removed).toEqual([]);
  });
});

describe('isFrozen', () => {
  it('returns true for frozen key', () => {
    const env: EnvMap = { SECRET: 'abc' };
    freezeKeys('prod', env, ['SECRET']);
    expect(isFrozen('prod', 'SECRET')).toBe(true);
  });

  it('returns false for unfrozen key', () => {
    expect(isFrozen('prod', 'MISSING')).toBe(false);
  });
});

describe('applyFreeze', () => {
  it('restores frozen key values from base', () => {
    const base: EnvMap = { API_URL: 'http://prod.example.com', DEBUG: 'false' };
    const env: EnvMap = { ...base };
    freezeKeys('production', env, ['API_URL']);
    const incoming: EnvMap = { API_URL: 'http://override.example.com', DEBUG: 'true' };
    const result = applyFreeze('production', incoming, base);
    expect(result['API_URL']).toBe('http://prod.example.com');
    expect(result['DEBUG']).toBe('true');
  });

  it('returns incoming unchanged when no freeze entry exists', () => {
    const base: EnvMap = { API_URL: 'http://prod.example.com' };
    const incoming: EnvMap = { API_URL: 'http://override.example.com' };
    const result = applyFreeze('staging', incoming, base);
    expect(result).toEqual(incoming);
  });
});
