import type { Product } from "@/types";

export const DE_REIFEN_CAR_TYRES_LEAF = "auto-tires-wheels";
export const DE_REIFEN_RIMS_LEAF = "auto-rims";
export const DE_REIFEN_MOTORCYCLE_TYRES_LEAF = "auto-motorcycle-tires";

const AWIN_NO_IMAGE_PATH = "/noimage.gif";

const DIAGONAL_TYRE_SIZE_RE =
  /^\s*(\d+(?:\.\d+)?)(?:\/(\d+))?\s+[BD](\d{1,2})(?:\s+(\d{2,3}))?/i;
const ATV_TYRE_SIZE_RE =
  /^\s*(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\s+[BDR](\d{1,2})\b/i;

function normalizedModelTitle(title: string): string {
  return title.trim().toLocaleLowerCase();
}

/** Exclude AWIN's successful-but-empty image response from the DE catalogue. */
export function hasUsableDeReifenImage(product: Pick<Product, "image">): boolean {
  const image = product.image?.trim();
  if (!image) return false;

  try {
    const url = new URL(image);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.pathname.toLocaleLowerCase() !== AWIN_NO_IMAGE_PATH
    );
  } catch {
    return false;
  }
}

/** Strong size signal for motorcycle/scooter bias-ply tyres. */
export function looksLikeMotorcycleTyreSize(description: string): boolean {
  const match = description.match(DIAGONAL_TYRE_SIZE_RE);
  if (!match) return false;
  const width = Number(match[1]);
  const rim = Number(match[3]);
  const loadIndex = match[4] ? Number(match[4]) : 0;
  const plausibleWidth = width <= 10 || width <= 200;
  return plausibleWidth && rim >= 8 && rim <= 23 && (loadIndex === 0 || loadIndex <= 90);
}

/** ATV/quad flotation sizes, excluding 31+ inch 4x4 passenger tyres. */
export function looksLikeAtvTyreSize(description: string): boolean {
  const match = description.match(ATV_TYRE_SIZE_RE);
  if (!match) return false;
  const diameter = Number(match[1]);
  const width = Number(match[2]);
  const rim = Number(match[3]);
  return (
    diameter >= 15 &&
    diameter <= 30 &&
    width >= 5 &&
    width <= 12.5 &&
    rim >= 8 &&
    rim <= 14
  );
}

/**
 * Reifen.de does not provide a motorcycle aisle. Build a model set from its
 * reliable D/B and ATV size rows, then include radial sizes of the same model.
 */
export function classifyDeReifenProducts(products: Product[]): Product[] {
  const motorcycleModels = new Set(
    products
      .filter(
        (product) =>
          product.category === DE_REIFEN_CAR_TYRES_LEAF &&
          (looksLikeMotorcycleTyreSize(product.description) ||
            looksLikeAtvTyreSize(product.description))
      )
      .map((product) => normalizedModelTitle(product.title))
      .filter(Boolean)
  );

  return products.map((product) => {
    if (product.category !== DE_REIFEN_CAR_TYRES_LEAF) return product;
    if (!motorcycleModels.has(normalizedModelTitle(product.title))) return product;
    return { ...product, category: DE_REIFEN_MOTORCYCLE_TYRES_LEAF };
  });
}
