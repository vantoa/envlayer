import { compareEnvMaps, formatCompareResult } from '../envComparer';

const mapA = { HOST: 'localhost', PORT: '3000', SECRET: 'abc' };
const mapB = { HOST: 'prod.example.com', PORT: '3000', DEBUG: 'true' };

describe('compareEnvMaps', () => {
  it('detects keys only in A', () => {
    const result = compareEnvMaps('dev', mapA, 'prod', mapB);
    expect(result.onlyInA).toContain('SECRET');
    expect(result.onlyInA).not.toContain('HOST');
  });

  it('detects keys only in B', () => {
    const result = compareEnvMaps('dev', mapA, 'prod', mapB);
    expect(result.onlyInB).toContain('DEBUG');
  });

  it('detects keys in both', () => {
    const result = compareEnvMaps('dev', mapA, 'prod', mapB);
    expect(result.inBoth).toContain('HOST');
    expect(result.inBoth).toContain('PORT');
  });

  it('detects value differences', () => {
    const result = compareEnvMaps('dev', mapA, 'prod', mapB);
    const diff = result.diffValues.find((d) => d.key === 'HOST');
    expect(diff).toBeDefined();
    expect(diff?.valueA).toBe('localhost');
    expect(diff?.valueB).toBe('prod.example.com');
  });

  it('reports identical when maps are equal', () => {
    const result = compareEnvMaps('a', mapA, 'b', { ...mapA });
    expect(result.identical).toBe(true);
  });

  it('respects keys-only mode', () => {
    const result = compareEnvMaps('dev', mapA, 'prod', mapB, { mode: 'keys' });
    expect(result.diffValues).toHaveLength(0);
  });

  it('respects ignoreCase option', () => {
    const result = compareEnvMaps(
      'a',
      { KEY: 'Hello' },
      'b',
      { KEY: 'hello' },
      { ignoreCase: true }
    );
    expect(result.diffValues).toHaveLength(0);
    expect(result.identical).toBe(true);
  });
});

describe('formatCompareResult', () => {
  it('returns identical message when maps match', () => {
    const result = compareEnvMaps('a', mapA, 'b', { ...mapA });
    const lines = formatCompareResult(result);
    expect(lines[0]).toMatch(/identical/);
  });

  it('masks values when maskSecrets is true', () => {
    const result = compareEnvMaps('dev', mapA, 'prod', mapB);
    const lines = formatCompareResult(result, true);
    const diffLine = lines.find((l) => l.includes('HOST'));
    expect(diffLine).toContain('****');
    expect(diffLine).not.toContain('localhost');
  });

  it('includes only-in-A section when applicable', () => {
    const result = compareEnvMaps('dev', mapA, 'prod', mapB);
    const lines = formatCompareResult(result);
    expect(lines.some((l) => l.includes('dev'))).toBe(true);
    expect(lines.some((l) => l.includes('SECRET'))).toBe(true);
  });
});
