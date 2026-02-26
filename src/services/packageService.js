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
const PYTHON_SYNC_SCRIPT_PATH = path.join(__dirname, "..", "python", "csvService.py");

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
  const csv = await fs.readFile(PACKAGES_CSV_PATH, "utf8");
  return parseCsv(csv);
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "pipe", ...options });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

async function syncPackagesFromPi() {
  if (!PI_HOST || !PI_USER) {
    throw new Error("PI_HOST and PI_USER must be configured");
  }

  if (!PI_PASSWORD) {
    throw new Error("PI_PASSWORD must be configured for password auth");
  }

  await fs.mkdir(DATA_DIR, { recursive: true });

  const askpassPath = path.join(os.tmpdir(), `codex-askpass-${Date.now()}.sh`);
  const askpassScript = `#!/bin/sh\nprintf '%s\\n' "${PI_PASSWORD.replace(/(["$`\\])/g, "\\$1")}"\n`;

  await fs.writeFile(askpassPath, askpassScript, { mode: 0o700 });

  const scpArgs = [
    "-P",
    String(PI_SSH_PORT),
    "-o",
    "PubkeyAuthentication=no",
    "-o",
    "PreferredAuthentications=password",
    "-o",
    "NumberOfPasswordPrompts=1",
    `${PI_USER}@${PI_HOST}:${PI_CSV_PATH}`,
    PACKAGES_CSV_PATH
  ];

  try {
    await runProcess("setsid", ["-w", "scp", ...scpArgs], {
      env: {
        ...process.env,
        SSH_ASKPASS: askpassPath,
        SSH_ASKPASS_REQUIRE: "force",
        DISPLAY: process.env.DISPLAY || "codex:0"
      }
    });

    await runProcess(process.env.PYTHON_BIN || "python3", [PYTHON_SYNC_SCRIPT_PATH]);

    return { targetPath: PACKAGES_CSV_PATH };
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error("OpenSSH tools and Python are required for package sync (missing setsid/scp/python3 on this server).");
    }

    throw error;
  } finally {
    await fs.rm(askpassPath, { force: true });
  }
}

module.exports = {
  readPackagesCsv,
  syncPackagesFromPi,
  PACKAGES_CSV_PATH
};
