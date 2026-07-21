import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const typescript = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = require("node:fs").readFileSync(filename, "utf8");
  const output = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
    },
    fileName: filename,
  });

  module._compile(output.outputText, filename);
};

test("marketplace data provides a complete, safely priced demo catalog", () => {
  const {
    marketplaceCategories,
    marketplaceDestinations,
    marketplaceServiceVariants,
    marketplaceServices,
  } = require("../src/data/marketplace.ts");

  assert.ok(marketplaceDestinations.length >= 15);
  const categoryIds = new Set(marketplaceCategories.map(({ id }) => id));
  for (const category of [
      "excursions",
      "tickets",
      "transfers",
      "guides",
      "activities",
      "digital",
      "connectivity",
      "insurance",
      "rental",
      "services",
    ]) {
    assert.ok(categoryIds.has(category));
  }
  assert.ok(marketplaceServices.length > 0);

  for (const service of marketplaceServices) {
    assert.ok(service.id);
    assert.ok(service.slug);
    assert.ok(service.price >= 50);
    assert.equal(service.currency, "RUB");
    assert.ok(service.priceUnit);
    assert.equal(service.status, "demo");
    assert.equal(service.isMockData, true);
    assert.equal(service.orderToday, false);
    assert.ok(
      existsSync(resolve(process.cwd(), "public", service.imagePath.slice(1))),
      `${service.id} image path must resolve locally`,
    );
    for (const imagePath of service.images) {
      assert.ok(
        existsSync(resolve(process.cwd(), "public", imagePath.slice(1))),
        `${service.id} image path must resolve locally`,
      );
    }
  }

  for (const destination of marketplaceDestinations) {
    assert.ok(
      existsSync(resolve(process.cwd(), "public", destination.imagePath.slice(1))),
      `${destination.id} image path must resolve locally`,
    );
  }

  assert.ok(marketplaceServiceVariants.length > 0);
  for (const variant of marketplaceServiceVariants) {
    assert.equal(variant.status, "demo");
    assert.equal(variant.isMockData, true);
  }
});

test("marketplace links and images remain local and unambiguous", () => {
  const {
    marketplaceDestinations,
    marketplaceNavigation,
    marketplaceServices,
  } = require("../src/data/marketplace.ts");

  for (const item of marketplaceNavigation) {
    assert.ok(item.href.startsWith("/"), `${item.label} must use an internal path`);
  }

  const slugs = marketplaceServices.map(({ slug }) => slug);
  assert.equal(new Set(slugs).size, slugs.length, "service slugs must be unique");

  for (const imagePath of [
    ...marketplaceDestinations.map(({ imagePath }) => imagePath),
    ...marketplaceServices.flatMap(({ imagePath, images }) => [imagePath, ...images]),
  ]) {
    assert.ok(imagePath.startsWith("/images/"), `${imagePath} must be a public image`);
    assert.ok(
      existsSync(resolve(process.cwd(), "public", imagePath.slice(1))),
      `${imagePath} must resolve under public/images`,
    );
  }
});

test("marketplace routes expose Next.js route-segment error boundaries", () => {
  for (const route of ["catalog", "search", "destinations"]) {
    const boundaryPath = resolve(process.cwd(), "src", "app", route, "error.tsx");
    assert.ok(existsSync(boundaryPath), `${route} must define error.tsx`);

    const boundary = readFileSync(boundaryPath, "utf8");
    assert.match(boundary, /^"use client";/, `${route} error boundary must be a client component`);
    assert.match(boundary, /marketplace-error/, `${route} boundary must reuse the marketplace error UI`);
  }
});

test("catalog filters services and returns a deterministic first page", () => {
  const { filterMarketplaceServices } = require(
    "../src/lib/marketplace/catalog.ts",
  );

  const digital = filterMarketplaceServices(
    { digital: true, text: "маршрут" },
    "price-asc",
  );

  assert.ok(digital.items.length > 0);
  assert.ok(digital.items.every((service) => service.isDigital));
  assert.ok(
    digital.items.every((service) =>
      `${service.title} ${service.description}`.toLowerCase().includes("маршрут"),
    ),
  );
  assert.equal(digital.total, digital.items.length);
  assert.equal(digital.hasNextPage, false);

  const firstPage = filterMarketplaceServices({}, "relevance");
  assert.equal(firstPage.items.length, 12);
  assert.ok(firstPage.total > firstPage.items.length);
  assert.equal(firstPage.hasNextPage, true);
  assert.doesNotThrow(() =>
    filterMarketplaceServices({ category: "unknown" }, "unknown"),
  );
});

test("catalog applies every supported filter and sort without mutating data", () => {
  const { filterMarketplaceServices } = require(
    "../src/lib/marketplace/catalog.ts",
  );

  const matching = filterMarketplaceServices(
    {
      category: "digital",
      destination: "istanbul",
      minPrice: 300,
      maxPrice: 400,
      duration: "multi-day",
      language: "Русский",
      children: true,
      digital: true,
      orderToday: false,
    },
    "relevance",
  );

  assert.deepEqual(matching.items.map(({ id }) => id), [
    "istanbul-weekend-digital-route",
  ]);

  const orderToday = filterMarketplaceServices({ orderToday: true }, "relevance");
  assert.equal(orderToday.total, 0);

  const transfers = filterMarketplaceServices({ transfer: true }, "duration");
  assert.ok(transfers.items.every((service) => service.hasTransfer));
  assert.ok(
    transfers.items.every(
      (service, index, items) =>
        index === 0 ||
        (items[index - 1].durationMinutes ?? Infinity) <=
          (service.durationMinutes ?? Infinity),
    ),
  );

  const byPrice = filterMarketplaceServices({}, "price-asc");
  assert.ok(
    byPrice.items.every(
      (service, index, items) =>
        index === 0 || items[index - 1].price <= service.price,
    ),
  );
  const byDescendingPrice = filterMarketplaceServices({}, "price-desc");
  assert.ok(
    byDescendingPrice.items.every(
      (service, index, items) =>
        index === 0 || items[index - 1].price >= service.price,
    ),
  );
});

test("catalog filters only explicit demo-date metadata", () => {
  const { filterMarketplaceServices } = require(
    "../src/lib/marketplace/catalog.ts",
  );

  const matching = filterMarketplaceServices(
    { date: "2026-08-15" },
    "relevance",
  );

  assert.deepEqual(matching.items.map(({ id }) => id), [
    "istanbul-bosphorus-walk",
  ]);
  assert.equal(
    filterMarketplaceServices({ date: "2026-08-16" }, "relevance").total,
    0,
  );
});

test("catalog accumulates visible pages without dropping the first page", () => {
  const {
    getVisibleMarketplaceServices,
    filterMarketplaceServices,
  } = require("../src/lib/marketplace/catalog.ts");

  const firstPage = filterMarketplaceServices({}, "relevance", 1);
  const firstVisiblePage = getVisibleMarketplaceServices({}, "relevance", 1);
  const secondVisiblePage = getVisibleMarketplaceServices({}, "relevance", 2);

  assert.deepEqual(
    firstVisiblePage.items.map(({ id }) => id),
    firstPage.items.map(({ id }) => id),
  );
  assert.deepEqual(
    secondVisiblePage.items.slice(0, firstPage.items.length).map(({ id }) => id),
    firstPage.items.map(({ id }) => id),
  );
  assert.equal(secondVisiblePage.items.length, 24);
  assert.equal(firstVisiblePage.hasNextPage, true);
  assert.equal(secondVisiblePage.hasNextPage, false);
});
