import {
  addTag,
  removeTag,
  getTagsForLayer,
  getLayersForTag,
  listAllTags,
  clearTagsForLayer,
  clearAllTags,
} from './envTagger';
import { TagEntry } from './types';

export function tagLayer(layerId: string, tag: string, meta?: Record<string, string>): TagEntry {
  return addTag(layerId, tag, meta);
}

export function untagLayer(layerId: string, tag: string): boolean {
  return removeTag(layerId, tag);
}

export function getLayerTags(layerId: string): TagEntry[] {
  return getTagsForLayer(layerId);
}

export function findLayersByTag(tag: string): string[] {
  return getLayersForTag(tag);
}

export function getAllTags(): TagEntry[] {
  return listAllTags();
}

export function hasTag(layerId: string, tag: string): boolean {
  const tags = getTagsForLayer(layerId);
  return tags.some((t) => t.tag === tag);
}

export function clearLayer(layerId: string): void {
  clearTagsForLayer(layerId);
}

export function resetTags(): void {
  clearAllTags();
}

export function getTagSummary(): Record<string, string[]> {
  const all = listAllTags();
  const summary: Record<string, string[]> = {};
  for (const entry of all) {
    if (!summary[entry.tag]) {
      summary[entry.tag] = [];
    }
    if (!summary[entry.tag].includes(entry.layerId)) {
      summary[entry.tag].push(entry.layerId);
    }
  }
  return summary;
}
