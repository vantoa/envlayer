import { compareEnvMaps, printEnvDiff } from '../index';

const base = { HOST: 'localhost', PORT: '3000', SECRET_KEY: 'abc123' };
const target = { HOST: 'prod.example.com', PORT: '3000', NEW_VAR: 'value' };

describe('compareEnvMaps', () => {
  it('returns a structured diff result', () => {
    const result = compareEnvMaps(base, target);
    expect(result.hasChanges).toBe(true);
    expect(result.added.map((e) => e.key)).toContain('NEW_VAR');
    expect(result.removed.map((e) => e.key)).toContain('SECRET_KEY');
    expect(result.modified.map((e) => e.key)).toContain('HOST');
  });

  it('masks secrets by default', () => {
    const result = compareEnvMaps(
      { SECRET_KEY: 'plain-secret' },
      { SECRET_KEY: 'other-secret' }
    );
    const entry = result.modified[0];
    expect(entry.oldValue).not.toBe('plain-secret');
  });

  it('allows overriding maskSecrets option', () => {
    const result = compareEnvMaps(
      { SECRET_KEY: 'plain-secret' },
      { SECRET_KEY: 'other-secret' },
      { maskSecrets: false }
    );
    const entry = result.modified[0];
    expect(entry.oldValue).toBe('plain-secret');
  });
});

describe('printEnvDiff', () => {
  it('returns a non-empty string for differing maps', () => {
    const output = printEnvDiff(base, target);
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
  });

  it('returns empty string for identical maps', () => {
    const output = printEnvDiff(base, base);
    expect(output).toBe('');
  });
});
