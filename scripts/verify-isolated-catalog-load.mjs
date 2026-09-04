// Run only against the synthetic catalogue on the private local test server.
import assert from "node:assert/strict";
const base = "http://127.0.0.1:3004";
async function read(params) {
  const start = performance.now();
  const response = await fetch(`${base}/api/products?${new URLSearchParams({ limit: "48", ...params })}`, { signal: AbortSignal.timeout(15000) });
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify({ params, error: body.error }));
  assert.ok(body.products.every((p) => p.id.startsWith("perf-audit-")), "Test server is not using the synthetic database");
  return { params, ms: Math.round(performance.now() - start), ids: body.products.map((p) => p.id), count: body.meta?.totalMatched };
}
const cold = [];
for (const country of ["CH", "DE", "GB", "US"]) {
  const result = await read({ country });
  assert.equal(result.ids.length, 48);
  cold.push(result);
}
const empty = await read({ country: "CH", q: "no-such-synthetic-product-abcdef" });
assert.equal(empty.ids.length, 0);
const simultaneousIdentical = await Promise.all(Array.from({ length: 10 }, () => read({ country: "CH", offset: "96" })));
for (const result of simultaneousIdentical) assert.deepEqual(result.ids, simultaneousIdentical[0].ids);
const simultaneousDistinct = await Promise.all(Array.from({ length: 10 }, (_, n) => read({ country: "DE", offset: String((n + 1) * 48) })));
assert.equal(new Set(simultaneousDistinct.flatMap((r) => r.ids)).size, 480);
const report = (rows) => rows.map(({ ids, ...row }) => ({ ...row, returned: ids.length }));
console.log(JSON.stringify({ dataset: "202263 synthetic products, local PostgreSQL only; not production latency", cold: report(cold), identical10: report(simultaneousIdentical), distinct10: report(simultaneousDistinct), emptyQuery: "pass" }, null, 2));
