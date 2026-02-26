const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { requestHandler } = require("../src/app");
const { scaffoldEndpoint } = require("../src/services/scaffoldService");

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



  const nginxRedirect = await makeRequest(server, "GET", "/nginx");
  assert.equal(nginxRedirect.status, 302);

  const legacyRedirect = await makeRequest(server, "GET", "/legacy");
  assert.equal(legacyRedirect.status, 302);

  const legacyPage = await makeRequest(server, "GET", "/legacy/");
  assert.equal(legacyPage.status, 200);
  assert.match(legacyPage.body, /Important Links/);

  const legacyStyles = await makeRequest(server, "GET", "/legacy/index.css");
  assert.equal(legacyStyles.status, 200);
  assert.match(legacyStyles.body, /:root/);

  const endpointPage = await makeRequest(server, "GET", "/endpoints.html");
  assert.equal(endpointPage.status, 200);
  assert.match(endpointPage.body, /Endpoint Explorer/);

  const scaffoldPreview = await makeRequest(server, "POST", "/api/v1/scaffold/endpoint", {
    resource: "device checkout",
    dryRun: true
  });
  assert.equal(scaffoldPreview.status, 201);
  assert.equal(scaffoldPreview.body.dryRun, true);
  assert.equal(scaffoldPreview.body.resource.camelCase, "deviceCheckout");

  await new Promise((resolve) => server.close(resolve));
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
