import { prisma } from "../lib/db";
import { getCategoryCountsFromDb } from "../lib/db-service";

async function main() {
  console.log("Checking Romanian products, merchants and categories in DB...");
  const roStores = await prisma.offer.findMany({
    where: {
      product: { targetCountries: { has: "RO" } },
    },
    distinct: ["storeName", "feedMerchantId"],
    select: { storeName: true, feedMerchantId: true },
  });
  console.log("RO Stores in DB:", roStores);

  const roCategories = await prisma.product.findMany({
    where: { targetCountries: { has: "RO" } },
    distinct: ["category"],
    select: { category: true },
  });
  console.log("RO Categories in DB:", roCategories.map((c) => c.category));

  const countsRO = await getCategoryCountsFromDb("RO");
  console.log("RO Category Counts:", countsRO.categoryCounts);
}

main().catch(console.error);
