import { describe, expect, it } from "vitest";
import {
  deriveRowDeliveryFields,
  isExplicitFreeDelivery,
  looksLikeDeliveryTime,
  parseOptionalDeliveryCost,
} from "@/lib/offers/delivery-cost";

describe("delivery-cost semantics", () => {
  it("treats null/undefined as unknown, not free", () => {
    expect(isExplicitFreeDelivery(undefined)).toBe(false);
    expect(isExplicitFreeDelivery(null)).toBe(false);
  });

  it("accepts explicit zero or negative as free delivery", () => {
    expect(isExplicitFreeDelivery(0)).toBe(true);
    expect(isExplicitFreeDelivery(-1)).toBe(true);
    expect(isExplicitFreeDelivery(0.01)).toBe(false);
  });

  it("derives totalPrice only from explicit monetary cost columns", () => {
    expect(deriveRowDeliveryFields({ price: "100" }, 100)).toEqual({});
    expect(
      deriveRowDeliveryFields({ price: "100", delivery_cost: "0" }, 100)
    ).toEqual({ deliveryCost: 0, totalPrice: 100 });
    expect(
      deriveRowDeliveryFields({ price: "100", shipping_cost: "9.9" }, 100)
    ).toEqual({ deliveryCost: 9.9, totalPrice: 109.9 });
    expect(deriveRowDeliveryFields({ price: "100", shipping: "5.00" }, 100)).toEqual(
      {}
    );
    expect(deriveRowDeliveryFields({ price: "100", delivery: "4.50" }, 100)).toEqual(
      {}
    );
  });

  it("maps free/gratis/gratuit in explicit cost columns to zero", () => {
    expect(parseOptionalDeliveryCost("free")).toBe(0);
    expect(parseOptionalDeliveryCost("GRATIS")).toBe(0);
    expect(parseOptionalDeliveryCost("gratuit")).toBe(0);
    expect(
      deriveRowDeliveryFields({ delivery_cost: "gratis" }, 50)
    ).toEqual({ deliveryCost: 0, totalPrice: 50 });
  });

  it("rejects delivery-time phrases as monetary costs", () => {
    for (const sample of [
      "2-3 working days",
      "1-2 zile",
      "delivery in 3 days",
      "2-5 zile lucratoare",
    ]) {
      expect(looksLikeDeliveryTime(sample)).toBe(true);
      expect(parseOptionalDeliveryCost(sample)).toBeUndefined();
      expect(
        deriveRowDeliveryFields({ delivery_cost: sample }, 100)
      ).toEqual({});
    }
  });

  it("stores generic delivery/shipping cells as deliveryTime when they look temporal", () => {
    expect(
      deriveRowDeliveryFields({ delivery: "2-3 working days" }, 100)
    ).toEqual({ deliveryTime: "2-3 working days" });
    expect(
      deriveRowDeliveryFields({ shipping: "1-2 zile" }, 100)
    ).toEqual({ deliveryTime: "1-2 zile" });
  });

  it("parses numeric monetary strings in explicit columns", () => {
    expect(parseOptionalDeliveryCost("9,90")).toBe(9.9);
    expect(parseOptionalDeliveryCost("")).toBeUndefined();
  });
});
