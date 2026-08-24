import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function run() {
  const products = await prisma.product.findMany({ select: { image: true } });
  const domains = new Set();
  products.forEach(p => {
    if (p.image) {
      try {
        domains.add(new URL(p.image).hostname);
      } catch {}
    }
  });
  console.log(Array.from(domains));
  await prisma.$disconnect();
}
run();