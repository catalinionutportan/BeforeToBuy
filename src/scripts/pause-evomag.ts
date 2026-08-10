/**
 * Soft-pause evoMAG without deleting rows (keeps import work until CDN/images OK).
 *
 *   node --env-file=.env.local --import tsx src/scripts/pause-evomag.ts
 *   node --env-file=.env.local --import tsx src/scripts/pause-evomag.ts --resume
 */
import { prisma } from "../lib/db";

async function main() {
  const resume = process.argv.includes("--resume");
  const inStock = resume;

  const result = await prisma.offer.updateMany({
    where: { feedMerchantId: "ro-evomag" },
    data: { inStock },
  });

  console.log(
    resume
      ? `Resumed evoMAG: set inStock=true on ${result.count} offer(s).`
      : `Paused evoMAG: set inStock=false on ${result.count} offer(s). Data kept.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
