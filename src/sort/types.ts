export type SortOrder = 'asc' | 'desc';

export type SortStrategy = 'alpha' | 'key-length' | 'insertion';

export interface SortOptions {
  order?: SortOrder;
  strategy?: SortStrategy;
  groupByPrefix?: boolean;
  prefixDelimiter?: string;
}

export interface SortResult {
  sorted: Record<string, string>;
  originalOrder: string[];
  newOrder: string[];
  changed: boolean;
}
