#!/usr/bin/env node

const BASE_URL = process.env.SMOKE_BASE_URL || "https://www.beforetobuy.com";

const endpoints = [
  { name: "Homepage", path: "/?lang=en", expectText: "BeforeToBuy" },
  { name: "Legal hub", path: "/legal?lang=en", expectText: "Legal" },
  { name: "Help", path: "/help?lang=en", expectText: "Help" },
  { name: "Privacy", path: "/privacy?lang=en", expectText: "Privacy" },
  { name: "Cookies", path: "/cookies?lang=en", expectText: "Cookie" },
  {
    name: "Health API",
    path: "/api/health",
    json: true,
    expectKey: "status",
    expectOneOf: ["healthy", "degraded"],
  },
  {
    name: "Products API (RO live feeds)",
    path: "/api/products?country=RO&limit=24",
    json: true,
    expectKey: "meta.feedProductCount",
    min: 1,
  },
  {
    name: "Products API pagination meta",
    path: "/api/products?country=RO&limit=24&offset=0",
    json: true,
    expectKey: "meta.totalMatched",
    min: 1,
  },
];

function getNestedValue(object, keyPath) {
  return keyPath.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), object);
}

async function checkEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  const response = await fetch(url, {
    headers: { Accept: "*/*", Cookie: "btb-ui-lang=en" },
  });

  if (!response.ok) {
    throw new Error(`${endpoint.name} failed: HTTP ${response.status} (${url})`);
  }

  if (endpoint.json) {
    const body = await response.json();
    const value = getNestedValue(body, endpoint.expectKey);

    if (endpoint.expectValue != null && value !== endpoint.expectValue) {
      throw new Error(`${endpoint.name} expected ${endpoint.expectKey}=${endpoint.expectValue}, got ${value}`);
    }

    if (endpoint.expectOneOf && !endpoint.expectOneOf.includes(value)) {
      throw new Error(
        `${endpoint.name} expected ${endpoint.expectKey} in ${endpoint.expectOneOf.join(", ")}, got ${value}`
      );
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

function getSetCookie(response, name) {
  const headers = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [];
  const match = headers.find((value) => value.startsWith(`${name}=`));
  if (!match) return null;
  return match.split(";")[0];
}

async function checkConsentPreferences() {
  const consentUrl = `${BASE_URL}/api/consent`;
  const origin = new URL(BASE_URL).origin;

  const blocked = await fetch(consentUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ affiliate: false, analytics: false }),
  });
  if (blocked.status !== 403) {
    throw new Error(`Consent CSRF expected 403 without Origin, got ${blocked.status}`);
  }

  const saved = await fetch(consentUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify({ affiliate: false, analytics: false }),
  });
  if (!saved.ok) {
    throw new Error(`Consent save failed: HTTP ${saved.status}`);
  }

  const consentCookie = getSetCookie(saved, "b2b_consent");
  if (!consentCookie) {
    throw new Error("Consent save missing b2b_consent Set-Cookie");
  }

  const cleared = await fetch(consentUrl, {
    method: "DELETE",
    headers: { Origin: origin, Cookie: consentCookie },
  });
  if (!cleared.ok) {
    throw new Error(`Consent clear failed: HTTP ${cleared.status}`);
  }

  return "Consent preferences: OK (CSRF, save, clear)";
}

async function main() {
  console.log(`Smoke testing ${BASE_URL}\n`);
  const results = [];

  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint);
    console.log(`✓ ${result}`);
    results.push(result);
  }

  const consentResult = await checkConsentPreferences();
  console.log(`✓ ${consentResult}`);
  results.push(consentResult);

  console.log(`\nAll ${results.length} smoke checks passed.`);
}

main().catch((error) => {
  console.error(`✗ Smoke test failed: ${error.message}`);
  process.exit(1);
});
