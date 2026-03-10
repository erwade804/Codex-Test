require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { routeApi } = require("./routes");
const { readPackagesCsv } = require("./services/packageService");
const { DEV } = require("./config/env");
const { appendRequestLog, readRequestLogs, getClientIp } = require("./services/requestLogService");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SITE_PHOTOS_DIR = path.join(__dirname, "sitePhotos");
const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: "File not found" });
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({ __parseError: true });
      }
    });
  });
}

function tryServeStaticFile(res, baseDir, requestPath) {
  const normalizedPath = path.normalize(requestPath).replace(/^([/\\])+/, "");
  const absolutePath = path.join(baseDir, normalizedPath);

  if (!absolutePath.startsWith(baseDir)) {
    return false;
  }

  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    return false;
  }

  sendFile(res, absolutePath);
  return true;
}

async function requestHandler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;
  const clientIp = getClientIp(req);
  var accessGranted = false;
  if (clientIp != "::ffff:127.0.0.1" && clientIp != "::1") {
    appendRequestLog({
      ip: clientIp,
      timestamp: new Date().toISOString(),
      pathname
    });
  } else {
    accessGranted = true;
  }

  const normalizedIp = (clientIp.match(/(\d+\.\d+\.\d+\.\d+)$/) || [])[1] || clientIp;


  const ipParts = normalizedIp.split(".");
  const third = ipParts[2];

  if (!(third === "34" || third === "35") && !accessGranted) {
    console.log("Request from unauthorized VLAN: '" + clientIp + "'");
    sendJson(res, 401, { error: "Unauthorized access." });
    return;
  }


  if (pathname === "/api/v1/request-logs") {
    const logs = readRequestLogs();
    sendJson(res, 200, { data: logs });
    return;
  }

  if (pathname.startsWith("/api")) {
    const body = ["POST", "PUT", "PATCH"].includes(req.method) ? await parseBody(req) : {};
    if (body.__parseError) {
      sendJson(res, 400, { error: "Invalid JSON payload" });
      return;
    }

    const result = await routeApi({ method: req.method, pathname, body });
    if (!result) {
      sendJson(res, 404, { error: "Route not found" });
      return;
    }

    sendJson(res, result.status, result.body);
    return;
  }

  if (pathname === "/") {
    sendFile(res, path.join(PUBLIC_DIR, "index.html"));
    return;
  }

  if (pathname === "/photos") {
    sendFile(res, path.join(PUBLIC_DIR, "photos.html"));
    return;
  }

  if (pathname === "/request-logs") {
    sendFile(res, path.join(PUBLIC_DIR, "request-logs.html"));
    return;
  }

  if (pathname === "/packages/") {
    res.writeHead(302, { Location: "/packages" });
    res.end();
    return;
  }

  if (pathname === "/packages") {
    try {
      const csv = await readPackagesCsv();
      let rows = csv.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
        ).reverse();
      // get active packages
      let currentRows = [];
      for (let i of rows) {
        if (i.includes("SHIPPED")) {
          break;
        }
        currentRows.push(i);
      }

      const header = csv.headers.map((title) => `<th>${title}</th>`).join("");
      const html = `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Packages CSV</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <link rel="stylesheet" href="/styles.css" />
          <link rel="icon" type="image/png" href="/sylveon%20icon.png" />
        </head>
        <body>
          <div class="bg-glow bg-glow-pink"></div>
          <div class="bg-glow bg-glow-blue"></div>

          <main class="container">
            <header class="hero hero-slim">
              <p class="eyebrow">Operations Data</p>
              <h1>Packages CSV</h1>
              <p class="subtitle">
                Current rows from <code>/data/packages.csv</code>. Every minute, the latest file is pulled from your Raspberry Pi. You may have to refresh the page to see new results.
              </p>
              <div class="toolbar toolbar-inline">
                <a class="text-link" href="/">← Back to Link Hub</a>
                <a class="text-link" href="/endpoints.html">Open Endpoint Explorer →</a>
              </div>
            </header>

            <section class="category-card packages-card" aria-label="Packages table">
              <div class="table-scroll">
                <table class="data-table">
                  <thead><tr>${header}</tr></thead>
                  <tbody>${currentRows}</tbody>
                </table>
              </div>
            </section>
          </main>
        </body>
      </html>`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch {
      sendJson(res, 404, { error: "packages.csv not found in /data" });
    }
    return;
  }

  if (tryServeStaticFile(res, PUBLIC_DIR, pathname)) {
    return;
  }

  sendFile(res, path.join(PUBLIC_DIR, "index.html"));
}

module.exports = {
  requestHandler
};
