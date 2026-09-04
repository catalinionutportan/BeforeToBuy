-- Synthetic catalogue only. NEVER run against production.
DO $$ BEGIN
  IF inet_server_addr() <> '127.0.0.1'::inet OR inet_server_port() <> 55439 THEN
    RAISE EXCEPTION 'This fixture requires the isolated localhost:55439 database';
  END IF;
END $$;

INSERT INTO "Product" (id, title, brand, category, image, "catalogSource", "targetCountries", "basePrice", "updatedAt")
SELECT 'perf-audit-' || market || '-' || lpad(n::text, 7, '0'),
       'Synthetic audit product ' || n, 'AuditBrand' || (n % 40),
       (ARRAY['laptops', 'headphones', 'gaming-vr', 'smartphones', 'monitors'])[1 + n % 5],
       'https://www.beforetobuy.com/icon.png', 'production-live', ARRAY[market],
       10 + n % 990, now() - (n || ' seconds')::interval
FROM (VALUES ('CH',115528), ('DE',84265), ('GB',1575), ('US',895)) AS markets(market, count)
CROSS JOIN LATERAL generate_series(1, count) AS n;

INSERT INTO "Offer" (id, "productId", "storeName", price, currency, "purchaseUrl", "feedMerchantId", "fetchedAt")
SELECT id || '-offer', id, 'Synthetic Audit Store', "basePrice",
       CASE "targetCountries"[1] WHEN 'CH' THEN 'CHF' WHEN 'GB' THEN 'GBP' WHEN 'US' THEN 'USD' ELSE 'EUR' END,
       'https://example.com/audit-fixture',
       CASE WHEN "targetCountries"[1] = 'CH' AND category = 'laptops' THEN 'ch-acer' ELSE 'perf-audit-merchant-' || "targetCountries"[1] END,
       now()::text
FROM "Product" WHERE id LIKE 'perf-audit-%';

ANALYZE "Product";
ANALYZE "Offer";
