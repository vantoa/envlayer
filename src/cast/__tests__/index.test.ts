import {
  castEnv,
  castEnvFull,
  getCastedKeys,
  getUncastedKeys,
  isFullyCasted,
  printCastResult,
} from '../index';

describe('castEnv', () => {
  it('casts numeric strings to numbers', () => {
    const result = castEnv({ PORT: '3000', NAME: 'app' });
    expect(result.PORT).toBe(3000);
  });

  it('casts boolean strings to booleans', () => {
    const result = castEnv({ DEBUG: 'true', VERBOSE: 'false' });
    expect(result.DEBUG).toBe(true);
    expect(result.VERBOSE).toBe(false);
  });

  it('leaves non-castable strings as strings', () => {
    const result = castEnv({ NAME: 'envlayer' });
    expect(result.NAME).toBe('envlayer');
  });

  it('returns empty object for empty input', () => {
    expect(castEnv({})).toEqual({});
  });
});

describe('castEnvFull', () => {
  it('returns a CastResult with casted and metadata', () => {
    const result = castEnvFull({ PORT: '8080', APP: 'test' });
    expect(result).toHaveProperty('casted');
    expect(result).toHaveProperty('castedKeys');
    expect(result).toHaveProperty('uncastedKeys');
  });
});

describe('getCastedKeys', () => {
  it('returns keys that were cast', () => {
    const keys = getCastedKeys({ PORT: '3000', ENABLED: 'true', NAME: 'app' });
    expect(keys).toContain('PORT');
    expect(keys).toContain('ENABLED');
    expect(keys).not.toContain('NAME');
  });

  it('returns empty array when nothing is castable', () => {
    expect(getCastedKeys({ A: 'hello', B: 'world' })).toEqual([]);
  });
});

describe('getUncastedKeys', () => {
  it('returns keys that remained as strings', () => {
    const keys = getUncastedKeys({ PORT: '3000', NAME: 'app' });
    expect(keys).toContain('NAME');
    expect(keys).not.toContain('PORT');
  });
});

describe('isFullyCasted', () => {
  it('returns true when all values are castable', () => {
    expect(isFullyCasted({ PORT: '3000', DEBUG: 'true' })).toBe(true);
  });

  it('returns false when some values remain as strings', () => {
    expect(isFullyCasted({ PORT: '3000', NAME: 'app' })).toBe(false);
  });

  it('returns true for empty env', () => {
    expect(isFullyCasted({})).toBe(true);
  });
});

describe('printCastResult', () => {
  it('prints without throwing', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    expect(() => printCastResult({ PORT: '3000', NAME: 'app' })).not.toThrow();
    spy.mockRestore();
  });
});
