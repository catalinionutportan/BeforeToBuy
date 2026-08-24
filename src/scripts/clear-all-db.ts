import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  console.log('Deleting ALL offers...');
  await prisma.offer.deleteMany({});
  console.log('Deleted all offers.');

  console.log('Deleting ALL products...');
  // We'll delete in chunks if there are many, but deleteMany({}) might work directly if it doesn't time out.
  // Let's just try deleteMany({}) first.
  try {
    const res = await prisma.product.deleteMany({});
    console.log(`Deleted ${res.count} products.`);
  } catch (e) {
    console.log("Bulk delete failed, trying chunked...", e);
    const products = await prisma.product.findMany({ select: { id: true } });
    const ids = products.map(p => p.id);
    for (let i = 0; i < ids.length; i += 1000) {
      const chunk = ids.slice(i, i + 1000);
      const res = await prisma.product.deleteMany({
        where: { id: { in: chunk } }
      });
      console.log(`Deleted chunk of ${res.count} products...`);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
