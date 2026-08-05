/**
 * BeforeToBuy comparison policy (Switzerland launch).
 *
 * 1) Common denominator: one internal product = one identity key.
 *    Primary key: GTIN/EAN. Variant dimensions (storage, color, …) stay in variantKey.
 *
 * 2) Multi-merchant offers: that single product *may* hold offers from every Swiss
 *    merchant in the domestic registry (currently 9). Missing merchant ≠ new product;
 *    it means “no offer / not in feed” for that store.
 *
 * 3) Customer-facing card: show only available offers to compare. Never pad to 9
 *    empty store rows. If 3 shops list the product, the card shows 3 prices; if 7
 *    do, it shows 7. Count shrinks/grows with availability.
 *
 * 4) Category: assigned once on the product (BeforeToBuy leaf subcategory), not
 *    copied from each merchant aisle. New products must land in the correct leaf.
 *
 * 5) Language ≠ market: shopping country (CH + CHF + Swiss stores) is independent
 *    from UI language (DE/FR/IT/EN in Switzerland).
 */

export const CH_DOMESTIC_MERCHANT_COUNT = 9;

export const PRODUCT_IDENTITY_PRIMARY = "gtin" as const;
