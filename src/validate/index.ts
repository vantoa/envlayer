import { validateEnvMap, formatValidationErrors } from './envValidator';
import type { EnvMap } from '../merge/types';

export interface ValidationRule {
  key: string;
  required?: boolean;
  pattern?: RegExp;
  allowedValues?: string[];
  minLength?: number;
  maxLength?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate an env map against a set of rules.
 * Returns a structured result with errors and warnings.
 */
export function validateEnv(
  envMap: EnvMap,
  rules: ValidationRule[]
): ValidationResult {
  const { errors, warnings } = validateEnvMap(envMap, rules);
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and throw if invalid, printing a formatted error message.
 */
export function assertValidEnv(
  envMap: EnvMap,
  rules: ValidationRule[]
): void {
  const result = validateEnv(envMap, rules);
  if (!result.valid) {
    const message = formatValidationErrors(result.errors);
    throw new Error(`Environment validation failed:\n${message}`);
  }
}

/**
 * Check whether all required keys from a list are present in the env map.
 */
export function checkRequiredKeys(
  envMap: EnvMap,
  requiredKeys: string[]
): ValidationResult {
  const errors: string[] = [];
  for (const key of requiredKeys) {
    if (!(key in envMap) || envMap[key] === undefined || envMap[key] === '') {
      errors.push(`Missing required key: ${key}`);
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
  };
}
