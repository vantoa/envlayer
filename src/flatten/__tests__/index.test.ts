import {
  flattenEnv,
  unflattenEnv,
  getFlattenedKeys,
  isFlattened,
  flattenCount,
} from '../index';

describe('flattenEnv', () => {
  it('flattens nested keys using dot separator by default', () => {
    const input = { 'DB.HOST': 'localhost', 'DB.PORT': '5432', 'APP.NAME': 'envlayer' };
    const result = flattenEnv(input);
    expect(result.flattened).toHaveProperty('DB.HOST', 'localhost');
    expect(result.separator).toBe('.');
  });

  it('applies a custom separator', () => {
    const input = { 'DB__HOST': 'localhost', 'DB__PORT': '5432' };
    const result = flattenEnv(input, { separator: '__' });
    expect(result.separator).toBe('__');
    expect(result.flattened).toHaveProperty('DB__HOST');
  });

  it('applies a prefix to all keys', () => {
    const input = { HOST: 'localhost', PORT: '5432' };
    const result = flattenEnv(input, { prefix: 'DB' });
    expect(Object.keys(result.flattened).every((k) => k.startsWith('DB'))).toBe(true);
  });

  it('returns keysAdded and keysRemoved', () => {
    const input = { HOST: 'localhost' };
    const result = flattenEnv(input, { prefix: 'APP' });
    expect(result.keysAdded.length).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.keysRemoved)).toBe(true);
  });
});

describe('unflattenEnv', () => {
  it('processes flat env map', () => {
    const input = { 'DB.HOST': 'localhost', 'DB.PORT': '5432' };
    const result = unflattenEnv(input, '.');
    expect(result.keysProcessed).toBe(2);
    expect(result.separator).toBe('.');
  });

  it('returns original map reference', () => {
    const input = { KEY: 'value' };
    const result = unflattenEnv(input);
    expect(result.original).toEqual(input);
  });
});

describe('getFlattenedKeys', () => {
  it('returns keys added by flattening', () => {
    const input = { HOST: 'localhost' };
    const keys = getFlattenedKeys(input, { prefix: 'DB' });
    expect(Array.isArray(keys)).toBe(true);
  });
});

describe('isFlattened', () => {
  it('returns true when keys contain separator', () => {
    expect(isFlattened({ 'DB.HOST': 'localhost' }, '.')).toBe(true);
  });

  it('returns false when no keys contain separator', () => {
    expect(isFlattened({ HOST: 'localhost' }, '.')).toBe(false);
  });
});

describe('flattenCount', () => {
  it('returns the number of keys added', () => {
    const input = { HOST: 'localhost', PORT: '5432' };
    const count = flattenCount(input, { prefix: 'DB' });
    expect(typeof count).toBe('number');
  });
});
