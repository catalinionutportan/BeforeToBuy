/** Site-wide flags and copy for the current launch phase. */
export const SITE_PHASE = "beta-demo" as const;

export const DEMO_DISCLAIMER =
  "BeforeToBuy.com is in Beta/Demo. Most product listings remain illustrative demo data. Brack.ch (CH) uses a sample AWIN feed until production feeds are configured.";

export const HYBRID_DISCLAIMER =
  "Hybrid Beta: Brack.ch prices come from a live AWIN feed; other merchants remain demo catalog until connected.";

export const PRODUCTION_FEED_DISCLAIMER =
  "Hybrid Beta: Some merchant prices are loaded from live affiliate feeds; others remain demo catalog until connected.";

export const PRICE_DISCLAIMER =
  "Demo prices are indicative only. Live feed prices are sourced from merchant datafeeds — always confirm final price, availability, and shipping on the merchant website before buying.";

export const LIVE_OFFER_LABEL = "Live price";
export const DEMO_OFFER_LABEL = "Demo price";
