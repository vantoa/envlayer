export type FieldType = 'string' | 'number' | 'boolean' | 'url' | 'email' | 'enum';

export interface FieldSchema {
  type: FieldType;
  required?: boolean;
  default?: string;
  enum?: string[];
  pattern?: string;
  description?: string;
  secret?: boolean;
}

export interface EnvSchema {
  [key: string]: FieldSchema;
}

export interface SchemaValidationError {
  key: string;
  message: string;
  received?: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
  coerced: Record<string, string>;
}

export interface SchemaApplyResult {
  env: Record<string, string>;
  applied: string[];
}
