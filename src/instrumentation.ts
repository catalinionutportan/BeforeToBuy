/**
 * Server instrumentation hook (Next.js).
 * Browser RUM is initialized in `src/components/DatadogRum.tsx`.
 */
export function register() {
  if (process.env.NODE_ENV === "production") {
    const secret = process.env.CONSENT_SIGNING_SECRET;
    if (!secret || secret.length < 32) {
      // Log only — consent APIs already fail closed without a valid secret,
      // and we don't want a misconfigured env var to crash the build/boot.
      console.error(
        "[instrumentation] CONSENT_SIGNING_SECRET is missing or shorter than 32 characters. " +
          "Consent saving and location APIs will fail closed until it is set."
      );
    }
  }
}
