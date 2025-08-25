import path from 'path';

/**
 * Strip off the first folder segment (and its separator) from a path.
 * Works on both POSIX and Windows-style paths.
 */
export function stripFirstFolder(fullPath: string): string {
  // Normalize separators (turn mixed "/" and "\" into the platform default)
  const normalized = path.normalize(fullPath);

  // Split into segments
  const parts = normalized.split(path.sep);

  // If there's only one segment (no folder separators), return as-is
  if (parts.length <= 1) {
    return normalized;
  }

  // Re-join all but the first segment
  return path.join(...parts.slice(1));
}
