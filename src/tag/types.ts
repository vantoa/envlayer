/**
 * types.ts — Types for the tag module
 */

export interface TagEntry {
  /** Unique identifier for this tag assignment */
  id: string;
  /** The layer this tag is attached to */
  layer: string;
  /** The tag string (e.g. 'production', 'ci', 'reviewed') */
  tag: string;
  /** Optional key-value metadata associated with the tag */
  meta: Record<string, string>;
  /** ISO timestamp of when the tag was applied */
  createdAt: string;
}

/** Map of layer name to its list of tag entries */
export type TagMap = Record<string, TagEntry[]>;

export interface TagResult {
  success: boolean;
  layer: string;
  tag: string;
  message: string;
}
