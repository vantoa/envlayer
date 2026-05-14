import {
  pinKey,
  unpinKey,
  getPinnedKeys,
  isPinned,
  applyPins,
  clearPins,
  getAllPins,
  resetPinStore,
} from '../envPinner';

beforeEach(() => {
  resetPinStore();
});

describe('pinKey', () => {
  it('should pin a key with value and return entry', () => {
    const entry = pinKey('production', 'API_URL', 'https://api.prod.example.com', 'stable endpoint');
    expect(entry.layer).toBe('production');
    expect(entry.key).toBe('API_URL');
    expect(entry.value).toBe('https://api.prod.example.com');
    expect(entry.reason).toBe('stable endpoint');
    expect(entry.pinnedAt).toBeInstanceOf(Date);
  });

  it('should overwrite an existing pin for the same layer/key', () => {
    pinKey('staging', 'DB_HOST', 'old-host');
    pinKey('staging', 'DB_HOST', 'new-host', 'updated');
    const pins = getPinnedKeys('staging');
    expect(pins).toHaveLength(1);
    expect(pins[0].value).toBe('new-host');
  });
});

describe('unpinKey', () => {
  it('should remove a pinned key and return true', () => {
    pinKey('dev', 'SECRET', 'abc123');
    expect(unpinKey('dev', 'SECRET')).toBe(true);
    expect(isPinned('dev', 'SECRET')).toBe(false);
  });

  it('should return false if key was not pinned', () => {
    expect(unpinKey('dev', 'NONEXISTENT')).toBe(false);
  });
});

describe('getPinnedKeys', () => {
  it('should return only pins for the given layer', () => {
    pinKey('prod', 'A', '1');
    pinKey('prod', 'B', '2');
    pinKey('dev', 'C', '3');
    const prodPins = getPinnedKeys('prod');
    expect(prodPins).toHaveLength(2);
    expect(prodPins.map((p) => p.key)).toEqual(expect.arrayContaining(['A', 'B']));
  });
});

describe('applyPins', () => {
  it('should override envMap values with pinned values', () => {
    pinKey('prod', 'API_URL', 'https://pinned.example.com');
    const result = applyPins('prod', { API_URL: 'https://original.example.com', OTHER: 'val' });
    expect(result['API_URL']).toBe('https://pinned.example.com');
    expect(result['OTHER']).toBe('val');
  });

  it('should add pinned keys not present in the envMap', () => {
    pinKey('prod', 'NEW_KEY', 'injected');
    const result = applyPins('prod', { EXISTING: 'yes' });
    expect(result['NEW_KEY']).toBe('injected');
    expect(result['EXISTING']).toBe('yes');
  });
});

describe('clearPins', () => {
  it('should remove all pins for a layer and return count', () => {
    pinKey('staging', 'X', '1');
    pinKey('staging', 'Y', '2');
    pinKey('prod', 'Z', '3');
    const removed = clearPins('staging');
    expect(removed).toBe(2);
    expect(getPinnedKeys('staging')).toHaveLength(0);
    expect(getPinnedKeys('prod')).toHaveLength(1);
  });
});

describe('getAllPins', () => {
  it('should return all pinned entries across layers', () => {
    pinKey('a', 'K1', 'v1');
    pinKey('b', 'K2', 'v2');
    expect(getAllPins()).toHaveLength(2);
  });
});
