import {
  trackChange,
  getLayerHistory,
  getAllHistory,
  revertToEntry,
  getLatestChange,
  getEntryById,
  clearLayerHistory,
  clearAllHistory,
} from '../index';

beforeEach(() => {
  clearAllHistory();
});

describe('trackChange', () => {
  it('records a history entry with correct fields', () => {
    const prev = { FOO: 'bar' };
    const curr = { FOO: 'baz' };
    const entry = trackChange('dev', prev, curr, 'update FOO');

    expect(entry.id).toMatch(/^hist_/);
    expect(entry.layer).toBe('dev');
    expect(entry.previous).toEqual(prev);
    expect(entry.current).toEqual(curr);
    expect(entry.description).toBe('update FOO');
    expect(entry.timestamp).toBeInstanceOf(Date);
  });

  it('stores a snapshot copy, not a reference', () => {
    const prev = { FOO: 'bar' };
    const curr = { FOO: 'baz' };
    const entry = trackChange('dev', prev, curr);
    curr.FOO = 'mutated';
    expect(entry.current.FOO).toBe('baz');
  });
});

describe('getLayerHistory', () => {
  it('returns only entries for the specified layer', () => {
    trackChange('dev', {}, { A: '1' });
    trackChange('prod', {}, { B: '2' });
    const devHistory = getLayerHistory('dev');
    expect(devHistory).toHaveLength(1);
    expect(devHistory[0].layer).toBe('dev');
  });
});

describe('getAllHistory', () => {
  it('returns all recorded entries', () => {
    trackChange('dev', {}, { A: '1' });
    trackChange('prod', {}, { B: '2' });
    expect(getAllHistory()).toHaveLength(2);
  });
});

describe('revertToEntry', () => {
  it('returns the previous env map for a given entry id', () => {
    const entry = trackChange('dev', { FOO: 'old' }, { FOO: 'new' });
    const reverted = revertToEntry(entry.id);
    expect(reverted).toEqual({ FOO: 'old' });
  });

  it('returns undefined for unknown id', () => {
    expect(revertToEntry('nonexistent')).toBeUndefined();
  });
});

describe('getLatestChange', () => {
  it('returns the most recent entry for a layer', () => {
    trackChange('dev', {}, { A: '1' });
    trackChange('dev', { A: '1' }, { A: '2' });
    const latest = getLatestChange('dev');
    expect(latest?.current).toEqual({ A: '2' });
  });

  it('returns undefined when no history exists for layer', () => {
    expect(getLatestChange('staging')).toBeUndefined();
  });
});

describe('clearLayerHistory', () => {
  it('removes only entries for the specified layer', () => {
    trackChange('dev', {}, { A: '1' });
    trackChange('prod', {}, { B: '2' });
    clearLayerHistory('dev');
    expect(getLayerHistory('dev')).toHaveLength(0);
    expect(getLayerHistory('prod')).toHaveLength(1);
  });
});

describe('getEntryById', () => {
  it('finds an entry by id', () => {
    const entry = trackChange('dev', {}, { X: '1' });
    expect(getEntryById(entry.id)).toEqual(entry);
  });

  it('returns undefined for missing id', () => {
    expect(getEntryById('missing')).toBeUndefined();
  });
});
