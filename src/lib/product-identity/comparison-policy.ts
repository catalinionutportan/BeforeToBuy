/**
 * BeforeToBuy comparison policy (Switzerland launch).
 *
 * 1) Common denominator: one internal product = one identity key.
 *    Primary key: GTIN/EAN. Variant dimensions (storage, color, …) stay in variantKey.
 *
 * 2) Multi-merchant offers: that single product may hold offers from every Swiss
 *    merchant in the domestic registry (currently 9). Missing merchant ≠ new product;
 *    it means “no offer / not in feed yet” for that store.
 *
 * 3) Category: assigned once on the product (BeforeToBuy leaf subcategory), not
 *    copied from each merchant aisle. New products must land in the correct leaf.
 *
 * 4) Language ≠ market: shopping country (CH + CHF + Swiss stores) is independent
 *    from UI language (DE/FR/IT/EN in Switzerland).
 */

export const CH_DOMESTIC_MERCHANT_COUNT = 9;

export const PRODUCT_IDENTITY_PRIMARY = "gtin" as const;
