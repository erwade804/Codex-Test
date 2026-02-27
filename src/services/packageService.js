const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");
const {
  DATA_DIR,
  PI_HOST,
  PI_USER,
  PI_PASSWORD,
  PI_CSV_PATH,
  PI_SSH_PORT
} = require("../config/env");

const PACKAGES_CSV_PATH = path.join(DATA_DIR, "packages.csv");
const LOCAL_PACKAGES_CSV_PATH = path.join(__dirname, "..", "data", "packages.csv");
const PYTHON_SYNC_SCRIPT_PATH = "src/python/csvService.py";

async function resolvePackagesCsvPath() {
  try {
    await fs.access(PACKAGES_CSV_PATH);
    return PACKAGES_CSV_PATH;
  } catch {
    await fs.access(LOCAL_PACKAGES_CSV_PATH);
    return LOCAL_PACKAGES_CSV_PATH;
  }
}

function parseCsv(content) {
  const [headerLine, ...rows] = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!headerLine) {
    return { headers: [], rows: [] };
  }

  const headers = headerLine.split(",").map((cell) => cell.trim());
  const parsedRows = rows.map((row) => row.split(",").map((cell) => cell.trim()));

  return { headers, rows: parsedRows };
}

async function readPackagesCsv() {
  const csvPath = await resolvePackagesCsvPath();
  const csv = await fs.readFile(csvPath, "utf8");
  const parsed = parseCsv(csv);

  if (
    csvPath === PACKAGES_CSV_PATH &&
    parsed.headers.length === 0 &&
    parsed.rows.length === 0
  ) {
    const fallbackCsv = await fs.readFile(LOCAL_PACKAGES_CSV_PATH, "utf8");
    return parseCsv(fallbackCsv);
  }

  return parsed;
}

async function syncPackagesFromPi() {
  // run the csvservice.py script
  const python = spawn("python", [PYTHON_SYNC_SCRIPT_PATH]);

  python.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  python.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });

  await new Promise((resolve, reject) => {
    python.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python script exited with code ${code}`));
      }
    });
  });
}

module.exports = {
  readPackagesCsv,
  syncPackagesFromPi,
  PACKAGES_CSV_PATH
};
