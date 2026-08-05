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
