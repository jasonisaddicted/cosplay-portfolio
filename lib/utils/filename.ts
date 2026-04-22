/**
 * Extract cosplayer name from filename
 * Supports multiple patterns:
 * - coser_name_1, coser-1, web-_coser-1, web__coser__1
 * - Removes " (N)" patterns that indicate duplicate files
 * - Removes metadata suffixes like -vfx, -edr, -copy
 * - Splits multiple cosplayers with " & "
 */
export function extractCoserFromFilename(filename: string): string {
  if (!filename) return '';

  // Remove file extension
  let name = filename.replace(/\.[^/.]+$/, '');

  // Remove " (N)" patterns (duplicate file indicators) from anywhere in filename
  name = name.replace(/\s+\(\d+\)/g, '').trim();

  // Remove metadata suffixes: -vfx, -edr, -copy, -final, -v1, -v2, -original, -backup, etc.
  name = name.replace(/-(?:vfx|edr|copy|final|original|backup|v\d+)(?:\s|$)/gi, ' ').trim();

  // Pattern 1: coser_name_1 or coser_name_123
  const pattern1 = name.match(/^(.+?)_(\d+)$/);
  if (pattern1) return pattern1[1].replace(/_/g, ' ').trim();

  // Pattern 2: coser-1, coser-123
  const pattern2 = name.match(/^(.+?)-(\d+)$/);
  if (pattern2) return pattern2[1].replace(/-/g, ' ').trim();

  // Pattern 3: web-_coser-name
  const pattern3 = name.match(/^web[_-](.+)$/i);
  if (pattern3) return pattern3[1].replace(/[-_]/g, ' ').trim();

  // Pattern 4: coser123.456 (extract just the name part without numeric suffix)
  const pattern4 = name.match(/^([a-z]+[\da-z]*?)\d*\.?\d*$/i);
  if (pattern4) return pattern4[1];

  // Fallback: return the entire cleaned filename
  return name;
}

/**
 * Split multiple cosplayers separated by " & "
 */
export function splitCosplayers(names: string): string[] {
  return names
    .split(/\s*&\s*/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}
