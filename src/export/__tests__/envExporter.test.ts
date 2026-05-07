import { exportEntries } from '../envExporter';
import { exportEnv, exportEnvMap } from '../index';
import { EnvEntry } from '../../parser/types';

const sampleEntries: EnvEntry[] = [
  { type: 'comment', raw: '# App config', key: undefined, value: undefined },
  { type: 'entry', key: 'APP_NAME', value: 'envlayer', raw: 'APP_NAME=envlayer' },
  { type: 'entry', key: 'PORT', value: '3000', raw: 'PORT=3000' },
  { type: 'entry', key: 'DB_PASSWORD', value: 's3cr3t!', raw: 'DB_PASSWORD=s3cr3t!' },
  { type: 'blank', raw: '', key: undefined, value: undefined },
  { type: 'entry', key: 'NOTE', value: 'hello world', raw: 'NOTE=hello world' },
];

describe('exportEntries - dotenv format', () => {
  it('includes comments and blank lines by default', () => {
    const result = exportEntries(sampleEntries, { format: 'dotenv' });
    expect(result).toContain('# App config');
    expect(result).toContain('APP_NAME=envlayer');
  });

  it('quotes values with spaces', () => {
    const result = exportEntries(sampleEntries, { format: 'dotenv' });
    expect(result).toContain('NOTE="hello world"');
  });

  it('omits comments when includeComments is false', () => {
    const result = exportEntries(sampleEntries, { format: 'dotenv', includeComments: false });
    expect(result).not.toContain('# App config');
    expect(result).toContain('APP_NAME=envlayer');
  });

  it('masks secrets when maskSecrets is true', () => {
    const result = exportEntries(sampleEntries, { format: 'dotenv', maskSecrets: true });
    expect(result).not.toContain('s3cr3t!');
  });
});

describe('exportEntries - json format', () => {
  it('returns valid JSON with key-value pairs', () => {
    const result = exportEntries(sampleEntries, { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed.APP_NAME).toBe('envlayer');
    expect(parsed.PORT).toBe('3000');
  });

  it('does not include comments or blanks', () => {
    const result = exportEntries(sampleEntries, { format: 'json' });
    expect(result).not.toContain('# App config');
  });
});

describe('exportEntries - shell format', () => {
  it('prefixes each line with export', () => {
    const result = exportEntries(sampleEntries, { format: 'shell' });
    expect(result).toContain('export APP_NAME="envlayer"');
    expect(result).toContain('export PORT="3000"');
  });
});

describe('exportEnvMap helper', () => {
  it('exports a plain map to dotenv format', () => {
    const result = exportEnvMap({ FOO: 'bar', BAZ: 'qux' }, 'dotenv');
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=qux');
  });

  it('exports a plain map to json format', () => {
    const result = exportEnvMap({ FOO: 'bar' }, 'json');
    expect(JSON.parse(result).FOO).toBe('bar');
  });
});

describe('exportEnv index wrapper', () => {
  it('delegates to exportEntries correctly', () => {
    const result = exportEnv(sampleEntries, 'shell');
    expect(result).toContain('export APP_NAME="envlayer"');
  });
});
