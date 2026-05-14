import {
  sanitizeEnv,
  filterValidKeys,
  getInvalidKeys,
  isClean,
} from '../index';

describe('sanitize/index', () => {
  const validMap = { APP_NAME: 'myapp', PORT: '3000', DB_HOST: 'localhost' };
  const dirtyMap = {
    APP_NAME: 'myapp',
    '123INVALID': 'bad',
    'has-hyphen': 'also-bad',
    VALID_KEY: 'ok',
  };

  describe('sanitizeEnv', () => {
    it('returns the original map unchanged when all keys are valid', () => {
      const { map, result } = sanitizeEnv(validMap);
      expect(map).toEqual(validMap);
      expect(result.invalidKeys).toHaveLength(0);
    });

    it('strips invalid keys when stripInvalid is true', () => {
      const { map, result } = sanitizeEnv(dirtyMap, { stripInvalid: true });
      expect(map).not.toHaveProperty('123INVALID');
      expect(map).not.toHaveProperty('has-hyphen');
      expect(map).toHaveProperty('APP_NAME');
      expect(map).toHaveProperty('VALID_KEY');
      expect(result.invalidKeys.length).toBeGreaterThan(0);
    });

    it('reports invalid keys in the result', () => {
      const { result } = sanitizeEnv(dirtyMap, { stripInvalid: true });
      expect(result.invalidKeys).toContain('123INVALID');
      expect(result.invalidKeys).toContain('has-hyphen');
    });

    it('returns correct total count', () => {
      const { result } = sanitizeEnv(dirtyMap, { stripInvalid: true });
      expect(result.total).toBe(Object.keys(dirtyMap).length);
    });
  });

  describe('filterValidKeys', () => {
    it('removes invalid keys and returns only valid ones', () => {
      const filtered = filterValidKeys(dirtyMap);
      expect(Object.keys(filtered)).toContain('APP_NAME');
      expect(Object.keys(filtered)).toContain('VALID_KEY');
      expect(Object.keys(filtered)).not.toContain('123INVALID');
    });

    it('returns full map when all keys are valid', () => {
      const filtered = filterValidKeys(validMap);
      expect(filtered).toEqual(validMap);
    });
  });

  describe('getInvalidKeys', () => {
    it('returns empty array for a clean map', () => {
      expect(getInvalidKeys(validMap)).toEqual([]);
    });

    it('returns all invalid keys', () => {
      const invalid = getInvalidKeys(dirtyMap);
      expect(invalid).toContain('123INVALID');
      expect(invalid).toContain('has-hyphen');
    });
  });

  describe('isClean', () => {
    it('returns true when all keys are valid', () => {
      expect(isClean(validMap)).toBe(true);
    });

    it('returns false when any key is invalid', () => {
      expect(isClean(dirtyMap)).toBe(false);
    });

    it('returns true for an empty map', () => {
      expect(isClean({})).toBe(true);
    });
  });
});
