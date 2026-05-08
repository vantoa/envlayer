import {
  acquireLock,
  releaseLock,
  getLock,
  isLocked,
  clearAllLocks,
  listLocks,
} from "../envLocker";

describe("envLocker", () => {
  beforeEach(() => {
    clearAllLocks();
  });

  describe("acquireLock", () => {
    it("should acquire a lock on an unlocked layer", () => {
      const lock = acquireLock("production", "user-1");
      expect(lock).not.toBeNull();
      expect(lock?.layer).toBe("production");
      expect(lock?.lockedBy).toBe("user-1");
    });

    it("should return null when layer is already locked", () => {
      acquireLock("production", "user-1");
      const second = acquireLock("production", "user-2");
      expect(second).toBeNull();
    });

    it("should allow re-acquiring an expired lock", () => {
      acquireLock("staging", "user-1", 1); // 1ms TTL
      return new Promise<void>((resolve) =>
        setTimeout(() => {
          const lock = acquireLock("staging", "user-2", 30_000);
          expect(lock).not.toBeNull();
          expect(lock?.lockedBy).toBe("user-2");
          resolve();
        }, 10)
      );
    });

    it("should allow different layers to be locked independently", () => {
      const l1 = acquireLock("production", "user-1");
      const l2 = acquireLock("staging", "user-2");
      expect(l1).not.toBeNull();
      expect(l2).not.toBeNull();
    });
  });

  describe("releaseLock", () => {
    it("should release a lock held by the same owner", () => {
      acquireLock("production", "user-1");
      const released = releaseLock("production", "user-1");
      expect(released).toBe(true);
      expect(isLocked("production")).toBe(false);
    });

    it("should not release a lock held by a different owner", () => {
      acquireLock("production", "user-1");
      const released = releaseLock("production", "user-2");
      expect(released).toBe(false);
      expect(isLocked("production")).toBe(true);
    });

    it("should return false when no lock exists", () => {
      const released = releaseLock("nonexistent", "user-1");
      expect(released).toBe(false);
    });
  });

  describe("getLock", () => {
    it("should return the lock entry for a locked layer", () => {
      acquireLock("production", "user-1");
      const lock = getLock("production");
      expect(lock?.lockedBy).toBe("user-1");
    });

    it("should return undefined for an unlocked layer", () => {
      expect(getLock("production")).toBeUndefined();
    });
  });

  describe("listLocks", () => {
    it("should list all active locks", () => {
      acquireLock("production", "user-1");
      acquireLock("staging", "user-2");
      const locks = listLocks();
      expect(locks).toHaveLength(2);
      expect(locks.map((l) => l.layer)).toContain("production");
      expect(locks.map((l) => l.layer)).toContain("staging");
    });

    it("should exclude expired locks from the list", () => {
      acquireLock("production", "user-1", 1);
      return new Promise<void>((resolve) =>
        setTimeout(() => {
          const locks = listLocks();
          expect(locks.find((l) => l.layer === "production")).toBeUndefined();
          resolve();
        }, 10)
      );
    });
  });
});
