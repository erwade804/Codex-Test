const fs = require("node:fs");
const path = require("node:path");

const LOG_FILE_PATH = path.join(__dirname, "..", "request_logs.csv");
const CSV_HEADER = "ip,timestamp,path\n";

function ensureLogFileExists() {
  if (!fs.existsSync(LOG_FILE_PATH)) {
    fs.writeFileSync(LOG_FILE_PATH, CSV_HEADER, "utf8");
  }
}

function escapeCsv(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.socket.remoteAddress || "unknown";
}

function appendRequestLog({ ip, timestamp, pathname }) {
  ensureLogFileExists();
  const line = `${escapeCsv(ip)},${escapeCsv(timestamp)},${escapeCsv(pathname)}\n`;
  fs.appendFileSync(LOG_FILE_PATH, line, "utf8");
}

function readRequestLogs() {
  ensureLogFileExists();
  const raw = fs.readFileSync(LOG_FILE_PATH, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  return lines.slice(1).map((line) => {
    const [ip = "", timestamp = "", requestPath = ""] = parseCsvLine(line);
    return { ip, timestamp, path: requestPath };
  });
}

module.exports = {
  LOG_FILE_PATH,
  appendRequestLog,
  readRequestLogs,
  getClientIp
};
