/** Site-wide flags and copy for the current launch phase. */
export const SITE_PHASE = "beta-demo" as const;

export const DEMO_DISCLAIMER =
  "BeforeToBuy.com is in Beta/Demo. Most product listings remain illustrative demo data. Brack.ch (CH) uses a sample AWIN feed until production feeds are configured.";

export const HYBRID_DISCLAIMER =
  "Hybrid Beta: Brack.ch currently uses illustrative AWIN sample data unless a production feed is configured; other merchants remain demo catalog until connected.";

export const PRODUCTION_FEED_DISCLAIMER =
  "Hybrid Beta: Some merchant prices are loaded from live affiliate feeds; others remain demo catalog until connected.";

export const PRICE_DISCLAIMER =
  "Demo and sample prices are illustrative. Production-feed prices may be delayed — always confirm final price, availability, and shipping on the merchant website before buying.";

export const LIVE_OFFER_LABEL = "Production-feed price";
export const SAMPLE_OFFER_LABEL = "Sample price";
export const DEMO_OFFER_LABEL = "Demo price";
