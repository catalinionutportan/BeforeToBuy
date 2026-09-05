import { prisma } from "../lib/db";
import { publishCatalogRevision } from "../lib/catalog-revision";

/** Explicit cache refresh after a legacy/manual maintenance operation, never an import. */
async function main() {
  const countries = [...new Set(process.argv
    .filter((argument) => argument.startsWith("--country="))
    .map((argument) => argument.slice("--country=".length).toUpperCase()))];
  if (!process.argv.includes("--apply") || countries.length === 0 || countries.some((code) => !["CH", "DE", "GB", "US", "RO"].includes(code))) {
    throw new Error("Use --apply and explicit --country=CH (repeat for every affected supported market).");
  }
  try {
    await prisma.$transaction((tx) => publishCatalogRevision(tx, countries));
    console.log(`Published catalogue revision for ${countries.join(", ")}. No product/offer data changed.`);
  } finally { await prisma.$disconnect(); }
}
void main().catch(() => { console.error("Catalogue revision publication failed"); process.exitCode = 1; });
