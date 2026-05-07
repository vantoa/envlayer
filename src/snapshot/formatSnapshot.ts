import { SnapshotDiff, SnapshotComparison } from "./types";

export function formatSnapshotList(comparisons: SnapshotComparison[]): string {
  if (comparisons.length === 0) return "No snapshots found.";

  const lines = comparisons.map((c) => {
    const date = new Date(c.timestamp).toISOString();
    return `[${c.snapshotId.slice(0, 8)}] ${c.label} | layer: ${c.layer} | keys: ${c.keyCount} | ${date}`;
  });

  return lines.join("\n");
}

export function formatSnapshotDiff(diff: SnapshotDiff): string {
  const lines: string[] = [
    `Snapshot diff: "${diff.from.label}" → "${diff.to.label}"`,
    `From: ${new Date(diff.from.timestamp).toISOString()}`,
    `To:   ${new Date(diff.to.timestamp).toISOString()}`,
    "",
  ];

  if (diff.added.length > 0) {
    lines.push("Added:");
    diff.added.forEach((k) => lines.push(`  + ${k}=${diff.to.entries[k]}`));
  }

  if (diff.removed.length > 0) {
    lines.push("Removed:");
    diff.removed.forEach((k) => lines.push(`  - ${k}=${diff.from.entries[k]}`));
  }

  if (diff.changed.length > 0) {
    lines.push("Changed:");
    diff.changed.forEach((k) =>
      lines.push(`  ~ ${k}: ${diff.from.entries[k]} → ${diff.to.entries[k]}`)
    );
  }

  if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
    lines.push("No differences found.");
  }

  return lines.join("\n");
}
