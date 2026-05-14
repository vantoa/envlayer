import { flattenEnvMap, unflattenEnvMap, formatFlattenResult } from '../envFlattener';

describe('flattenEnvMap', () => {
  it('returns original map when no prefix and default separator', () => {
    const input = { HOST: 'localhost', PORT: '5432' };
    const result = flattenEnvMap(input);
    expect(result.original).toEqual(input);
    expect(result.separator).toBe('.');
  });

  it('adds prefix to all keys', () => {
    const input = { HOST: 'localhost', PORT: '5432' };
    const result = flattenEnvMap(input, { prefix: 'DB', separator: '_' });
    expect(result.flattened).toHaveProperty('DB_HOST', 'localhost');
    expect(result.flattened).toHaveProperty('DB_PORT', '5432');
    expect(result.keysAdded).toContain('DB_HOST');
    expect(result.keysRemoved).toContain('HOST');
  });

  it('respects maxDepth option', () => {
    const input = { 'A.B.C': 'deep', 'A.B': 'mid' };
    const result = flattenEnvMap(input, { maxDepth: 1 });
    expect(result.flattened).toBeDefined();
  });

  it('handles empty map', () => {
    const result = flattenEnvMap({});
    expect(result.flattened).toEqual({});
    expect(result.keysAdded).toHaveLength(0);
    expect(result.keysRemoved).toHaveLength(0);
  });

  it('uses custom separator in prefix join', () => {
    const input = { NAME: 'myapp' };
    const result = flattenEnvMap(input, { prefix: 'APP', separator: '__' });
    expect(result.flattened).toHaveProperty('APP__NAME', 'myapp');
  });
});

describe('unflattenEnvMap', () => {
  it('groups keys by separator prefix', () => {
    const input = { 'DB.HOST': 'localhost', 'DB.PORT': '5432', 'APP.NAME': 'test' };
    const result = unflattenEnvMap(input, '.');
    expect(result.keysProcessed).toBe(3);
    expect(result.unflattened).toBeDefined();
  });

  it('leaves non-separated keys unchanged', () => {
    const input = { HOST: 'localhost', PORT: '5432' };
    const result = unflattenEnvMap(input, '.');
    expect(result.unflattened).toEqual(input);
  });

  it('handles empty input', () => {
    const result = unflattenEnvMap({}, '.');
    expect(result.keysProcessed).toBe(0);
    expect(result.unflattened).toEqual({});
  });

  it('uses double-underscore separator', () => {
    const input = { 'DB__HOST': 'localhost' };
    const result = unflattenEnvMap(input, '__');
    expect(result.separator).toBe('__');
    expect(result.keysProcessed).toBe(1);
  });
});

describe('formatFlattenResult', () => {
  it('returns a non-empty string', () => {
    const result = flattenEnvMap({ HOST: 'localhost' }, { prefix: 'DB' });
    const formatted = formatFlattenResult(result);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('includes added/removed counts', () => {
    const result = flattenEnvMap({ HOST: 'localhost', PORT: '5432' }, { prefix: 'SVC' });
    const formatted = formatFlattenResult(result);
    expect(formatted).toMatch(/added|keys/i);
  });
});
