import { prisma } from "../lib/db";

async function main() {
  const prods = await prisma.product.findMany({
    where: {
      targetCountries: { has: "RO" },
      category: "care-hair-styling",
    },
    take: 5,
    select: { id: true, title: true, image: true },
  });
  console.log("Care hair styling images:", prods);
}

main().catch(console.error);
