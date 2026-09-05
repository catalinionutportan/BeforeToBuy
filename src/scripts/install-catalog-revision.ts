import { readFileSync } from "node:fs";
import { prisma } from "../lib/db";

async function main() {
  if (!process.argv.includes("--apply")) throw new Error("Pass --apply to install the additive CatalogRevision table.");
  const sql = readFileSync("scripts/migrations/20260905-catalog-revision.sql", "utf8");
  try {
    await prisma.$transaction(async (tx) => {
      for (const statement of sql.split(";").map((part) => part.trim()).filter(Boolean)) {
        await tx.$executeRawUnsafe(statement);
      }
    });
    console.log("CatalogRevision table installed with row-level security. Product/Offer data unchanged.");
  } finally { await prisma.$disconnect(); }
}
void main().catch(() => { console.error("CatalogRevision installation failed"); process.exitCode = 1; });
