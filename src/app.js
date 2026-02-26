const fs = require("node:fs");
const path = require("node:path");
const { routeApi } = require("./routes");
const { readPackagesCsv } = require("./services/packageService");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const LEGACY_PUBLIC_DIR = path.join(PUBLIC_DIR, "legacy");
const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
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

  if (pathname === "/nginx" || pathname === "/nginx/") {
    res.writeHead(302, { Location: "/legacy/" });
    res.end();
    return;
  }

  if (pathname === "/legacy") {
    res.writeHead(302, { Location: "/legacy/" });
    res.end();
    return;
  }

  if (pathname === "/legacy/") {
    sendFile(res, path.join(LEGACY_PUBLIC_DIR, "index.html"));
    return;
  }

  if (pathname.startsWith("/legacy/")) {
    const legacyAssetPath = pathname.slice("/legacy/".length);
    if (tryServeStaticFile(res, LEGACY_PUBLIC_DIR, legacyAssetPath)) {
      return;
    }

    sendJson(res, 404, { error: "File not found" });
    return;
  }

  if (pathname === "/") {
    sendFile(res, path.join(PUBLIC_DIR, "index.html"));
    return;
  }

  if (pathname === "/packages") {
    try {
      const csv = await readPackagesCsv();
      const rows = csv.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
        )
        .join("");
      const header = csv.headers.map((title) => `<th>${title}</th>`).join("");
      const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Packages CSV</title>
          <style>
            body { font-family: system-ui, sans-serif; margin: 2rem; background:#111827; color:#f9fafb; }
            table { border-collapse: collapse; width: 100%; background:#1f2937; }
            th, td { border: 1px solid #374151; padding: 0.5rem; text-align: left; }
            th { background:#0f172a; }
          </style>
        </head>
        <body>
          <h1>/data/packages.csv</h1>
          <p>Use <code>POST /api/v1/packages/sync</code> to pull the latest file from your Raspberry Pi.</p>
          <table>
            <thead><tr>${header}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
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
