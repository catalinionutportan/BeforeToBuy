export const CONSENT_VERSION = 3;
export const CONSENT_COOKIE_NAME = "b2b_consent";
export const CONSENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
/**
 * Non-HttpOnly companion cookie mirroring the signed consent cookie above.
 * It carries no signature and is never trusted for authorization — it only lets
 * client JS detect drift between the server-visible cookie and localStorage
 * (e.g. localStorage cleared separately) so the two can be resynced, with the
 * HttpOnly cookie remaining the source of truth.
 */
export const CONSENT_CLIENT_HINT_COOKIE_NAME = "b2b_consent_hint";
