import { EnvSchema, SchemaValidationResult, SchemaApplyResult } from './types';
import { validateAgainstSchema, applyDefaults } from './schemaValidator';

export type { EnvSchema, FieldSchema, FieldType, SchemaValidationResult, SchemaValidationError } from './types';

/**
 * Validate an env map against a schema, returning errors and coerced values.
 */
export function validateWithSchema(
  env: Record<string, string>,
  schema: EnvSchema
): SchemaValidationResult {
  return validateAgainstSchema(env, schema);
}

/**
 * Apply default values from schema to env map where keys are missing.
 */
export function withDefaults(
  env: Record<string, string>,
  schema: EnvSchema
): SchemaApplyResult {
  return applyDefaults(env, schema);
}

/**
 * Validate and apply defaults in one step.
 * Returns the coerced env with defaults applied, or throws if invalid.
 */
export function conformToSchema(
  env: Record<string, string>,
  schema: EnvSchema
): Record<string, string> {
  const { env: withDefaultsApplied } = applyDefaults(env, schema);
  const result = validateAgainstSchema(withDefaultsApplied, schema);

  if (!result.valid) {
    const messages = result.errors.map(e => `  - ${e.message}`).join('\n');
    throw new Error(`Schema validation failed:\n${messages}`);
  }

  return result.coerced;
}

/**
 * List all keys in a schema that are marked as secret.
 */
export function getSecretKeys(schema: EnvSchema): string[] {
  return Object.entries(schema)
    .filter(([, field]) => field.secret === true)
    .map(([key]) => key);
}
