import {
  addTag,
  removeTag,
  getTagsForLayer,
  getLayersForTag,
  hasTag,
  clearTagsForLayer,
  resetTagStore,
  getAllTags,
} from '../envTagger';

beforeEach(() => {
  resetTagStore();
});

describe('addTag', () => {
  it('adds a tag to a layer', () => {
    const entry = addTag('production', 'stable');
    expect(entry.layer).toBe('production');
    expect(entry.tag).toBe('stable');
    expect(entry.id).toMatch(/^tag_/);
    expect(entry.createdAt).toBeTruthy();
  });

  it('does not duplicate tags on the same layer', () => {
    addTag('production', 'stable');
    addTag('production', 'stable');
    const tags = getTagsForLayer('production');
    expect(tags).toHaveLength(1);
  });

  it('stores optional meta', () => {
    const entry = addTag('staging', 'ci', { pipeline: 'github-actions' });
    expect(entry.meta).toEqual({ pipeline: 'github-actions' });
  });
});

describe('removeTag', () => {
  it('removes an existing tag', () => {
    addTag('production', 'stable');
    const removed = removeTag('production', 'stable');
    expect(removed).toBe(true);
    expect(getTagsForLayer('production')).toHaveLength(0);
  });

  it('returns false when tag does not exist', () => {
    const removed = removeTag('production', 'nonexistent');
    expect(removed).toBe(false);
  });
});

describe('getTagsForLayer', () => {
  it('returns empty array for unknown layer', () => {
    expect(getTagsForLayer('unknown')).toEqual([]);
  });

  it('returns all tags for a layer', () => {
    addTag('dev', 'local');
    addTag('dev', 'debug');
    expect(getTagsForLayer('dev')).toHaveLength(2);
  });
});

describe('getLayersForTag', () => {
  it('returns all layers with a given tag', () => {
    addTag('production', 'reviewed');
    addTag('staging', 'reviewed');
    addTag('dev', 'local');
    const layers = getLayersForTag('reviewed');
    expect(layers).toContain('production');
    expect(layers).toContain('staging');
    expect(layers).not.toContain('dev');
  });
});

describe('hasTag', () => {
  it('returns true when layer has tag', () => {
    addTag('production', 'stable');
    expect(hasTag('production', 'stable')).toBe(true);
  });

  it('returns false when layer does not have tag', () => {
    expect(hasTag('production', 'stable')).toBe(false);
  });
});

describe('clearTagsForLayer', () => {
  it('removes all tags for a layer', () => {
    addTag('staging', 'ci');
    addTag('staging', 'reviewed');
    clearTagsForLayer('staging');
    expect(getTagsForLayer('staging')).toEqual([]);
  });
});

describe('getAllTags', () => {
  it('returns a snapshot of all tags', () => {
    addTag('production', 'stable');
    addTag('dev', 'local');
    const all = getAllTags();
    expect(Object.keys(all)).toHaveLength(2);
  });
});
