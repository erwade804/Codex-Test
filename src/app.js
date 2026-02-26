const fs = require("node:fs");
const path = require("node:path");
const { routeApi } = require("./routes");

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

    const result = routeApi({ method: req.method, pathname, body });
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

  if (tryServeStaticFile(res, PUBLIC_DIR, pathname)) {
    return;
  }

  sendFile(res, path.join(PUBLIC_DIR, "index.html"));
}

module.exports = {
  requestHandler
};
