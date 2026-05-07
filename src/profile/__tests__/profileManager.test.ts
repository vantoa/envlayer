import {
  activateProfile,
  addProfile,
  currentProfile,
  deactivateProfile,
  exportProfiles,
  getProfile,
  importProfiles,
  listProfiles,
  removeProfile,
  resetProfileState,
  updateProfile,
} from '../index';
import { formatProfileList, formatProfileSummary } from '../formatProfile';

beforeEach(() => {
  resetProfileState();
});

describe('addProfile', () => {
  it('creates a profile with required fields', () => {
    const p = addProfile('dev', ['.env', '.env.dev']);
    expect(p.name).toBe('dev');
    expect(p.layers).toEqual(['.env', '.env.dev']);
    expect(p.createdAt).toBeDefined();
  });

  it('stores optional description and baseDir', () => {
    const p = addProfile('staging', ['.env.staging'], { description: 'Staging env', baseDir: '/app' });
    expect(p.description).toBe('Staging env');
    expect(p.baseDir).toBe('/app');
  });
});

describe('getProfile / listProfiles', () => {
  it('returns undefined for missing profile', () => {
    expect(getProfile('missing')).toBeUndefined();
  });

  it('lists all profiles', () => {
    addProfile('dev', []);
    addProfile('prod', []);
    expect(listProfiles()).toHaveLength(2);
  });
});

describe('updateProfile', () => {
  it('updates layers and bumps updatedAt', () => {
    const original = addProfile('dev', ['.env']);
    const updated = updateProfile('dev', { layers: ['.env', '.env.dev'] });
    expect(updated?.layers).toEqual(['.env', '.env.dev']);
    expect(updated?.updatedAt).not.toBe(original.createdAt);
  });

  it('returns null for non-existent profile', () => {
    expect(updateProfile('ghost', { layers: [] })).toBeNull();
  });
});

describe('removeProfile', () => {
  it('removes an existing profile', () => {
    addProfile('dev', []);
    expect(removeProfile('dev')).toBe(true);
    expect(getProfile('dev')).toBeUndefined();
  });

  it('returns false for non-existent profile', () => {
    expect(removeProfile('nope')).toBe(false);
  });
});

describe('activateProfile / currentProfile', () => {
  it('sets and retrieves active profile', () => {
    addProfile('dev', ['.env']);
    activateProfile('dev');
    expect(currentProfile()?.name).toBe('dev');
  });

  it('throws when activating non-existent profile', () => {
    expect(() => activateProfile('ghost')).toThrow('Profile "ghost" does not exist');
  });

  it('clears active profile on deactivate', () => {
    addProfile('dev', []);
    activateProfile('dev');
    deactivateProfile();
    expect(currentProfile()).toBeNull();
  });
});

describe('importProfiles / exportProfiles', () => {
  it('round-trips profiles', () => {
    addProfile('dev', ['.env']);
    const exported = exportProfiles();
    resetProfileState();
    importProfiles(exported);
    expect(getProfile('dev')?.name).toBe('dev');
  });
});

describe('formatProfileSummary', () => {
  it('includes name and layers', () => {
    const p = addProfile('dev', ['.env', '.env.dev'], { description: 'Dev profile' });
    const out = formatProfileSummary(p);
    expect(out).toContain('dev');
    expect(out).toContain('.env.dev');
    expect(out).toContain('Dev profile');
  });
});

describe('formatProfileList', () => {
  it('shows no profiles message when empty', () => {
    expect(formatProfileList([])).toContain('No profiles');
  });

  it('marks active profile', () => {
    const p = addProfile('prod', ['.env.prod']);
    const out = formatProfileList([p], 'prod');
    expect(out).toContain('(active)');
  });
});
