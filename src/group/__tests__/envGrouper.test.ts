import {
  defineGroup,
  removeGroup,
  getGroupByName,
  getAllGroups,
  addKeysToGroup,
  removeKeysFromGroup,
  extractGroupValues,
  isGroupComplete,
  resetGroups,
} from '../index';

beforeEach(() => {
  resetGroups();
});

describe('defineGroup', () => {
  it('creates a group with given keys', () => {
    const g = defineGroup('database', ['DB_HOST', 'DB_PORT', 'DB_NAME']);
    expect(g.name).toBe('database');
    expect(g.keys).toEqual(['DB_HOST', 'DB_PORT', 'DB_NAME']);
    expect(g.id).toMatch(/^grp_/);
  });

  it('deduplicates keys', () => {
    const g = defineGroup('auth', ['JWT_SECRET', 'JWT_SECRET', 'AUTH_URL']);
    expect(g.keys).toHaveLength(2);
  });

  it('throws if group name already exists', () => {
    defineGroup('cache', ['REDIS_URL']);
    expect(() => defineGroup('cache', ['REDIS_PORT'])).toThrow(
      "Group 'cache' already exists"
    );
  });
});

describe('getAllGroups / getGroupByName', () => {
  it('returns all defined groups', () => {
    defineGroup('g1', ['A']);
    defineGroup('g2', ['B']);
    expect(getAllGroups()).toHaveLength(2);
  });

  it('returns undefined for unknown group', () => {
    expect(getGroupByName('nope')).toBeUndefined();
  });
});

describe('addKeysToGroup / removeKeysFromGroup', () => {
  it('adds keys to existing group', () => {
    defineGroup('app', ['APP_PORT']);
    const updated = addKeysToGroup('app', ['APP_HOST', 'APP_PORT']);
    expect(updated.keys).toContain('APP_HOST');
    expect(updated.keys).toHaveLength(2);
  });

  it('removes keys from group', () => {
    defineGroup('app', ['APP_PORT', 'APP_HOST', 'APP_ENV']);
    const updated = removeKeysFromGroup('app', ['APP_HOST']);
    expect(updated.keys).not.toContain('APP_HOST');
    expect(updated.keys).toHaveLength(2);
  });
});

describe('removeGroup', () => {
  it('removes an existing group', () => {
    defineGroup('temp', ['X']);
    expect(removeGroup('temp')).toBe(true);
    expect(getGroupByName('temp')).toBeUndefined();
  });

  it('returns false for unknown group', () => {
    expect(removeGroup('ghost')).toBe(false);
  });
});

describe('extractGroupValues', () => {
  it('returns matched and missing keys', () => {
    defineGroup('db', ['DB_HOST', 'DB_PORT', 'DB_PASS']);
    const env = { DB_HOST: 'localhost', DB_PORT: '5432' };
    const result = extractGroupValues('db', env);
    expect(result.matched).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result.missing).toEqual(['DB_PASS']);
  });
});

describe('isGroupComplete', () => {
  it('returns true when all keys are present', () => {
    defineGroup('full', ['A', 'B']);
    expect(isGroupComplete('full', { A: '1', B: '2' })).toBe(true);
  });

  it('returns false when keys are missing', () => {
    defineGroup('partial', ['A', 'B']);
    expect(isGroupComplete('partial', { A: '1' })).toBe(false);
  });
});
