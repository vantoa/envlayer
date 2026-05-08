import { validateWithSchema, withDefaults, conformToSchema, getSecretKeys } from '../index';
import { EnvSchema } from '../types';

const schema: EnvSchema = {
  PORT: { type: 'number', required: true, default: '3000' },
  NODE_ENV: { type: 'enum', enum: ['development', 'production', 'test'], default: 'development' },
  API_KEY: { type: 'string', required: true, secret: true },
  DB_URL: { type: 'url', secret: true }
};

describe('validateWithSchema', () => {
  it('returns valid result for conforming env', () => {
    const result = validateWithSchema(
      { PORT: '3000', NODE_ENV: 'production', API_KEY: 'secret' },
      schema
    );
    expect(result.valid).toBe(true);
  });

  it('returns errors for non-conforming env', () => {
    const result = validateWithSchema({ PORT: 'bad', NODE_ENV: 'unknown' }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('withDefaults', () => {
  it('fills in defaults', () => {
    const result = withDefaults({ API_KEY: 'key' }, schema);
    expect(result.env['PORT']).toBe('3000');
    expect(result.env['NODE_ENV']).toBe('development');
    expect(result.applied).toEqual(expect.arrayContaining(['PORT', 'NODE_ENV']));
  });
});

describe('conformToSchema', () => {
  it('returns coerced env when valid', () => {
    const result = conformToSchema({ API_KEY: 'mykey' }, schema);
    expect(result['PORT']).toBe('3000');
    expect(result['NODE_ENV']).toBe('development');
  });

  it('throws when validation fails after defaults', () => {
    expect(() => conformToSchema({ PORT: 'bad', NODE_ENV: 'unknown' }, schema)).toThrow(
      'Schema validation failed'
    );
  });
});

describe('getSecretKeys', () => {
  it('returns keys marked as secret', () => {
    const secrets = getSecretKeys(schema);
    expect(secrets).toContain('API_KEY');
    expect(secrets).toContain('DB_URL');
    expect(secrets).not.toContain('PORT');
    expect(secrets).not.toContain('NODE_ENV');
  });
});
