import {
  recordAudit,
  getAuditLog,
  clearAuditLog,
  filterAuditLog,
  formatAuditEntry,
} from '../auditLogger';

const sampleMap = { API_KEY: 'abc123', DB_URL: 'postgres://localhost/db' };

beforeEach(() => {
  clearAuditLog();
});

describe('recordAudit', () => {
  it('records an entry with correct fields', () => {
    const entry = recordAudit('load', sampleMap, 'base');
    expect(entry.action).toBe('load');
    expect(entry.layer).toBe('base');
    expect(entry.keys).toEqual(expect.arrayContaining(['API_KEY', 'DB_URL']));
    expect(entry.id).toBeTruthy();
    expect(entry.timestamp).toBeTruthy();
  });

  it('stores entry in the log', () => {
    recordAudit('merge', sampleMap);
    expect(getAuditLog()).toHaveLength(1);
  });

  it('accumulates multiple entries', () => {
    recordAudit('load', sampleMap, 'base');
    recordAudit('merge', sampleMap, 'override');
    expect(getAuditLog()).toHaveLength(2);
  });

  it('stores optional meta', () => {
    const entry = recordAudit('export', sampleMap, undefined, { format: 'json' });
    expect(entry.meta).toEqual({ format: 'json' });
  });
});

describe('clearAuditLog', () => {
  it('empties the log', () => {
    recordAudit('validate', sampleMap);
    clearAuditLog();
    expect(getAuditLog()).toHaveLength(0);
  });
});

describe('filterAuditLog', () => {
  it('filters by action', () => {
    recordAudit('load', sampleMap, 'base');
    recordAudit('merge', sampleMap, 'prod');
    const loads = filterAuditLog((e) => e.action === 'load');
    expect(loads).toHaveLength(1);
    expect(loads[0].action).toBe('load');
  });

  it('filters by layer', () => {
    recordAudit('load', sampleMap, 'base');
    recordAudit('load', { NODE_ENV: 'test' }, 'test');
    const baseLogs = filterAuditLog((e) => e.layer === 'base');
    expect(baseLogs).toHaveLength(1);
  });
});

describe('formatAuditEntry', () => {
  it('formats entry as readable string', () => {
    const entry = recordAudit('load', sampleMap, 'base');
    const formatted = formatAuditEntry(entry);
    expect(formatted).toContain('LOAD');
    expect(formatted).toContain('[base]');
    expect(formatted).toContain('2 key(s)');
    expect(formatted).toContain('API_KEY');
  });

  it('omits layer part when not provided', () => {
    const entry = recordAudit('export', sampleMap);
    const formatted = formatAuditEntry(entry);
    expect(formatted).not.toContain('[');
  });
});
