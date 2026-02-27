const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { requestHandler } = require("../src/app");
const { scaffoldEndpoint } = require("../src/services/scaffoldService");
const { PACKAGES_CSV_PATH } = require("../src/services/packageService");
const { PHOTOS_DIR } = require("../src/services/photoService");

const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7sQ1gAAAAASUVORK5CYII=";

function makeRequest(server, method, requestPath, payload) {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: server.address().port,
        path: requestPath,
        method,
        headers: body
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(body)
            }
          : {}
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          const contentType = String(res.headers["content-type"] || "");
          const isJson = contentType.includes("application/json");
          resolve({
            status: res.statusCode,
            body: isJson ? (raw ? JSON.parse(raw) : {}) : raw
          });
        });
      }
    );

    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

test("API routes work", async () => {
  fs.mkdirSync(path.dirname(PACKAGES_CSV_PATH), { recursive: true });
  fs.writeFileSync(PACKAGES_CSV_PATH, "name,version\nalpha,1.0.0\nbeta,2.0.0\n", "utf8");
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  fs.writeFileSync(path.join(PHOTOS_DIR, "sample-photo.png"), Buffer.from(TINY_PNG_BASE64, "base64"));
  fs.writeFileSync(path.join(PHOTOS_DIR, "ignore-me.txt"), "not an image", "utf8");

  const server = http.createServer((req, res) => requestHandler(req, res));
  await new Promise((resolve) => server.listen(0, resolve));

  const health = await makeRequest(server, "GET", "/api/health");
  assert.equal(health.status, 200);
  assert.equal(health.body.status, "ok");

  const categories = await makeRequest(server, "GET", "/api/v1/categories");
  assert.equal(categories.status, 200);
  assert.ok(Array.isArray(categories.body.data));

  const created = await makeRequest(server, "POST", "/api/v1/categories", {
    id: "security-filtering",
    title: "Security + Filtering",
    description: "Filtering, endpoint protection, and alerts",
    links: []
  });
  assert.equal(created.status, 201);

  const one = await makeRequest(server, "GET", "/api/v1/categories/security-filtering");
  assert.equal(one.status, 200);
  assert.equal(one.body.data.id, "security-filtering");


  const legacyOpsCategory = categories.body.data.find((category) => category.id === "legacy-ops-links");
  assert.ok(legacyOpsCategory);
  assert.equal(legacyOpsCategory.title, "Legacy Ops Links");
  assert.ok(legacyOpsCategory.links.some((link) => link.name === "LifeLink"));

  const endpointPage = await makeRequest(server, "GET", "/endpoints.html");
  assert.equal(endpointPage.status, 200);
  assert.match(endpointPage.body, /Endpoint Explorer/);

  const packagesApi = await makeRequest(server, "GET", "/api/v1/packages");
  assert.equal(packagesApi.status, 200);
  assert.deepEqual(packagesApi.body.data.headers, ["name", "version"]);

  const packagesPage = await makeRequest(server, "GET", "/packages");
  assert.equal(packagesPage.status, 200);
  assert.match(packagesPage.body, /alpha/);

  const photosApi = await makeRequest(server, "GET", "/api/v1/photos");
  assert.equal(photosApi.status, 200);
  assert.deepEqual(photosApi.body.data, [{ name: "sample-photo.png", url: "/photos/sample-photo.png" }]);

  const photosPage = await makeRequest(server, "GET", "/photos");
  assert.equal(photosPage.status, 200);
  assert.match(photosPage.body, /Photo Wall/);

  const scaffoldPreview = await makeRequest(server, "POST", "/api/v1/scaffold/endpoint", {
    resource: "device checkout",
    dryRun: true
  });
  assert.equal(scaffoldPreview.status, 201);
  assert.equal(scaffoldPreview.body.dryRun, true);
  assert.equal(scaffoldPreview.body.resource.camelCase, "deviceCheckout");

  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(PACKAGES_CSV_PATH, { force: true });
  fs.rmSync(path.join(PHOTOS_DIR, "sample-photo.png"), { force: true });
  fs.rmSync(path.join(PHOTOS_DIR, "ignore-me.txt"), { force: true });
});

test("scaffold service writes boilerplate files", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "route-scaffold-"));
  fs.mkdirSync(path.join(tmpRoot, "src", "controllers"), { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, "src", "routes", "v1"), { recursive: true });

  const result = scaffoldEndpoint({ resource: "Asset Audit", rootDir: tmpRoot, dryRun: false });
  assert.equal(result.status, 201);

  const controllerPath = path.join(tmpRoot, "src", "controllers", "assetAuditController.js");
  const routePath = path.join(tmpRoot, "src", "routes", "v1", "assetAuditRoutes.js");

  assert.equal(fs.existsSync(controllerPath), true);
  assert.equal(fs.existsSync(routePath), true);

  const duplicate = scaffoldEndpoint({ resource: "Asset Audit", rootDir: tmpRoot, dryRun: false });
  assert.equal(duplicate.status, 409);

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("packages API falls back when primary csv is empty", async () => {
  fs.mkdirSync(path.dirname(PACKAGES_CSV_PATH), { recursive: true });
  fs.writeFileSync(PACKAGES_CSV_PATH, "", "utf8");

  const server = http.createServer((req, res) => requestHandler(req, res));
  await new Promise((resolve) => server.listen(0, resolve));

  const packagesApi = await makeRequest(server, "GET", "/api/v1/packages");
  assert.equal(packagesApi.status, 200);
  assert.ok(packagesApi.body.data.headers.length > 0);
  assert.ok(packagesApi.body.data.rows.length > 0);

  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(PACKAGES_CSV_PATH, { force: true });
  fs.rmSync(path.join(PHOTOS_DIR, "sample-photo.png"), { force: true });
  fs.rmSync(path.join(PHOTOS_DIR, "ignore-me.txt"), { force: true });
});

