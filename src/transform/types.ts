export type TransformFn = (value: string, key: string) => string;

export type TransformRule = {
  key?: string | RegExp;
  fn: TransformFn;
  description?: string;
};

export type TransformResult = {
  original: Record<string, string>;
  transformed: Record<string, string>;
  changes: TransformChange[];
};

export type TransformChange = {
  key: string;
  before: string;
  after: string;
};

export type BuiltinTransform =
  | 'uppercase'
  | 'lowercase'
  | 'trim'
  | 'base64encode'
  | 'base64decode'
  | 'urlencode'
  | 'urldecode';
