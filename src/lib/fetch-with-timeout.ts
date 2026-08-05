/**
 * Fetch with timeout + limited retries for external HTTP calls.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: { timeoutMs?: number; retries?: number; retryDelayMs?: number } = {}
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const retries = options.retries ?? 2;
  const retryDelayMs = options.retryDelayMs ?? 400;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      // Retry transient upstream failures
      if (response.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
        continue;
      }

      return response;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("fetchWithTimeout failed");
}
