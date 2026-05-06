import { EnvEntry, ParseOptions } from './types';

const COMMENT_REGEX = /^\s*#.*$/;
const BLANK_LINE_REGEX = /^\s*$/;
const KEY_VALUE_REGEX = /^\s*([\w.-]+)\s*=\s*(.*)\s*$/;
const QUOTED_VALUE_REGEX = /^(['"`])(.*)\1$/s;

export function parseEnvContent(
  content: string,
  options: ParseOptions = {}
): EnvEntry[] {
  const lines = content.split(/\r?\n/);
  const entries: EnvEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (COMMENT_REGEX.test(line) || BLANK_LINE_REGEX.test(line)) {
      continue;
    }

    const match = KEY_VALUE_REGEX.exec(line);
    if (!match) {
      if (options.strict) {
        throw new SyntaxError(
          `Invalid .env syntax at line ${i + 1}: "${line}"`
        );
      }
      continue;
    }

    const key = match[1];
    let rawValue = match[2].trim();
    let isSecret = false;

    const quotedMatch = QUOTED_VALUE_REGEX.exec(rawValue);
    if (quotedMatch) {
      rawValue = quotedMatch[2];
    }

    if (options.secretPatterns) {
      isSecret = options.secretPatterns.some((pattern) => pattern.test(key));
    }

    entries.push({
      key,
      value: rawValue,
      isSecret,
      line: i + 1,
    });
  }

  return entries;
}

export function serializeEntries(entries: EnvEntry[]): string {
  return entries
    .map((entry) => {
      const needsQuotes = /\s|#|=/.test(entry.value);
      const value = needsQuotes ? `"${entry.value}"` : entry.value;
      return `${entry.key}=${value}`;
    })
    .join('\n');
}
