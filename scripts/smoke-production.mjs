#!/usr/bin/env node

const BASE_URL = process.env.SMOKE_BASE_URL || "https://www.beforetobuy.com";

const endpoints = [
  { name: "Homepage", path: "/", expectText: "Beta" },
  { name: "Legal hub", path: "/legal", expectText: "Legal Hub" },
  { name: "Help", path: "/help", expectText: "Help" },
  { name: "Health API", path: "/api/health", json: true, expectKey: "status", expectValue: "healthy" },
  {
    name: "Products API",
    path: "/api/products?country=CH",
    json: true,
    expectKey: "meta.liveOfferCount",
    min: 1,
  },
];

function getNestedValue(object, keyPath) {
  return keyPath.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), object);
}

async function checkEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  const response = await fetch(url, { headers: { Accept: "*/*" } });

  if (!response.ok) {
    throw new Error(`${endpoint.name} failed: HTTP ${response.status} (${url})`);
  }

  if (endpoint.json) {
    const body = await response.json();
    const value = getNestedValue(body, endpoint.expectKey);

    if (endpoint.expectValue != null && value !== endpoint.expectValue) {
      throw new Error(`${endpoint.name} expected ${endpoint.expectKey}=${endpoint.expectValue}, got ${value}`);
    }

    if (endpoint.min != null && !(Number(value) >= endpoint.min)) {
      throw new Error(`${endpoint.name} expected ${endpoint.expectKey}>=${endpoint.min}, got ${value}`);
    }

    return `${endpoint.name}: OK (${endpoint.path})`;
  }

  const html = await response.text();
  if (endpoint.expectText && !html.includes(endpoint.expectText)) {
    throw new Error(`${endpoint.name} missing expected text "${endpoint.expectText}"`);
  }

  return `${endpoint.name}: OK (${endpoint.path})`;
}

async function main() {
  console.log(`Smoke testing ${BASE_URL}\n`);
  const results = [];

  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint);
    console.log(`✓ ${result}`);
    results.push(result);
  }

  console.log(`\nAll ${results.length} smoke checks passed.`);
}

main().catch((error) => {
  console.error(`✗ Smoke test failed: ${error.message}`);
  process.exit(1);
});
