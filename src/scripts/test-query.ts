import { prisma } from "../lib/db";
import { getProductsFromDb } from "../lib/db-service";

async function main() {
  console.log("Checking products count in Supabase...");
  try {
    const totalProducts = await prisma.product.count();
    const totalOffers = await prisma.offer.count();
    const activeOffers = await prisma.offer.count({ where: { inStock: true } });
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Total Offers: ${totalOffers} (Active: ${activeOffers})`);

    const roProducts = await prisma.product.count({
      where: { targetCountries: { has: "RO" } },
    });
    const gbProducts = await prisma.product.count({
      where: { targetCountries: { has: "GB" } },
    });
    const usProducts = await prisma.product.count({
      where: { targetCountries: { has: "US" } },
    });
    const chProducts = await prisma.product.count({
      where: { targetCountries: { has: "CH" } },
    });
    const deProducts = await prisma.product.count({
      where: { targetCountries: { has: "DE" } },
    });

    console.log(`RO: ${roProducts}, GB: ${gbProducts}, US: ${usProducts}, CH: ${chProducts}, DE: ${deProducts}`);

    const sampleDE = await prisma.product.findFirst({
      where: { targetCountries: { has: "DE" } },
      include: { offers: true },
    });
    console.log("Sample DE Product in DB:", JSON.stringify(sampleDE, null, 2));

    const deWithInStock = await prisma.product.count({
      where: {
        targetCountries: { has: "DE" },
        offers: { some: { inStock: true } },
      },
    });
    console.log(`DE Products with inStock=true: ${deWithInStock}`);

    const resDE = await getProductsFromDb("DE", undefined, undefined, 10, 0);
    console.log(`getProductsFromDb(DE) -> returned ${resDE.products.length} products, totalMatched: ${resDE.totalMatched}`);

    const resRO = await getProductsFromDb("RO", undefined, undefined, 10, 0);
    console.log(`getProductsFromDb(RO) -> returned ${resRO.products.length} products, totalMatched: ${resRO.totalMatched}`);

    const resCH = await getProductsFromDb("CH", undefined, undefined, 10, 0);
    console.log(`getProductsFromDb(CH) -> returned ${resCH.products.length} products, totalMatched: ${resCH.totalMatched}`);
  } catch (err) {
    console.error("Query test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
