import type { EnvSchema, SchemaValidationResult, SchemaValidationError, SchemaValidationWarning } from './types';

const URL_RE = /^https?:\/\/.+/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(
  key: string,
  value: string | undefined,
  field: import('./types').SchemaField
): { errors: SchemaValidationError[]; warnings: SchemaValidationWarning[] } {
  const errors: SchemaValidationError[] = [];
  const warnings: SchemaValidationWarning[] = [];

  if (value === undefined || value === '') {
    if (field.required) {
      errors.push({ key, message: `Required field "${key}" is missing or empty` });
    } else if (field.default !== undefined) {
      warnings.push({ key, message: `Field "${key}" is not set; default is "${field.default}"` });
    }
    return { errors, warnings };
  }

  switch (field.type) {
    case 'number':
      if (isNaN(Number(value))) {
        errors.push({ key, message: `Field "${key}" must be a number`, received: value });
      }
      break;
    case 'boolean':
      if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
        errors.push({ key, message: `Field "${key}" must be a boolean (true/false/1/0)`, received: value });
      }
      break;
    case 'url':
      if (!URL_RE.test(value)) {
        errors.push({ key, message: `Field "${key}" must be a valid URL`, received: value });
      }
      break;
    case 'email':
      if (!EMAIL_RE.test(value)) {
        errors.push({ key, message: `Field "${key}" must be a valid email`, received: value });
      }
      break;
    case 'enum':
      if (field.enum && !field.enum.includes(value)) {
        errors.push({
          key,
          message: `Field "${key}" must be one of: ${field.enum.join(', ')}`,
          expected: field.enum.join(' | '),
          received: value,
        });
      }
      break;
    case 'string':
      if (field.pattern && !field.pattern.test(value)) {
        errors.push({ key, message: `Field "${key}" does not match required pattern`, received: value });
      }
      break;
  }

  return { errors, warnings };
}

export function validateAgainstSchema(
  envMap: Record<string, string>,
  schema: EnvSchema
): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];
  const warnings: SchemaValidationWarning[] = [];

  for (const [key, field] of Object.entries(schema)) {
    const result = validateField(key, envMap[key], field);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function applyDefaults(
  envMap: Record<string, string>,
  schema: EnvSchema
): Record<string, string> {
  const result = { ...envMap };
  for (const [key, field] of Object.entries(schema)) {
    if ((result[key] === undefined || result[key] === '') && field.default !== undefined) {
      result[key] = field.default;
    }
  }
  return result;
}
