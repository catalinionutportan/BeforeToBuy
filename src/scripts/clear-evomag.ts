import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  console.log('Deleting evoMAG offers...');
  await prisma.offer.deleteMany({
    where: { storeName: 'evoMAG.ro' }
  });
  console.log('Deleted evoMAG offers.');

  console.log('Finding products with no offers...');
  const productsToDelete = await prisma.product.findMany({
    where: { offers: { none: {} } },
    select: { id: true }
  });
  const ids = productsToDelete.map(p => p.id);
  
  let deletedCount = 0;
  for (let i = 0; i < ids.length; i += 1000) {
    const chunk = ids.slice(i, i + 1000);
    const res = await prisma.product.deleteMany({
      where: { id: { in: chunk } }
    });
    deletedCount += res.count;
    console.log(`Deleted chunk of ${res.count} orphan products...`);
  }
  
  console.log(`Deleted total ${deletedCount} orphan products (including evoMAG).`);
}

run().catch(console.error).finally(() => prisma.$disconnect());