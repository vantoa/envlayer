import {
  transformEnv,
  transformEnvFull,
  applyBuiltin,
  changedKeys,
} from '../index';

const env = { APP_NAME: '  myapp  ', DB_HOST: 'localhost', DB_PORT: '5432' };

describe('transformEnv', () => {
  it('returns transformed map', () => {
    const result = transformEnv(env, [{ fn: (v) => v.trim() }]);
    expect(result.APP_NAME).toBe('myapp');
  });

  it('does not mutate original', () => {
    transformEnv(env, [{ fn: (v) => v.toUpperCase() }]);
    expect(env.APP_NAME).toBe('  myapp  ');
  });
});

describe('transformEnvFull', () => {
  it('returns full result with changes', () => {
    const result = transformEnvFull(env, [{ fn: (v) => v.trim() }]);
    expect(result.changes.length).toBeGreaterThan(0);
    expect(result.original).toEqual(env);
  });
});

describe('applyBuiltin', () => {
  it('applies uppercase to all keys', () => {
    const result = applyBuiltin({ key: 'value' }, 'uppercase');
    expect(result.key).toBe('VALUE');
  });

  it('applies trim only to filtered key', () => {
    const result = applyBuiltin(env, 'trim', 'APP_NAME');
    expect(result.APP_NAME).toBe('myapp');
    expect(result.DB_HOST).toBe('localhost');
  });

  it('applies regex filter', () => {
    const result = applyBuiltin(env, 'uppercase', /^DB_/);
    expect(result.DB_HOST).toBe('LOCALHOST');
    expect(result.APP_NAME).toBe('  myapp  ');
  });
});

describe('changedKeys', () => {
  it('returns list of keys that changed', () => {
    const result = transformEnvFull({ A: 'hello', B: 'WORLD' }, [
      { fn: (v) => v.toUpperCase() },
    ]);
    const keys = changedKeys(result);
    expect(keys).toContain('A');
    expect(keys).not.toContain('B');
  });
});
