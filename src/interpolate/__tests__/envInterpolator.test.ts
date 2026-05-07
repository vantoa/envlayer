import { interpolateValue, interpolateEnvMap, hasInterpolation } from '../envInterpolator';

describe('hasInterpolation', () => {
  it('detects ${VAR} syntax', () => {
    expect(hasInterpolation('hello ${NAME}')).toBe(true);
  });

  it('detects $VAR syntax', () => {
    expect(hasInterpolation('hello $NAME')).toBe(true);
  });

  it('returns false for plain strings', () => {
    expect(hasInterpolation('no references here')).toBe(false);
  });
});

describe('interpolateValue', () => {
  const env = { HOST: 'localhost', PORT: '5432', DB: 'mydb' };

  it('resolves ${VAR} references', () => {
    const r = interpolateValue('postgres://${HOST}:${PORT}/${DB}', env);
    expect(r.value).toBe('postgres://localhost:5432/mydb');
    expect(r.resolvedRefs).toEqual(expect.arrayContaining(['HOST', 'PORT', 'DB']));
  });

  it('resolves nested references', () => {
    const nested = { BASE: 'http://localhost', URL: '${BASE}/api' };
    const r = interpolateValue('${URL}/v1', nested);
    expect(r.value).toBe('http://localhost/api/v1');
  });

  it('throws on missing variable by default', () => {
    expect(() => interpolateValue('${MISSING}', {})).toThrow();
  });

  it('uses fallback when allowMissing is true', () => {
    const r = interpolateValue('${MISSING}', {}, { allowMissing: true, fallback: 'default' });
    expect(r.value).toBe('default');
    expect(r.missingRefs).toContain('MISSING');
  });

  it('throws on circular reference', () => {
    const circular = { A: '${B}', B: '${A}' };
    expect(() => interpolateValue('${A}', circular)).toThrow(/[Cc]ircular/);
  });
});

describe('interpolateEnvMap', () => {
  it('interpolates all entries', () => {
    const env = { HOST: 'localhost', URL: 'http://${HOST}:3000' };
    const { result, errors } = interpolateEnvMap(env);
    expect(errors).toHaveLength(0);
    expect(result.URL).toBe('http://localhost:3000');
    expect(result.HOST).toBe('localhost');
  });

  it('collects errors without throwing', () => {
    const env = { URL: '${MISSING}/path' };
    const { result, errors } = interpolateEnvMap(env, { allowMissing: false });
    expect(errors.length).toBeGreaterThan(0);
    expect(result.URL).toBe('${MISSING}/path');
  });

  it('leaves non-interpolated values unchanged', () => {
    const env = { PLAIN: 'just a value' };
    const { result } = interpolateEnvMap(env);
    expect(result.PLAIN).toBe('just a value');
  });
});
