import {
  tagLayer,
  untagLayer,
  getLayerTags,
  findLayersByTag,
  getAllTags,
  hasTag,
  clearLayer,
  resetTags,
  getTagSummary,
} from '../index';

beforeEach(() => {
  resetTags();
});

describe('tagLayer', () => {
  it('should add a tag to a layer', () => {
    const entry = tagLayer('layer-a', 'production');
    expect(entry.layerId).toBe('layer-a');
    expect(entry.tag).toBe('production');
    expect(entry.id).toBeDefined();
  });

  it('should support optional meta', () => {
    const entry = tagLayer('layer-b', 'staging', { region: 'us-east-1' });
    expect(entry.meta).toEqual({ region: 'us-east-1' });
  });
});

describe('untagLayer', () => {
  it('should remove a tag from a layer', () => {
    tagLayer('layer-a', 'production');
    const removed = untagLayer('layer-a', 'production');
    expect(removed).toBe(true);
    expect(hasTag('layer-a', 'production')).toBe(false);
  });

  it('should return false if tag not found', () => {
    const removed = untagLayer('layer-x', 'nonexistent');
    expect(removed).toBe(false);
  });
});

describe('getLayerTags', () => {
  it('should return all tags for a layer', () => {
    tagLayer('layer-a', 'production');
    tagLayer('layer-a', 'stable');
    const tags = getLayerTags('layer-a');
    expect(tags).toHaveLength(2);
  });

  it('should return empty array for unknown layer', () => {
    expect(getLayerTags('unknown')).toEqual([]);
  });
});

describe('findLayersByTag', () => {
  it('should return layers that have a given tag', () => {
    tagLayer('layer-a', 'production');
    tagLayer('layer-b', 'production');
    tagLayer('layer-c', 'staging');
    const layers = findLayersByTag('production');
    expect(layers).toContain('layer-a');
    expect(layers).toContain('layer-b');
    expect(layers).not.toContain('layer-c');
  });
});

describe('hasTag', () => {
  it('should return true if layer has the tag', () => {
    tagLayer('layer-a', 'beta');
    expect(hasTag('layer-a', 'beta')).toBe(true);
  });

  it('should return false if layer does not have the tag', () => {
    expect(hasTag('layer-a', 'beta')).toBe(false);
  });
});

describe('getTagSummary', () => {
  it('should return a map of tag to layer ids', () => {
    tagLayer('layer-a', 'production');
    tagLayer('layer-b', 'production');
    tagLayer('layer-c', 'staging');
    const summary = getTagSummary();
    expect(summary['production']).toEqual(expect.arrayContaining(['layer-a', 'layer-b']));
    expect(summary['staging']).toEqual(['layer-c']);
  });

  it('should return empty object when no tags exist', () => {
    expect(getTagSummary()).toEqual({});
  });
});

describe('clearLayer', () => {
  it('should remove all tags for a specific layer', () => {
    tagLayer('layer-a', 'production');
    tagLayer('layer-a', 'stable');
    clearLayer('layer-a');
    expect(getLayerTags('layer-a')).toHaveLength(0);
  });
});

describe('getAllTags', () => {
  it('should return all tag entries', () => {
    tagLayer('layer-a', 'production');
    tagLayer('layer-b', 'staging');
    expect(getAllTags()).toHaveLength(2);
  });
});
