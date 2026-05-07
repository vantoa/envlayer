import { diffEnvMaps, formatDiff } from '../envDiffer';

const base = {
  APP_NAME: 'myapp',
  DB_HOST: 'localhost',
  API_SECRET: 'super-secret-value',
  OLD_KEY: 'gone',
};

const target = {
  APP_NAME: 'myapp',
  DB_HOST: '10.0.0.1',
  API_SECRET: 'new-secret-value',
  NEW_KEY: 'hello',
};

describe('diffEnvMaps', () => {
  it('detects added keys', () => {
    const result = diffEnvMaps(base, target);
    expect(result.added).toHaveLength(1);
    expect(result.added[0].key).toBe('NEW_KEY');
    expect(result.added[0].newValue).toBe('hello');
  });

  it('detects removed keys', () => {
    const result = diffEnvMaps(base, target);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].key).toBe('OLD_KEY');
    expect(result.removed[0].oldValue).toBe('gone');
  });

  it('detects modified keys', () => {
    const result = diffEnvMaps(base, target);
    const dbEntry = result.modified.find((e) => e.key === 'DB_HOST');
    expect(dbEntry).toBeDefined();
    expect(dbEntry?.oldValue).toBe('localhost');
    expect(dbEntry?.newValue).toBe('10.0.0.1');
  });

  it('marks hasChanges true when there are differences', () => {
    const result = diffEnvMaps(base, target);
    expect(result.hasChanges).toBe(true);
  });

  it('marks hasChanges false for identical maps', () => {
    const result = diffEnvMaps(base, base);
    expect(result.hasChanges).toBe(false);
  });

  it('excludes unchanged entries by default', () => {
    const result = diffEnvMaps(base, target);
    expect(result.unchanged).toHaveLength(0);
    expect(result.entries.find((e) => e.key === 'APP_NAME')).toBeUndefined();
  });

  it('includes unchanged entries when option is set', () => {
    const result = diffEnvMaps(base, target, { includeUnchanged: true });
    expect(result.unchanged).toHaveLength(1);
    expect(result.unchanged[0].key).toBe('APP_NAME');
  });

  it('masks secret values when maskSecrets is true', () => {
    const result = diffEnvMaps(base, target, { maskSecrets: true });
    const secretEntry = result.modified.find((e) => e.key === 'API_SECRET');
    expect(secretEntry?.oldValue).not.toBe('super-secret-value');
    expect(secretEntry?.newValue).not.toBe('new-secret-value');
  });

  it('does not mask values when maskSecrets is false', () => {
    const result = diffEnvMaps(base, target, { maskSecrets: false });
    const secretEntry = result.modified.find((e) => e.key === 'API_SECRET');
    expect(secretEntry?.oldValue).toBe('super-secret-value');
    expect(secretEntry?.newValue).toBe('new-secret-value');
  });

  it('returns sorted entries by key', () => {
    const result = diffEnvMaps(base, target);
    const keys = result.entries.map((e) => e.key);
    expect(keys).toEqual([...keys].sort());
  });
});

describe('formatDiff', () => {
  it('formats added lines with +', () => {
    const result = diffEnvMaps({}, { FOO: 'bar' });
    const output = formatDiff(result);
    expect(output).toContain('+ FOO=bar');
  });

  it('formats removed lines with -', () => {
    const result = diffEnvMaps({ FOO: 'bar' }, {});
    const output = formatDiff(result);
    expect(output).toContain('- FOO=bar');
  });

  it('formats modified lines with ~', () => {
    const result = diffEnvMaps({ FOO: 'old' }, { FOO: 'new' });
    const output = formatDiff(result);
    expect(output).toContain('~ FOO: old → new');
  });
});
