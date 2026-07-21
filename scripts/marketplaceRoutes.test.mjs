import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { join } from "node:path";
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

test("catalog pagination returns the next page without repeating results", () => {
  const { filterMarketplaceServices } = require("../src/lib/marketplace/catalog.ts");
  const firstPage = filterMarketplaceServices({}, "relevance", 1);
  const secondPage = filterMarketplaceServices({}, "relevance", 2);

  assert.notDeepEqual(
    firstPage.items.map(({ id }) => id),
    secondPage.items.map(({ id }) => id),
  );
});

async function buildCatalogExport(buildRoot) {
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

  const candidates = [
    join(buildRoot, "out", "catalog", "index.html"),
    join(buildRoot, "out", "turkiye", "catalog", "index.html"),
  ];
  const catalogHtml = candidates.find(existsSync);
  assert.ok(catalogHtml, "catalog export should contain static HTML");
  return catalogHtml;
}

async function startStaticServer(catalogHtml) {
  const server = createServer(async (request, response) => {
    const requestedUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    const requestedRoute = `${requestedUrl.pathname}${requestedUrl.search}`;

    if (requestedUrl.pathname !== "/catalog" && requestedUrl.pathname !== "/catalog/") {
      response.writeHead(404).end();
      return;
    }

    try {
      const html = await readFile(catalogHtml, "utf8");
      response.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "x-marketplace-route": requestedRoute,
      });
      response.end(html);
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

test("catalog route serves each required query from a temporary static server", async (t) => {
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
  const exportRoot = await buildCatalogExport(buildRoot);
  staticServer = await startStaticServer(exportRoot);

  const cases = [
    "/catalog",
    "/catalog?q=%D0%9A%D0%B0%D0%BF%D0%BF%D0%B0%D0%B4%D0%BE%D0%BA%D0%B8%D1%8F",
    "/catalog?date=2026-08-15",
    "/catalog?digital=1",
    "/catalog?maxPrice=1000",
  ];

  for (const path of cases) {
    const response = await fetch(`${staticServer.origin}${path}`);
    const html = await response.text();

    assert.equal(response.status, 200, `${path} should return HTTP 200`);
    assert.equal(response.headers.get("x-marketplace-route"), path, `${path} should reach the static server unchanged`);
    assert.match(html, /Каталог для поездки в Турцию/, `${path} should return the catalog shell`);
    assert.match(html, /Загружаем каталог…/, `${path} should retain the client query-state loading marker`);
  }
});
