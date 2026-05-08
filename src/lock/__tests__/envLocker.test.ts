import {
  acquireLock,
  releaseLock,
  getLock,
  isLocked,
  clearAllLocks,
  listLocks,
} from '../envLocker';

beforeEach(() => {
  clearAllLocks();
});

describe('acquireLock', () => {
  it('should acquire a lock on an unlocked layer', () => {
    const result = acquireLock('production', { owner: 'alice', mode: 'write' });
    expect(result.success).toBe(true);
    expect(result.lock?.layer).toBe('production');
    expect(result.lock?.owner).toBe('alice');
    expect(result.lock?.mode).toBe('write');
  });

  it('should fail to acquire a lock on an already locked layer', () => {
    acquireLock('staging', { owner: 'alice' });
    const result = acquireLock('staging', { owner: 'bob' });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already locked/);
  });

  it('should allow re-acquiring an expired lock', () => {
    const past = new Date(Date.now() - 1000);
    acquireLock('dev', { owner: 'alice', ttlMs: -1000 });
    // force expiry by manipulating via getLock (expired lock should be cleared)
    const result = acquireLock('dev', { owner: 'bob' });
    expect(result.success).toBe(true);
  });

  it('should default owner to anonymous and mode to write', () => {
    const result = acquireLock('local');
    expect(result.lock?.owner).toBe('anonymous');
    expect(result.lock?.mode).toBe('write');
  });
});

describe('releaseLock', () => {
  it('should release a lock by layer', () => {
    acquireLock('production', { owner: 'alice' });
    const released = releaseLock('production', 'alice');
    expect(released).toBe(true);
    expect(isLocked('production')).toBe(false);
  });

  it('should return false if owner does not match', () => {
    acquireLock('production', { owner: 'alice' });
    const released = releaseLock('production', 'bob');
    expect(released).toBe(false);
    expect(isLocked('production')).toBe(true);
  });

  it('should return false if no lock exists', () => {
    expect(releaseLock('nonexistent')).toBe(false);
  });
});

describe('getLock / isLocked', () => {
  it('should return the lock if active', () => {
    acquireLock('staging', { owner: 'ci' });
    const lock = getLock('staging');
    expect(lock?.owner).toBe('ci');
  });

  it('should return undefined for unlocked layer', () => {
    expect(getLock('missing')).toBeUndefined();
  });
});

describe('listLocks', () => {
  it('should list all active locks', () => {
    acquireLock('a', { owner: 'x' });
    acquireLock('b', { owner: 'y' });
    const locks = listLocks();
    expect(locks).toHaveLength(2);
  });

  it('should return empty array when no locks', () => {
    expect(listLocks()).toEqual([]);
  });
});

describe('clearAllLocks', () => {
  it('should remove all locks', () => {
    acquireLock('a');
    acquireLock('b');
    clearAllLocks();
    expect(listLocks()).toHaveLength(0);
  });
});
