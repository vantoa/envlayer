import {
  defineScope,
  extractScope,
  injectScope,
  getScopes,
  findScope,
  removeScope,
  resetScopes,
  scopeKeys,
  hasScopedKeys,
} from '../index';

beforeEach(() => {
  resetScopes();
});

describe('defineScope', () => {
  it('creates a new scope with normalized prefix', () => {
    const scope = defineScope('database', 'DB');
    expect(scope.name).toBe('database');
    expect(scope.prefix).toBe('DB_');
    expect(scope.id).toMatch(/^scope_/);
  });

  it('does not double-add underscore if prefix already ends with _', () => {
    const scope = defineScope('cache', 'CACHE_');
    expect(scope.prefix).toBe('CACHE_');
  });

  it('throws if scope name already exists', () => {
    defineScope('auth', 'AUTH');
    expect(() => defineScope('auth', 'AUTH2')).toThrow("Scope 'auth' already exists");
  });
});

describe('extractScope', () => {
  it('extracts keys matching the prefix and strips it', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp' };
    const result = extractScope(env, 'DB');
    expect(result).toEqual({ HOST: 'localhost', PORT: '5432' });
  });

  it('returns empty map if no keys match', () => {
    const env = { APP_NAME: 'myapp' };
    expect(extractScope(env, 'DB')).toEqual({});
  });
});

describe('injectScope', () => {
  it('prefixes all keys with the given scope prefix', () => {
    const env = { HOST: 'localhost', PORT: '5432' };
    const result = injectScope(env, 'DB');
    expect(result).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('handles prefix already ending with underscore', () => {
    const env = { USER: 'admin' };
    const result = injectScope(env, 'REDIS_');
    expect(result).toEqual({ REDIS_USER: 'admin' });
  });
});

describe('getScopes / findScope / removeScope', () => {
  it('lists all defined scopes', () => {
    defineScope('s1', 'S1');
    defineScope('s2', 'S2');
    expect(getScopes()).toHaveLength(2);
  });

  it('finds a scope by name', () => {
    defineScope('redis', 'REDIS');
    const found = findScope('redis');
    expect(found?.name).toBe('redis');
  });

  it('returns undefined for unknown scope', () => {
    expect(findScope('unknown')).toBeUndefined();
  });

  it('removes an existing scope', () => {
    defineScope('temp', 'TEMP');
    expect(removeScope('temp')).toBe(true);
    expect(findScope('temp')).toBeUndefined();
  });

  it('returns false when removing non-existent scope', () => {
    expect(removeScope('ghost')).toBe(false);
  });
});

describe('scopeKeys / hasScopedKeys', () => {
  it('returns keys matching a prefix', () => {
    const env = { DB_HOST: 'x', DB_PORT: 'y', OTHER: 'z' };
    expect(scopeKeys(env, 'DB')).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('hasScopedKeys returns true when matching keys exist', () => {
    const env = { DB_HOST: 'x' };
    expect(hasScopedKeys(env, 'DB')).toBe(true);
  });

  it('hasScopedKeys returns false when no matching keys', () => {
    const env = { APP_NAME: 'test' };
    expect(hasScopedKeys(env, 'DB')).toBe(false);
  });
});
