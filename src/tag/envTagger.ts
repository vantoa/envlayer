/**
 * envTagger.ts — Tag management for env layers
 * Allows attaching metadata tags to layers for filtering and grouping.
 */

import { TagEntry, TagMap } from './types';

let tagStore: TagMap = {};

export function generateTagId(): string {
  return `tag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addTag(layer: string, tag: string, meta?: Record<string, string>): TagEntry {
  if (!tagStore[layer]) {
    tagStore[layer] = [];
  }

  const existing = tagStore[layer].find((t) => t.tag === tag);
  if (existing) {
    return existing;
  }

  const entry: TagEntry = {
    id: generateTagId(),
    layer,
    tag,
    meta: meta ?? {},
    createdAt: new Date().toISOString(),
  };

  tagStore[layer].push(entry);
  return entry;
}

export function removeTag(layer: string, tag: string): boolean {
  if (!tagStore[layer]) return false;
  const before = tagStore[layer].length;
  tagStore[layer] = tagStore[layer].filter((t) => t.tag !== tag);
  return tagStore[layer].length < before;
}

export function getTagsForLayer(layer: string): TagEntry[] {
  return tagStore[layer] ?? [];
}

export function getLayersForTag(tag: string): string[] {
  return Object.entries(tagStore)
    .filter(([, entries]) => entries.some((e) => e.tag === tag))
    .map(([layer]) => layer);
}

export function hasTag(layer: string, tag: string): boolean {
  return (tagStore[layer] ?? []).some((t) => t.tag === tag);
}

export function clearTagsForLayer(layer: string): void {
  delete tagStore[layer];
}

export function resetTagStore(): void {
  tagStore = {};
}

export function getAllTags(): TagMap {
  return { ...tagStore };
}
