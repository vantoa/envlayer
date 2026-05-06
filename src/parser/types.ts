export interface EnvEntry {
  key: string;
  value: string;
  isSecret: boolean;
  line: number;
}

export interface ParseOptions {
  /**
   * If true, throws on malformed lines instead of skipping them.
   */
  strict?: boolean;

  /**
   * Regex patterns matched against keys to mark entries as secrets.
   * e.g. [/password/i, /secret/i, /token/i]
   */
  secretPatterns?: RegExp[];
}

export interface ParseResult {
  entries: EnvEntry[];
  secrets: EnvEntry[];
  plain: EnvEntry[];
}

export function groupEntries(entries: EnvEntry[]): ParseResult {
  const secrets = entries.filter((e) => e.isSecret);
  const plain = entries.filter((e) => !e.isSecret);
  return { entries, secrets, plain };
}
