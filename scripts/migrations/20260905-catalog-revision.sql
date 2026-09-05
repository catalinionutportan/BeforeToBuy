-- Additive migration only. No changes to products, offers or their indexes.
CREATE TABLE IF NOT EXISTS "CatalogRevision" (
  "country" TEXT PRIMARY KEY,
  "revision" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "CatalogRevision" ENABLE ROW LEVEL SECURITY;
