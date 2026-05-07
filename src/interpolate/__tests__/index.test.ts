import { resolveInterpolations, tryResolveInterpolations, resolveValue, hasInterpolation } from '../index';

describe('resolveInterpolations', () => {
  it('returns fully resolved env map', () => {
    const env = { NAME: 'world', GREETING: 'Hello, ${NAME}!' };
    const resolved = resolveInterpolations(env);
    expect(resolved.GREETING).toBe('Hello, world!');
  });

  it('throws on missing references', () => {
    expect(() => resolveInterpolations({ KEY: '${UNDEFINED}' })).toThrow('Interpolation failed');
  });

  it('does not throw when allowMissing is set', () => {
    const resolved = resolveInterpolations({ KEY: '${UNDEFINED}' }, { allowMissing: true, fallback: 'N/A' });
    expect(resolved.KEY).toBe('N/A');
  });
});

describe('tryResolveInterpolations', () => {
  it('returns errors instead of throwing', () => {
    const { env, errors } = tryResolveInterpolations({ KEY: '${MISSING}' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].key).toBe('MISSING');
    expect(env.KEY).toBe('${MISSING}');
  });

  it('returns empty errors for valid map', () => {
    const { env, errors } = tryResolveInterpolations({ A: 'foo', B: '${A}-bar' });
    expect(errors).toHaveLength(0);
    expect(env.B).toBe('foo-bar');
  });
});

describe('resolveValue', () => {
  it('resolves a single value against env', () => {
    const result = resolveValue('${PROTO}://${HOST}', { PROTO: 'https', HOST: 'example.com' });
    expect(result.value).toBe('https://example.com');
    expect(result.resolvedRefs).toContain('PROTO');
    expect(result.resolvedRefs).toContain('HOST');
  });
});

describe('hasInterpolation (re-export)', () => {
  it('is accessible from index', () => {
    expect(hasInterpolation('${VAR}')).toBe(true);
    expect(hasInterpolation('plain')).toBe(false);
  });
});
