import type { Offer } from "@/types";

/** Phase-1 total price: list price + reported delivery (excl. VAT/customs). */
export function computeTotalPrice(offer: Pick<Offer, "price" | "deliveryCost">): number {
  return roundMoney(offer.price + (offer.deliveryCost ?? 0));
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function enrichOfferPricing(offer: Offer): Offer {
  const totalPrice = computeTotalPrice(offer);
  return {
    ...offer,
    totalPrice,
  };
}

export function sortOffersByTotalPrice(offers: Offer[]): Offer[] {
  return [...offers].sort((a, b) => {
    const totalA = a.totalPrice ?? computeTotalPrice(a);
    const totalB = b.totalPrice ?? computeTotalPrice(b);
    if (totalA !== totalB) return totalA - totalB;
    return a.price - b.price;
  });
}

export function getLowestTotalOffer(offers: Offer[]): Offer | undefined {
  return sortOffersByTotalPrice(offers)[0];
}
