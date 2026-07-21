import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const typescript = require("typescript");
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";

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

test("catalog query state parses typed filters and serializes supported values", () => {
  const { parseCatalogQuery, serializeCatalogQuery } = require(
    "../src/lib/marketplace/query-state.ts",
  );

  assert.deepEqual(
    parseCatalogQuery({ q: "Каппадокия", digital: "1", maxPrice: "1000" }),
    { text: "Каппадокия", digital: true, maxPrice: 1000 },
  );
  assert.deepEqual(
    parseCatalogQuery({ minPrice: "not-a-number", maxPrice: "Infinity" }),
    {},
  );

  const filters = {
    text: "Каппадокия",
    category: "digital",
    destination: "cappadocia",
    minPrice: 100,
    maxPrice: 1000,
    duration: "full-day",
    language: "Русский",
    transfer: true,
    children: true,
    digital: true,
    orderToday: true,
  };

  const serialized = serializeCatalogQuery(filters);
  assert.equal(
    serialized,
    "q=%D0%9A%D0%B0%D0%BF%D0%BF%D0%B0%D0%B4%D0%BE%D0%BA%D0%B8%D1%8F&category=digital&destination=cappadocia&minPrice=100&maxPrice=1000&duration=full-day&language=%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9&transfer=1&kids=1&digital=1&today=1",
  );
  assert.deepEqual(parseCatalogQuery(Object.fromEntries(new URLSearchParams(serialized))), filters);
  assert.equal(serializeCatalogQuery({ text: "", digital: false }), "");
});

test("catalog pagination returns the next page without repeating results", () => {
  const { filterMarketplaceServices } = require("../src/lib/marketplace/catalog.ts");
  const firstPage = filterMarketplaceServices({}, "relevance", 1);
  const secondPage = filterMarketplaceServices({}, "relevance", 2);

  assert.notDeepEqual(
    firstPage.items.map(({ id }) => id),
    secondPage.items.map(({ id }) => id),
  );
});

test("catalog route renders query-specific catalog states", async () => {
  const cases = [
    ["/catalog", ["Загружаем каталог"]],
    ["/catalog?q=%D0%9A%D0%B0%D0%BF%D0%BF%D0%B0%D0%B4%D0%BE%D0%BA%D0%B8%D1%8F", ["Загружаем каталог"]],
    ["/catalog?digital=1", ["Загружаем каталог"]],
    ["/catalog?maxPrice=1000", ["Загружаем каталог"]],
  ];

  for (const [path, labels] of cases) {
    const response = await fetch(`${baseUrl}${path}`);
    const html = await response.text();

    assert.equal(response.status, 200, `${path} should return 200`);
    for (const label of labels) {
      assert.match(html, new RegExp(label), `${path} should contain ${label}`);
    }
  }
});
