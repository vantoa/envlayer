import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface WatchEvent {
  filePath: string;
  layer: string;
  timestamp: Date;
  type: 'change' | 'rename' | 'delete';
}

export interface WatcherOptions {
  debounceMs?: number;
  recursive?: boolean;
}

const DEFAULT_DEBOUNCE_MS = 300;

export function createWatcher(
  filePaths: string[],
  options: WatcherOptions = {}
): EventEmitter {
  const emitter = new EventEmitter();
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  for (const filePath of filePaths) {
    const layer = path.basename(filePath, path.extname(filePath));

    if (!fs.existsSync(filePath)) {
      emitter.emit('error', new Error(`File not found: ${filePath}`));
      continue;
    }

    const watcher = fs.watch(filePath, (eventType) => {
      const existing = timers.get(filePath);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        timers.delete(filePath);
        const type = eventType === 'rename'
          ? (fs.existsSync(filePath) ? 'rename' : 'delete')
          : 'change';

        const event: WatchEvent = {
          filePath,
          layer,
          timestamp: new Date(),
          type,
        };

        emitter.emit('change', event);
      }, debounceMs);

      timers.set(filePath, timer);
    });

    watcher.on('error', (err) => emitter.emit('error', err));

    emitter.on('stop', () => {
      watcher.close();
      const t = timers.get(filePath);
      if (t) clearTimeout(t);
    });
  }

  return emitter;
}

export function stopWatcher(emitter: EventEmitter): void {
  emitter.emit('stop');
  emitter.removeAllListeners();
}
