import { coerceValue, coerceEnvMap, formatCoerceResult } from '../envCoercer';

describe('coerceValue', () => {
  it('returns string values unchanged', () => {
    const result = coerceValue('hello', 'string');
    expect(result).toEqual({ ok: true, value: 'hello' });
  });

  it('coerces valid number strings', () => {
    expect(coerceValue('42', 'number')).toEqual({ ok: true, value: '42' });
    expect(coerceValue('3.14', 'number')).toEqual({ ok: true, value: '3.14' });
  });

  it('fails on non-numeric strings for number type', () => {
    const result = coerceValue('abc', 'number');
    expect(result.ok).toBe(false);
  });

  it('coerces truthy boolean strings', () => {
    for (const v of ['true', '1', 'yes', 'on', 'TRUE', 'YES']) {
      const result = coerceValue(v, 'boolean');
      expect(result).toEqual({ ok: true, value: 'true' });
    }
  });

  it('coerces falsy boolean strings', () => {
    for (const v of ['false', '0', 'no', 'off', 'FALSE']) {
      const result = coerceValue(v, 'boolean');
      expect(result).toEqual({ ok: true, value: 'false' });
    }
  });

  it('fails on unrecognized boolean strings', () => {
    const result = coerceValue('maybe', 'boolean');
    expect(result.ok).toBe(false);
  });

  it('passes valid JSON strings through', () => {
    const result = coerceValue('{"a":1}', 'json');
    expect(result).toEqual({ ok: true, value: '{"a":1}' });
  });
});

describe('coerceEnvMap', () => {
  const env = { PORT: '8080', DEBUG: 'yes', NAME: 'app', CONFIG: '{"x":1}' };

  it('coerces matched keys', () => {
    const result = coerceEnvMap(env, [
      { key: 'PORT', type: 'number' },
      { key: 'DEBUG', type: 'boolean' },
    ]);
    expect(result.coerced.PORT).toBe('8080');
    expect(result.coerced.DEBUG).toBe('true');
    expect(result.changed).toContain('DEBUG');
  });

  it('skips missing keys', () => {
    const result = coerceEnvMap(env, [{ key: 'MISSING', type: 'number' }]);
    expect(result.changed).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });

  it('records failures for bad coercions', () => {
    const result = coerceEnvMap({ BAD: 'notanumber' }, [{ key: 'BAD', type: 'number' }]);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].key).toBe('BAD');
  });

  it('does not mutate original env', () => {
    const original = { PORT: '8080' };
    coerceEnvMap(original, [{ key: 'PORT', type: 'number' }]);
    expect(original.PORT).toBe('8080');
  });
});

describe('formatCoerceResult', () => {
  it('reports changed keys', () => {
    const result = { coerced: {}, changed: ['PORT', 'DEBUG'], failed: [] };
    const output = formatCoerceResult(result);
    expect(output).toContain('Coerced 2 key(s)');
    expect(output).toContain('PORT');
  });

  it('reports no changes when none occurred', () => {
    const result = { coerced: {}, changed: [], failed: [] };
    expect(formatCoerceResult(result)).toContain('No values were coerced.');
  });

  it('reports failures', () => {
    const result = {
      coerced: {},
      changed: [],
      failed: [{ key: 'BAD', reason: 'Cannot coerce "xyz" to number' }],
    };
    const output = formatCoerceResult(result);
    expect(output).toContain('Failed 1 key(s)');
    expect(output).toContain('BAD');
  });
});
