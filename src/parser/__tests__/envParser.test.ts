import { parseEnvContent, serializeEntries } from '../envParser';
import { groupEntries } from '../types';

describe('parseEnvContent', () => {
  it('parses simple key=value pairs', () => {
    const input = 'FOO=bar\nBAZ=qux';
    const entries = parseEnvContent(input);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ key: 'FOO', value: 'bar', line: 1 });
    expect(entries[1]).toMatchObject({ key: 'BAZ', value: 'qux', line: 2 });
  });

  it('ignores comments and blank lines', () => {
    const input = '# comment\n\nFOO=bar\n  # another comment';
    const entries = parseEnvContent(input);
    expect(entries).toHaveLength(1);
    expect(entries[0].key).toBe('FOO');
  });

  it('strips surrounding quotes from values', () => {
    const entries = parseEnvContent('A="hello world"\nB=\'single\'\nC=`backtick`');
    expect(entries[0].value).toBe('hello world');
    expect(entries[1].value).toBe('single');
    expect(entries[2].value).toBe('backtick');
  });

  it('marks secrets based on secretPatterns', () => {
    const input = 'DB_PASSWORD=secret123\nAPP_NAME=myapp';
    const entries = parseEnvContent(input, {
      secretPatterns: [/password/i, /secret/i],
    });
    expect(entries[0].isSecret).toBe(true);
    expect(entries[1].isSecret).toBe(false);
  });

  it('throws in strict mode on invalid lines', () => {
    expect(() =>
      parseEnvContent('INVALID LINE', { strict: true })
    ).toThrow(SyntaxError);
  });

  it('skips invalid lines in non-strict mode', () => {
    const entries = parseEnvContent('INVALID LINE\nFOO=bar');
    expect(entries).toHaveLength(1);
  });
});

describe('serializeEntries', () => {
  it('serializes entries back to env format', () => {
    const entries = parseEnvContent('FOO=bar\nBAZ=hello world');
    const output = serializeEntries(entries);
    expect(output).toBe('FOO=bar\nBAZ="hello world"');
  });
});

describe('groupEntries', () => {
  it('separates secrets from plain entries', () => {
    const entries = parseEnvContent('TOKEN=abc\nNAME=app', {
      secretPatterns: [/token/i],
    });
    const result = groupEntries(entries);
    expect(result.secrets).toHaveLength(1);
    expect(result.plain).toHaveLength(1);
    expect(result.secrets[0].key).toBe('TOKEN');
  });
});
