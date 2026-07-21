import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { cp, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import test from "node:test";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
const typescript = require("typescript");
const projectRoot = process.cwd();

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
    parseCatalogQuery({ q: "Каппадокия", date: "2026-08-15", digital: "1", maxPrice: "1000" }),
    { text: "Каппадокия", date: "2026-08-15", digital: true, maxPrice: 1000 },
  );
  assert.deepEqual(
    parseCatalogQuery({ date: "2026-02-30", minPrice: "not-a-number", maxPrice: "Infinity" }),
    {},
  );

  const filters = {
    text: "Каппадокия",
    category: "digital",
    destination: "cappadocia",
    date: "2026-08-15",
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
    "q=%D0%9A%D0%B0%D0%BF%D0%BF%D0%B0%D0%B4%D0%BE%D0%BA%D0%B8%D1%8F&category=digital&destination=cappadocia&date=2026-08-15&minPrice=100&maxPrice=1000&duration=full-day&language=%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9&transfer=1&kids=1&digital=1&today=1",
  );
  assert.deepEqual(parseCatalogQuery(Object.fromEntries(new URLSearchParams(serialized))), filters);
  assert.equal(serializeCatalogQuery({ text: "", digital: false }), "");
});

test("search query state filters catalog results and keeps an empty query unfiltered", () => {
  const { parseCatalogQuery } = require("../src/lib/marketplace/query-state.ts");
  const { filterMarketplaceServices } = require("../src/lib/marketplace/catalog.ts");

  const searchFilters = parseCatalogQuery({ q: "  Каппадокия  " });
  const searchResults = filterMarketplaceServices(searchFilters, "relevance");
  const catalogResults = filterMarketplaceServices({}, "relevance");
  const emptySearchFilters = parseCatalogQuery({ q: "   " });
  const emptySearchResults = filterMarketplaceServices(emptySearchFilters, "relevance");

  assert.deepEqual(searchFilters, { text: "Каппадокия" });
  assert.ok(searchResults.total > 0, "a search query should return matching catalog results");
  assert.ok(
    searchResults.total < catalogResults.total,
    "a search query should narrow the catalog rather than return its full result set",
  );
  assert.deepEqual(emptySearchFilters, {}, "an empty search query should not create filters");
  assert.deepEqual(
    emptySearchResults,
    catalogResults,
    "an empty search query should keep the catalog unfiltered",
  );
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

async function buildMarketplaceExport(buildRoot) {
  const next = spawn(
    process.execPath,
    [join(projectRoot, "node_modules/next/dist/bin/next"), "build", "--webpack"],
    { cwd: buildRoot, stdio: "pipe" },
  );
  let output = "";
  next.stdout?.on("data", (chunk) => { output += chunk; });
  next.stderr?.on("data", (chunk) => { output += chunk; });

  const exitCode = await new Promise((resolve, reject) => {
    next.once("error", reject);
    next.once("exit", resolve);
  });

  if (exitCode !== 0) {
    throw new Error(`Catalog export build failed with code ${exitCode}: ${output}`);
  }

  const exportedRoutes = new Map();
  for (const route of ["catalog", "search"]) {
    const candidates = [
      join(buildRoot, "out", route, "index.html"),
      join(buildRoot, "out", "turkiye", route, "index.html"),
    ];
    const html = candidates.find(existsSync);
    assert.ok(html, `${route} export should contain static HTML`);
    exportedRoutes.set(route, html);
  }
  return exportedRoutes;
}

async function startStaticServer(exportedRoutes) {
  const server = createServer(async (request, response) => {
    const requestedUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    const requestedRoute = `${requestedUrl.pathname}${requestedUrl.search}`;
    const route = requestedUrl.pathname.replace(/^\//, "").replace(/\/$/, "");
    const html = exportedRoutes.get(route);

    if (!html) {
      response.writeHead(404).end();
      return;
    }

    try {
      const content = await readFile(html, "utf8");
      response.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "x-marketplace-route": requestedRoute,
      });
      response.end(content);
    } catch {
      response.writeHead(500).end();
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  assert.ok(address && typeof address !== "string", "static server should listen on a local port");

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    }),
  };
}

test("catalog and search routes serve each required query from a temporary static server", async (t) => {
  const buildRoot = await mkdtemp(join(tmpdir(), "marketplace-catalog-route-"));
  let staticServer;
  t.after(async () => {
    await staticServer?.close();
    await rm(buildRoot, { force: true, recursive: true });
  });
  await Promise.all([
    cp(join(projectRoot, "src"), join(buildRoot, "src"), { recursive: true }),
    cp(join(projectRoot, "next.config.ts"), join(buildRoot, "next.config.ts")),
    cp(join(projectRoot, "package.json"), join(buildRoot, "package.json")),
    cp(join(projectRoot, "tsconfig.json"), join(buildRoot, "tsconfig.json")),
    symlink(join(projectRoot, "node_modules"), join(buildRoot, "node_modules"), "dir"),
    symlink(join(projectRoot, "public"), join(buildRoot, "public"), "dir"),
  ]);
  const exportedRoutes = await buildMarketplaceExport(buildRoot);
  staticServer = await startStaticServer(exportedRoutes);

  const cases = [
    ["/catalog", /Каталог для поездки в Турцию/],
    ["/catalog?q=%D0%9A%D0%B0%D0%BF%D0%BF%D0%B0%D0%B4%D0%BE%D0%BA%D0%B8%D1%8F", /Каталог для поездки в Турцию/],
    ["/catalog?date=2026-08-15", /Каталог для поездки в Турцию/],
    ["/catalog?digital=1", /Каталог для поездки в Турцию/],
    ["/catalog?maxPrice=1000", /Каталог для поездки в Турцию/],
    ["/search", /Поиск по каталогу/],
    ["/search?q=%D0%9A%D0%B0%D0%BF%D0%BF%D0%B0%D0%B4%D0%BE%D0%BA%D0%B8%D1%8F", /Поиск по каталогу/],
  ];

  for (const [path, heading] of cases) {
    const response = await fetch(`${staticServer.origin}${path}`);
    const html = await response.text();

    assert.equal(response.status, 200, `${path} should return HTTP 200`);
    assert.equal(response.headers.get("x-marketplace-route"), path, `${path} should reach the static server unchanged`);
    assert.match(html, heading, `${path} should return the expected marketplace shell`);
    assert.match(html, /Загружаем каталог…/, `${path} should retain the client query-state loading marker`);
  }
});

test("search entry points use real paths instead of hash-only targets", () => {
  const header = readFileSync(resolve(projectRoot, "src/components/marketplace/MarketplaceHeader.tsx"), "utf8");
  const browser = readFileSync(resolve(projectRoot, "src/components/marketplace/CatalogBrowser.tsx"), "utf8");
  const searchPage = readFileSync(resolve(projectRoot, "src/app/search/page.tsx"), "utf8");

  assert.match(header, /href="\/search"/, "header search action should target /search");
  assert.doesNotMatch(header, /href="#/, "header should not add hash-only links");
  assert.doesNotMatch(browser, /href="#/, "catalog quick filters should not add hash-only links");
  assert.match(
    searchPage,
    /<Link href="\/catalog">Начать путешествие<\/Link>/,
    "the marketplace search quick action should start in the catalog",
  );
  assert.doesNotMatch(searchPage, /href="#/, "search should not add hash-only links");
});
