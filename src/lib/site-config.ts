/** Site-wide flags and copy for the current launch phase. */
export const SITE_PHASE = "beta-demo" as const;

/**
 * Amber beta ribbon + nav "Beta Demo" label.
 * Hidden by default (production-ready catalog). Set NEXT_PUBLIC_SHOW_BETA_BANNER=1 to show.
 */
export function isBetaBannerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_BETA_BANNER === "1";
}
