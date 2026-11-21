export interface DiffSegment {
  type: "equal" | "added" | "removed";
  value: string;
}

function tokenize(text: string): string[] {
  // Split into words, punctuation, and whitespace tokens so formatting is preserved cleanly
  return text.match(/\S+|\s+/g) ?? [];
}

/**
 * Computes a word-level diff between original and rewritten text using Myers/LCS dynamic programming.
 * Merges consecutive segments of the same type for clean rendering.
 */
export function computeWordDiff(originalText: string, rewrittenText: string): DiffSegment[] {
  const a = tokenize(originalText);
  const b = tokenize(rewrittenText);

  // Guard for very large texts to keep diff computation instantaneous
  if (a.length * b.length > 400_000) {
    return [
      { type: "removed", value: originalText },
      { type: "added", value: rewrittenText },
    ];
  }

  const m = a.length;
  const n = b.length;

  // Use typed arrays for compact, fast LCS table
  const dp = new Uint16Array((m + 1) * (n + 1));
  const width = n + 1;

  for (let i = m - 1; i >= 0; i--) {
    const rowOffset = i * width;
    const nextRowOffset = (i + 1) * width;
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[rowOffset + j] = dp[nextRowOffset + j + 1] + 1;
      } else {
        const down = dp[nextRowOffset + j];
        const right = dp[rowOffset + j + 1];
        dp[rowOffset + j] = down >= right ? down : right;
      }
    }
  }

  const raw: DiffSegment[] = [];
  let i = 0;
  let j = 0;

  while (i < m && j < n) {
    if (a[i] === b[j]) {
      raw.push({ type: "equal", value: a[i] });
      i++;
      j++;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + j + 1]) {
      raw.push({ type: "removed", value: a[i] });
      i++;
    } else {
      raw.push({ type: "added", value: b[j] });
      j++;
    }
  }

  while (i < m) {
    raw.push({ type: "removed", value: a[i] });
    i++;
  }

  while (j < n) {
    raw.push({ type: "added", value: b[j] });
    j++;
  }

  // Merge adjacent segments of the same kind
  const merged: DiffSegment[] = [];
  for (const seg of raw) {
    const last = merged[merged.length - 1];
    if (last && last.type === seg.type) {
      last.value += seg.value;
    } else {
      merged.push({ ...seg });
    }
  }

  return merged;
}
