import { validateField, validateAgainstSchema, applyDefaults } from '../schemaValidator';
import { EnvSchema } from '../types';

describe('validateField', () => {
  it('returns null for valid string', () => {
    expect(validateField('KEY', 'hello', { type: 'string' })).toBeNull();
  });

  it('returns error for missing required field', () => {
    const err = validateField('KEY', undefined, { type: 'string', required: true });
    expect(err).not.toBeNull();
    expect(err?.key).toBe('KEY');
  });

  it('returns null for missing optional field', () => {
    expect(validateField('KEY', undefined, { type: 'string' })).toBeNull();
  });

  it('validates number type', () => {
    expect(validateField('PORT', '3000', { type: 'number' })).toBeNull();
    expect(validateField('PORT', 'abc', { type: 'number' })).not.toBeNull();
  });

  it('validates boolean type', () => {
    expect(validateField('FLAG', 'true', { type: 'boolean' })).toBeNull();
    expect(validateField('FLAG', '1', { type: 'boolean' })).toBeNull();
    expect(validateField('FLAG', 'yes', { type: 'boolean' })).not.toBeNull();
  });

  it('validates url type', () => {
    expect(validateField('URL', 'https://example.com', { type: 'url' })).toBeNull();
    expect(validateField('URL', 'not-a-url', { type: 'url' })).not.toBeNull();
  });

  it('validates email type', () => {
    expect(validateField('EMAIL', 'user@example.com', { type: 'email' })).toBeNull();
    expect(validateField('EMAIL', 'bad-email', { type: 'email' })).not.toBeNull();
  });

  it('validates enum type', () => {
    const schema = { type: 'enum' as const, enum: ['dev', 'prod', 'test'] };
    expect(validateField('ENV', 'dev', schema)).toBeNull();
    expect(validateField('ENV', 'staging', schema)).not.toBeNull();
  });

  it('validates string pattern', () => {
    const schema = { type: 'string' as const, pattern: '^v\\d+\\.\\d+' };
    expect(validateField('VERSION', 'v1.2', schema)).toBeNull();
    expect(validateField('VERSION', '1.2', schema)).not.toBeNull();
  });
});

describe('validateAgainstSchema', () => {
  const schema: EnvSchema = {
    PORT: { type: 'number', required: true },
    NODE_ENV: { type: 'enum', enum: ['development', 'production', 'test'] },
    DEBUG: { type: 'boolean' }
  };

  it('returns valid for correct env', () => {
    const result = validateAgainstSchema(
      { PORT: '3000', NODE_ENV: 'development', DEBUG: 'true' },
      schema
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for invalid env', () => {
    const result = validateAgainstSchema({ PORT: 'abc', NODE_ENV: 'staging' }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('coerces boolean values', () => {
    const result = validateAgainstSchema({ PORT: '3000', DEBUG: '1' }, schema);
    expect(result.coerced['DEBUG']).toBe('true');
  });
});

describe('applyDefaults', () => {
  const schema: EnvSchema = {
    PORT: { type: 'number', default: '3000' },
    HOST: { type: 'string', default: 'localhost' },
    SECRET: { type: 'string', required: true }
  };

  it('applies defaults for missing keys', () => {
    const result = applyDefaults({ SECRET: 'abc' }, schema);
    expect(result.env['PORT']).toBe('3000');
    expect(result.env['HOST']).toBe('localhost');
    expect(result.applied).toContain('PORT');
    expect(result.applied).toContain('HOST');
  });

  it('does not override existing values', () => {
    const result = applyDefaults({ PORT: '8080', SECRET: 'abc' }, schema);
    expect(result.env['PORT']).toBe('8080');
    expect(result.applied).not.toContain('PORT');
  });
});
