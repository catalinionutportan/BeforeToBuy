import { getCategoryCoverImagesFromDb, getCategoryCountsFromDb } from "../lib/db-service";
import { resolveShortcutBoards } from "../lib/browse-shortcut-boards";

async function main() {
  console.log("Testing RO covers and shortcut boards...");
  const countsRO = await getCategoryCountsFromDb("RO");
  const coversRO = await getCategoryCoverImagesFromDb("RO");
  console.log("RO Covers count:", Object.keys(coversRO).length);
  const boardsRO = resolveShortcutBoards("RO", countsRO.categoryCounts, coversRO);
  console.log(`RO Boards: ${boardsRO.length} board(s) resolved`);
  for (const b of boardsRO) {
    console.log(`- Board: ${b.id} (${b.titleKey}) with ${b.tiles.length} tiles:`, b.tiles);
  }
}

main().catch(console.error);
