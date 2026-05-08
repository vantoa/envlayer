import { EventEmitter } from 'events';
import { createWatcher, stopWatcher, WatchEvent, WatcherOptions } from './envWatcher';
import { logAction } from '../audit/index';

export type ChangeHandler = (event: WatchEvent) => void;
export type ErrorHandler = (err: Error) => void;

let activeWatcher: EventEmitter | null = null;

export function watchEnvFiles(
  filePaths: string[],
  onChange: ChangeHandler,
  onError?: ErrorHandler,
  options?: WatcherOptions
): EventEmitter {
  if (activeWatcher) {
    stopWatcher(activeWatcher);
  }

  const watcher = createWatcher(filePaths, options);

  watcher.on('change', (event: WatchEvent) => {
    logAction('watch:change', event.layer, {
      filePath: event.filePath,
      type: event.type,
    });
    onChange(event);
  });

  watcher.on('error', (err: Error) => {
    logAction('watch:error', 'unknown', { message: err.message });
    if (onError) onError(err);
  });

  activeWatcher = watcher;
  return watcher;
}

export function stopWatching(): void {
  if (activeWatcher) {
    stopWatcher(activeWatcher);
    activeWatcher = null;
  }
}

export function isWatching(): boolean {
  return activeWatcher !== null;
}

export { WatchEvent, WatcherOptions };
