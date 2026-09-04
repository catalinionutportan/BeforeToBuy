import { PrismaClient } from "@prisma/client";

import { mapToBeforeToBuyCategoryWithMetadata } from "@/lib/category-mapper";

type AuditRow = {
  id: string;
  title: string;
  brand: string | null;
  category: string;
  offers: Array<{
    feedMerchantId: string | null;
    merchantProductId: string | null;
  }>;
};

type DryRunEntry = {
  market: "CH" | "GB" | "US";
  merchantId: "ch-acer" | "gb-seentat" | "us-dji";
  productId: string;
  merchantProductId: string | null;
  title: string;
  databaseCategory: string;
  previousRuleProposal: string;
  correctedRuleProposal: string;
  databaseWrite: false;
  reason: string;
};

const ACER_SERVICE_RE =
  /^\s*\d+\s+(?:jahre?|years?)\s+(?:einsende(?:-\/r[uü]cksendeservice|service)|r[uü]cksendeservice|garantieverl[aä]ngerung|warranty\s+extension|serviceverl[aä]ngerung)\b/i;
const CASIO_GSHOCK_RE = /\b(?:casio\s+)?g-?shock\b/i;
const DJI_STABILIZER_ECOSYSTEM_RE = /\bdji\s+(?:rs|om)\b/i;

function legacyAcerTitleProposal(title: string): string {
  if (/\b(projektor|projector|beamer)\b/i.test(title)) return "tv-projectors";
  if (/\b(monitor|monitore|display)\b/i.test(title)) return "notebooks-monitors";
  if (/\b(desktop|veriton|aspire\s+tc|predator\s+orion|all-?in-?one)\b/i.test(title)) {
    return "notebooks-desktops";
  }
  if (/\b(tablet|iconia)\b/i.test(title)) return "notebooks-tablets-pc";
  if (/\b(docking|dock\b|usb-?c\s+hub)\b/i.test(title)) return "computers-docks";
  if (/\b(notebook|laptop|ultrabook|chromebook|swift|spin|travelmate|aspire)\b/i.test(title)) {
    return "notebooks-laptops";
  }
  return "notebooks-laptops";
}

function legacyDjiTitleProposal(title: string): string {
  if (/\b(osmo\s+action|osmo\s+360|action\s+\d|action\s+cam)\b/i.test(title)) {
    return "photo-action";
  }
  if (/\b(osmo\s+pocket|pocket\s+\d)\b/i.test(title)) return "photo-action";
  if (/\b(osmo\s+mobile|ronin|\brs\s*[2345]\b|gimbal|om\s*[4567])\b/i.test(title)) {
    return "photo-gimbals";
  }
  if (/\b(mic\s*(mini|2|3)?|wireless\s+mic)\b/i.test(title)) return "photo-microphones";
  if (/\b(power\s*(500|1000|2000)|power\s+station)\b/i.test(title)) {
    return "outdoor-electronics";
  }
  if (/\b(sd\s*card|microsd|cinssd|memory\s+card)\b/i.test(title)) return "photo-memory";
  if (/\b(inspire|mavic|mini\s*\d|air\s*\d|neo|flip|avata|phantom|fpv|quadcopter|\bdrone\b)\b/i.test(title)) {
    return "drones-quadcopters";
  }
  if (/\b(battery|charging|propeller|prop\b|cable|hub|adaptor|adapter)\b/i.test(title)) {
    return "drones-accessories";
  }
  return "drones-quadcopters";
}

function merchantProductId(row: AuditRow, merchantId: DryRunEntry["merchantId"]): string | null {
  return row.offers.find((offer) => offer.feedMerchantId === merchantId)?.merchantProductId ?? null;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    // Read-only by design: this script contains no create/update/delete/upsert calls.
    const rows = (await prisma.product.findMany({
      where: {
        offers: {
          some: { feedMerchantId: { in: ["ch-acer", "gb-seentat", "us-dji"] } },
        },
      },
      select: {
        id: true,
        title: true,
        brand: true,
        category: true,
        offers: {
          where: { feedMerchantId: { in: ["ch-acer", "gb-seentat", "us-dji"] } },
          select: { feedMerchantId: true, merchantProductId: true },
        },
      },
      orderBy: { id: "asc" },
    })) as AuditRow[];

    const entries: DryRunEntry[] = [];

    for (const row of rows) {
      if (row.offers.some((offer) => offer.feedMerchantId === "ch-acer") && ACER_SERVICE_RE.test(row.title)) {
        const corrected = mapToBeforeToBuyCategoryWithMetadata({
          merchantId: "ch-acer",
          title: row.title,
          brand: row.brand ?? undefined,
        }).categoryId;
        const previous = legacyAcerTitleProposal(row.title);
        if (previous !== corrected) {
          entries.push({
            market: "CH",
            merchantId: "ch-acer",
            productId: row.id,
            merchantProductId: merchantProductId(row, "ch-acer"),
            title: row.title,
            databaseCategory: row.category,
            previousRuleProposal: previous,
            correctedRuleProposal: corrected,
            databaseWrite: false,
            reason: "A warranty/service contract mentions covered hardware but is not that hardware.",
          });
        }
      }

      if (
        row.offers.some((offer) => offer.feedMerchantId === "gb-seentat") &&
        CASIO_GSHOCK_RE.test(row.title)
      ) {
        const corrected = mapToBeforeToBuyCategoryWithMetadata({
          merchantId: "gb-seentat",
          title: row.title,
          brand: row.brand ?? undefined,
        }).categoryId;
        if (corrected !== "wearables-smartwatch") {
          entries.push({
            market: "GB",
            merchantId: "gb-seentat",
            productId: row.id,
            merchantProductId: merchantProductId(row, "gb-seentat"),
            title: row.title,
            databaseCategory: row.category,
            previousRuleProposal: "wearables-smartwatch",
            correctedRuleProposal: corrected,
            databaseWrite: false,
            reason: "G-Shock alone does not prove smartwatch functionality; no ordinary-watch leaf exists.",
          });
        }
      }

      if (
        row.offers.some((offer) => offer.feedMerchantId === "us-dji") &&
        DJI_STABILIZER_ECOSYSTEM_RE.test(row.title)
      ) {
        const corrected = mapToBeforeToBuyCategoryWithMetadata({
          merchantId: "us-dji",
          title: row.title,
          brand: row.brand ?? undefined,
        }).categoryId;
        const previous = legacyDjiTitleProposal(row.title);
        if (previous !== corrected) {
          entries.push({
            market: "US",
            merchantId: "us-dji",
            productId: row.id,
            merchantProductId: merchantProductId(row, "us-dji"),
            title: row.title,
            databaseCategory: row.category,
            previousRuleProposal: previous,
            correctedRuleProposal: corrected,
            databaseWrite: false,
            reason: "DJI RS/OM identifies a handheld stabilizer ecosystem, not a drone accessory.",
          });
        }
      }
    }

    const byMarket = Object.fromEntries(
      (["CH", "GB", "US"] as const).map((market) => [
        market,
        entries.filter((entry) => entry.market === market).length,
      ])
    );

    process.stdout.write(
      `${JSON.stringify(
        {
          mode: "read-only-dry-run",
          databaseWrites: 0,
          scannedRows: rows.length,
          affectedRows: entries.length,
          databaseRowsNeedingWrite: entries.filter(
            (entry) => entry.databaseCategory !== entry.correctedRuleProposal
          ).length,
          affectedRowsByMarket: byMarket,
          entries,
        },
        null,
        2
      )}\n`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
