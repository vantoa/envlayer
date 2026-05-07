import { EnvMap } from '../merge/types';

export type ValidationRule = {
  key: string;
  required?: boolean;
  pattern?: RegExp;
  allowedValues?: string[];
  minLength?: number;
  maxLength?: number;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export type ValidationError = {
  key: string;
  message: string;
};

export function validateEnvMap(
  env: EnvMap,
  rules: ValidationRule[]
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const value = env[rule.key];

    if (rule.required && (value === undefined || value === '')) {
      errors.push({ key: rule.key, message: `"${rule.key}" is required but missing or empty` });
      continue;
    }

    if (value === undefined) continue;

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({ key: rule.key, message: `"${rule.key}" does not match required pattern ${rule.pattern}` });
    }

    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push({
        key: rule.key,
        message: `"${rule.key}" must be one of [${rule.allowedValues.join(', ')}], got "${value}"`
      });
    }

    if (rule.minLength !== undefined && value.length < rule.minLength) {
      errors.push({ key: rule.key, message: `"${rule.key}" must be at least ${rule.minLength} characters long` });
    }

    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      errors.push({ key: rule.key, message: `"${rule.key}" must be at most ${rule.maxLength} characters long` });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function formatValidationErrors(result: ValidationResult): string {
  if (result.valid) return 'All validations passed.';
  return result.errors.map(e => `  ✖ ${e.message}`).join('\n');
}
