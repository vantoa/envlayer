import { FieldSchema, EnvSchema, SchemaValidationError, SchemaValidationResult, SchemaApplyResult } from './types';

const URL_PATTERN = /^https?:\/\/.+/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateField(
  key: string,
  value: string | undefined,
  schema: FieldSchema
): SchemaValidationError | null {
  if (value === undefined || value === '') {
    if (schema.required && schema.default === undefined) {
      return { key, message: `Required field "${key}" is missing` };
    }
    return null;
  }

  switch (schema.type) {
    case 'number':
      if (isNaN(Number(value))) {
        return { key, message: `Field "${key}" must be a number`, received: value };
      }
      break;
    case 'boolean':
      if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
        return { key, message: `Field "${key}" must be a boolean (true/false)`, received: value };
      }
      break;
    case 'url':
      if (!URL_PATTERN.test(value)) {
        return { key, message: `Field "${key}" must be a valid URL`, received: value };
      }
      break;
    case 'email':
      if (!EMAIL_PATTERN.test(value)) {
        return { key, message: `Field "${key}" must be a valid email`, received: value };
      }
      break;
    case 'enum':
      if (schema.enum && !schema.enum.includes(value)) {
        return {
          key,
          message: `Field "${key}" must be one of: ${schema.enum.join(', ')}`,
          received: value
        };
      }
      break;
    case 'string':
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        return { key, message: `Field "${key}" does not match pattern ${schema.pattern}`, received: value };
      }
      break;
  }

  return null;
}

export function validateAgainstSchema(
  env: Record<string, string>,
  schema: EnvSchema
): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];
  const coerced: Record<string, string> = { ...env };

  for (const [key, fieldSchema] of Object.entries(schema)) {
    const value = env[key];
    const error = validateField(key, value, fieldSchema);
    if (error) {
      errors.push(error);
    } else if (value !== undefined && fieldSchema.type === 'boolean') {
      coerced[key] = ['true', '1'].includes(value.toLowerCase()) ? 'true' : 'false';
    }
  }

  return { valid: errors.length === 0, errors, coerced };
}

export function applyDefaults(
  env: Record<string, string>,
  schema: EnvSchema
): SchemaApplyResult {
  const result = { ...env };
  const applied: string[] = [];

  for (const [key, fieldSchema] of Object.entries(schema)) {
    if ((result[key] === undefined || result[key] === '') && fieldSchema.default !== undefined) {
      result[key] = fieldSchema.default;
      applied.push(key);
    }
  }

  return { env: result, applied };
}
