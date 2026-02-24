const fs = require("node:fs");
const path = require("node:path");
const { routeApi } = require("./routes");

const PUBLIC_DIR = path.join(__dirname, "..", "public");

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
  const contentType =
    ext === ".html"
      ? "text/html; charset=utf-8"
      : ext === ".css"
      ? "text/css; charset=utf-8"
      : ext === ".js"
      ? "application/javascript; charset=utf-8"
      : "text/plain; charset=utf-8";

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

  if (pathname === "/") {
    sendFile(res, path.join(PUBLIC_DIR, "index.html"));
    return;
  }

  const requestedPath = path.join(PUBLIC_DIR, pathname);
  if (requestedPath.startsWith(PUBLIC_DIR) && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    sendFile(res, requestedPath);
    return;
  }

  sendFile(res, path.join(PUBLIC_DIR, "index.html"));
}

module.exports = {
  requestHandler
};
