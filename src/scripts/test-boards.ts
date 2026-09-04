import { getCategoryCoverImagesFromDb } from "../lib/db-service";
import { resolveShortcutBoards } from "../lib/browse-shortcut-boards";
import { getCategoryCountsFromDb } from "../lib/db-service";

async function main() {
  console.log("Testing DE covers and shortcut boards...");
  const countsDE = await getCategoryCountsFromDb("DE");
  const coversDE = await getCategoryCoverImagesFromDb("DE");
  console.log("DE Counts:", countsDE.categoryCounts);
  console.log("DE Covers:", coversDE);
  const boardsDE = resolveShortcutBoards("DE", countsDE.categoryCounts, coversDE);
  console.log(`DE Boards: ${boardsDE.length} board(s) resolved`);
  for (const b of boardsDE) {
    console.log(`- Board: ${b.id} (${b.titleKey}) with ${b.tiles.length} tiles:`, b.tiles);
  }

  console.log("\nTesting CH covers and shortcut boards...");
  const countsCH = await getCategoryCountsFromDb("CH");
  const coversCH = await getCategoryCoverImagesFromDb("CH");
  console.log("CH Counts:", countsCH.categoryCounts);
  console.log("CH Covers:", coversCH);
  const boardsCH = resolveShortcutBoards("CH", countsCH.categoryCounts, coversCH);
  console.log(`CH Boards: ${boardsCH.length} board(s) resolved`);
  for (const b of boardsCH) {
    console.log(`- Board: ${b.id} (${b.titleKey}) with ${b.tiles.length} tiles:`, b.tiles);
  }
}

main().catch(console.error);
