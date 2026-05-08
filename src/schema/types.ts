export type SchemaFieldType = 'string' | 'number' | 'boolean' | 'url' | 'email' | 'enum';

export interface SchemaField {
  type: SchemaFieldType;
  required?: boolean;
  default?: string;
  description?: string;
  enum?: string[];
  pattern?: RegExp;
}

export interface EnvSchema {
  [key: string]: SchemaField;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
  warnings: SchemaValidationWarning[];
}

export interface SchemaValidationError {
  key: string;
  message: string;
  expected?: string;
  received?: string;
}

export interface SchemaValidationWarning {
  key: string;
  message: string;
}
