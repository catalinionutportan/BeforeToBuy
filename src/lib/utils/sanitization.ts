export function sanitizeString(input: string): string {
  // Basic sanitization: encode HTML entities to prevent XSS.
  // This is a minimal example; a more robust solution might use a dedicated library.
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"' : '&quot;',
    "'" : '&#039;',
  };
  return input.replace(/[&<>'"]/g, (char) => map[char]);
}

/**
 * Strips characters with no place in free-text search/query input (as opposed to
 * `sanitizeString`, which HTML-escapes rather than removes). Shared by the search
 * box and the products API so both apply the same rule.
 */
export function stripUnsafeQueryChars(input: string): string {
  return input.replace(/[<>"'`%{};\\/]/g, "").trim();
}
