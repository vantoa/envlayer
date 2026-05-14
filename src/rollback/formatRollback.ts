import { RollbackEntry, RollbackResult } from "./types";

function formatDate(ts: number): string {
  return new Date(ts).toISOString();
}

export function formatRollbackEntry(entry: RollbackEntry): string {
  const lines: string[] = [
    `[${entry.id}] Layer: ${entry.layerId}`,
    `  Timestamp : ${formatDate(entry.timestamp)}`,
    `  Keys (prev): ${Object.keys(entry.previousMap).length}`,
    `  Keys (curr): ${Object.keys(entry.currentMap).length}`,
  ];
  if (entry.description) {
    lines.push(`  Description: ${entry.description}`);
  }
  return lines.join("\n");
}

export function formatRollbackList(entries: RollbackEntry[]): string {
  if (entries.length === 0) return "No rollback points recorded.";
  return entries.map(formatRollbackEntry).join("\n\n");
}

export function formatRollbackResult(result: RollbackResult): string {
  const lines: string[] = [
    `Rollback ${result.success ? "succeeded" : "failed"} for layer: ${result.layerId}`,
    `  Entry ID     : ${result.entryId}`,
    `  Restored keys: ${result.restoredKeys.join(", ") || "none"}`,
    `  Added keys   : ${result.addedKeys.join(", ") || "none"}`,
    `  Removed keys : ${result.removedKeys.join(", ") || "none"}`,
  ];
  return lines.join("\n");
}
