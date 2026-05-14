import {
  flattenEnvMap,
  unflattenEnvMap,
  formatFlattenResult,
} from '../envFlattener';

describe('flattenEnvMap', () => {
  it('returns keys unchanged when no prefix is given', () => {
    const map = { APP__DB__HOST: 'localhost', PORT: '3000' };
    const result = flattenEnvMap(map);
    expect(result.flattened).toEqual({ APP__DB__HOST: 'localhost', PORT: '3000' });
    expect(result.renamedKeys).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });

  it('prepends prefix to all keys', () => {
    const map = { HOST: 'localhost', PORT: '5432' };
    const result = flattenEnvMap(map, { prefix: 'DB' });
    expect(result.flattened).toEqual({
      DB__HOST: 'localhost',
      DB__PORT: '5432',
    });
    expect(result.renamedKeys).toHaveLength(2);
    expect(result.renamedKeys[0]).toEqual({ from: 'HOST', to: 'DB__HOST' });
  });

  it('uses custom separator', () => {
    const map = { HOST: 'localhost' };
    const result = flattenEnvMap(map, { prefix: 'DB', separator: '_' });
    expect(result.flattened).toEqual({ DB_HOST: 'localhost' });
  });

  it('skips keys that exceed maxDepth', () => {
    const deepKey = 'A__B__C__D__E';
    const map = { [deepKey]: 'val', SIMPLE: 'ok' };
    const result = flattenEnvMap(map, { maxDepth: 3 });
    expect(result.skipped).toContain(deepKey);
    expect(result.flattened).not.toHaveProperty(deepKey);
    expect(result.flattened).toHaveProperty('SIMPLE');
  });

  it('preserves values exactly', () => {
    const map = { SECRET: 'p@$$w0rd!', EMPTY: '' };
    const result = flattenEnvMap(map);
    expect(result.flattened['SECRET']).toBe('p@$$w0rd!');
    expect(result.flattened['EMPTY']).toBe('');
  });
});

describe('unflattenEnvMap', () => {
  it('strips matching prefix from keys', () => {
    const map = { DB__HOST: 'localhost', DB__PORT: '5432', OTHER: 'x' };
    const result = unflattenEnvMap(map, 'DB');
    expect(result).toEqual({ HOST: 'localhost', PORT: '5432', OTHER: 'x' });
  });

  it('uses custom separator', () => {
    const map = { DB_HOST: 'localhost', DB_PORT: '5432' };
    const result = unflattenEnvMap(map, 'DB', '_');
    expect(result).toEqual({ HOST: 'localhost', PORT: '5432' });
  });

  it('does not include keys that become empty after stripping', () => {
    const map = { DB__: 'val' };
    const result = unflattenEnvMap(map, 'DB');
    expect(result).not.toHaveProperty('');
  });

  it('passes through keys without the prefix unchanged', () => {
    const map = { APP__KEY: 'v' };
    const result = unflattenEnvMap(map, 'DB');
    expect(result).toEqual({ APP__KEY: 'v' });
  });
});

describe('formatFlattenResult', () => {
  it('includes flattened key count', () => {
    const map = { A: '1', B: '2' };
    const result = flattenEnvMap(map);
    const output = formatFlattenResult(result);
    expect(output).toContain('Flattened: 2 keys');
  });

  it('lists renamed keys', () => {
    const map = { HOST: 'h' };
    const result = flattenEnvMap(map, { prefix: 'DB' });
    const output = formatFlattenResult(result);
    expect(output).toContain('HOST → DB__HOST');
  });

  it('mentions skipped keys', () => {
    const map = { 'A__B__C__D__E': 'v' };
    const result = flattenEnvMap(map, { maxDepth: 3 });
    const output = formatFlattenResult(result);
    expect(output).toContain('Skipped');
    expect(output).toContain('A__B__C__D__E');
  });
});
