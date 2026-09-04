import { prisma } from "../lib/db";
import { classifyDeReifenProducts } from "../lib/de-reifen-category";
import { loadMerchantFeedForImport } from "../lib/merchant-feeds";

const MERCHANT_ID = "de-reifen";
const COUNTRY = "DE";
const MIN_PRODUCTS = 100_000;
const CHUNK_SIZE = 500;

async function main() {
  const { products: parsedProducts, source } = await loadMerchantFeedForImport(MERCHANT_ID);
  if (source !== "remote" || parsedProducts.length < MIN_PRODUCTS) {
    throw new Error(
      `Refusing category repair: source=${source}, count=${parsedProducts.length}`
    );
  }

  const products = classifyDeReifenProducts(parsedProducts);
  const idsByCategory = new Map<string, string[]>();
  for (const product of products) {
    const ids = idsByCategory.get(product.category) ?? [];
    ids.push(product.id);
    idsByCategory.set(product.category, ids);
  }

  let updated = 0;
  for (const [category, ids] of idsByCategory) {
    for (let index = 0; index < ids.length; index += CHUNK_SIZE) {
      const result = await prisma.product.updateMany({
        where: {
          id: { in: ids.slice(index, index + CHUNK_SIZE) },
          targetCountries: { has: COUNTRY },
        },
        data: { category },
      });
      updated += result.count;
    }
    console.log(`${category}: ${ids.length} feed products classified`);
  }

  // A previous feed revision can leave a small number of still-active rows
  // outside the current download. Keep those in the safe tyre aisle.
  const staleRows = await prisma.product.updateMany({
    where: {
      targetCountries: { has: COUNTRY },
      offers: { some: { feedMerchantId: MERCHANT_ID, inStock: true } },
      category: {
        notIn: [
          "auto-tires-wheels",
          "auto-rims",
          "auto-motorcycle-tires",
          "auto-oils-fluids",
        ],
      },
    },
    data: { category: "auto-tires-wheels" },
  });
  updated += staleRows.count;

  const counts = await prisma.product.groupBy({
    by: ["category"],
    where: {
      targetCountries: { has: COUNTRY },
      offers: { some: { inStock: true } },
    },
    _count: { _all: true },
    orderBy: { _count: { category: "desc" } },
  });
  console.log(`Updated ${updated} existing DE products.`);
  console.log(JSON.stringify(counts, null, 2));
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
