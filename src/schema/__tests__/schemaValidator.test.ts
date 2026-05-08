import { validateAgainstSchema, applyDefaults } from '../schemaValidator';
import type { EnvSchema } from '../types';

const schema: EnvSchema = {
  PORT: { type: 'number', required: true },
  NODE_ENV: { type: 'enum', required: true, enum: ['development', 'production', 'test'] },
  API_URL: { type: 'url', required: false, default: 'http://localhost:3000' },
  ADMIN_EMAIL: { type: 'email', required: false },
  DEBUG: { type: 'boolean', required: false },
  APP_NAME: { type: 'string', required: true, pattern: /^[a-z][a-z0-9-]+$/ },
};

describe('validateAgainstSchema', () => {
  it('passes with a valid env map', () => {
    const env = { PORT: '3000', NODE_ENV: 'production', APP_NAME: 'my-app' };
    const result = validateAgainstSchema(env, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports missing required fields', () => {
    const env = { NODE_ENV: 'development', APP_NAME: 'my-app' };
    const result = validateAgainstSchema(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.key === 'PORT')).toBe(true);
  });

  it('reports invalid number', () => {
    const env = { PORT: 'abc', NODE_ENV: 'test', APP_NAME: 'my-app' };
    const result = validateAgainstSchema(env, schema);
    expect(result.errors.some(e => e.key === 'PORT')).toBe(true);
  });

  it('reports invalid enum value', () => {
    const env = { PORT: '8080', NODE_ENV: 'staging', APP_NAME: 'my-app' };
    const result = validateAgainstSchema(env, schema);
    expect(result.errors.some(e => e.key === 'NODE_ENV')).toBe(true);
  });

  it('reports invalid URL', () => {
    const env = { PORT: '3000', NODE_ENV: 'test', APP_NAME: 'my-app', API_URL: 'not-a-url' };
    const result = validateAgainstSchema(env, schema);
    expect(result.errors.some(e => e.key === 'API_URL')).toBe(true);
  });

  it('reports invalid email', () => {
    const env = { PORT: '3000', NODE_ENV: 'test', APP_NAME: 'my-app', ADMIN_EMAIL: 'not-email' };
    const result = validateAgainstSchema(env, schema);
    expect(result.errors.some(e => e.key === 'ADMIN_EMAIL')).toBe(true);
  });

  it('reports invalid boolean', () => {
    const env = { PORT: '3000', NODE_ENV: 'test', APP_NAME: 'my-app', DEBUG: 'yes' };
    const result = validateAgainstSchema(env, schema);
    expect(result.errors.some(e => e.key === 'DEBUG')).toBe(true);
  });

  it('reports warning for missing optional field with default', () => {
    const env = { PORT: '3000', NODE_ENV: 'test', APP_NAME: 'my-app' };
    const result = validateAgainstSchema(env, schema);
    expect(result.warnings.some(w => w.key === 'API_URL')).toBe(true);
  });

  it('reports pattern mismatch for string field', () => {
    const env = { PORT: '3000', NODE_ENV: 'test', APP_NAME: 'My App!' };
    const result = validateAgainstSchema(env, schema);
    expect(result.errors.some(e => e.key === 'APP_NAME')).toBe(true);
  });
});

describe('applyDefaults', () => {
  it('fills in missing fields with defaults', () => {
    const env = { PORT: '3000', NODE_ENV: 'test', APP_NAME: 'my-app' };
    const result = applyDefaults(env, schema);
    expect(result.API_URL).toBe('http://localhost:3000');
  });

  it('does not overwrite existing values', () => {
    const env = { PORT: '3000', NODE_ENV: 'test', APP_NAME: 'my-app', API_URL: 'https://api.example.com' };
    const result = applyDefaults(env, schema);
    expect(result.API_URL).toBe('https://api.example.com');
  });
});
