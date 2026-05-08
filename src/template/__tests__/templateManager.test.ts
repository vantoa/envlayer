import {
  defineTemplate,
  applyTemplate,
  removeTemplate,
  getTemplates,
  inferTemplate,
} from '../index';

beforeEach(() => {
  getTemplates().forEach((t) => removeTemplate(t.name));
});

describe('defineTemplate', () => {
  it('creates and stores a template', () => {
    const t = defineTemplate('base', [
      { name: 'APP_PORT', required: true },
      { name: 'APP_ENV', required: false, defaultValue: 'development' },
    ]);
    expect(t.name).toBe('base');
    expect(t.variables).toHaveLength(2);
  });
});

describe('applyTemplate', () => {
  it('renders template with provided values', () => {
    defineTemplate('db', [{ name: 'DB_HOST', required: true }]);
    const result = applyTemplate('db', { DB_HOST: 'localhost' });
    expect(result.content).toContain('DB_HOST=localhost');
    expect(result.used).toContain('DB_HOST');
    expect(result.missing).toHaveLength(0);
  });

  it('uses default value when variable not provided', () => {
    defineTemplate('app', [{ name: 'APP_ENV', required: false, defaultValue: 'production' }]);
    const result = applyTemplate('app', {});
    expect(result.content).toContain('APP_ENV=production');
  });

  it('reports missing required variables', () => {
    defineTemplate('strict', [{ name: 'SECRET_KEY', required: true }]);
    const result = applyTemplate('strict', {});
    expect(result.missing).toContain('SECRET_KEY');
    expect(result.content).not.toContain('SECRET_KEY');
  });

  it('throws when template does not exist', () => {
    expect(() => applyTemplate('nonexistent', {})).toThrow('Template "nonexistent" not found');
  });
});

describe('removeTemplate', () => {
  it('removes an existing template', () => {
    defineTemplate('temp', []);
    expect(removeTemplate('temp')).toBe(true);
    expect(getTemplates().find((t) => t.name === 'temp')).toBeUndefined();
  });

  it('returns false when template does not exist', () => {
    expect(removeTemplate('ghost')).toBe(false);
  });
});

describe('inferTemplate', () => {
  it('extracts variables from content and creates template', () => {
    const content = 'API_URL=${API_URL}\nAPI_KEY=${API_KEY}';
    const t = inferTemplate('inferred', content);
    const names = t.variables.map((v) => v.name);
    expect(names).toContain('API_URL');
    expect(names).toContain('API_KEY');
    expect(t.variables.every((v) => v.required)).toBe(true);
  });
});
