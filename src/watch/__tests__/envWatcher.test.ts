import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createWatcher, stopWatcher } from '../envWatcher';
import { watchEnvFiles, stopWatching, isWatching } from '../index';

function writeTempEnv(dir: string, name: string, content: string): string {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

describe('createWatcher', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envlayer-watch-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('emits error for non-existent file', (done) => {
    const watcher = createWatcher([path.join(tmpDir, 'missing.env')]);
    watcher.on('error', (err: Error) => {
      expect(err.message).toContain('File not found');
      stopWatcher(watcher);
      done();
    });
  });

  it('emits change event when file is modified', (done) => {
    const filePath = writeTempEnv(tmpDir, '.env.test', 'KEY=value');
    const watcher = createWatcher([filePath], { debounceMs: 50 });

    watcher.on('change', (event: any) => {
      expect(event.filePath).toBe(filePath);
      expect(event.layer).toBe('.env');
      expect(event.type).toBe('change');
      expect(event.timestamp).toBeInstanceOf(Date);
      stopWatcher(watcher);
      done();
    });

    setTimeout(() => {
      fs.writeFileSync(filePath, 'KEY=updated', 'utf-8');
    }, 20);
  });
});

describe('watchEnvFiles / stopWatching', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envlayer-watch2-'));
    stopWatching();
  });

  afterEach(() => {
    stopWatching();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('isWatching returns false initially', () => {
    expect(isWatching()).toBe(false);
  });

  it('isWatching returns true after watchEnvFiles', () => {
    const filePath = writeTempEnv(tmpDir, '.env.base', 'A=1');
    watchEnvFiles([filePath], () => {});
    expect(isWatching()).toBe(true);
  });

  it('isWatching returns false after stopWatching', () => {
    const filePath = writeTempEnv(tmpDir, '.env.base', 'A=1');
    watchEnvFiles([filePath], () => {});
    stopWatching();
    expect(isWatching()).toBe(false);
  });

  it('calls onChange handler on file change', (done) => {
    const filePath = writeTempEnv(tmpDir, '.env.dev', 'X=1');
    watchEnvFiles([filePath], (event) => {
      expect(event.layer).toBe('.env');
      done();
    }, undefined, { debounceMs: 50 });

    setTimeout(() => {
      fs.writeFileSync(filePath, 'X=2', 'utf-8');
    }, 20);
  });
});
