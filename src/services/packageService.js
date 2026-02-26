const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const {
  DATA_DIR,
  PI_HOST,
  PI_USER,
  PI_PASSWORD,
  PI_CSV_PATH,
  PI_SSH_PORT,
  PI_SSH_KEY_PATH
} = require("../config/env");

const PACKAGES_CSV_PATH = path.join(DATA_DIR, "packages.csv");

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

function syncPackagesFromPi() {
  return new Promise((resolve, reject) => {
    if (!PI_HOST || !PI_USER) {
      reject(new Error("PI_HOST and PI_USER must be configured"));
      return;
    }

    if (!PI_PASSWORD && !PI_SSH_KEY_PATH) {
      reject(new Error("Provide PI_PASSWORD or PI_SSH_KEY_PATH to authenticate to Raspberry Pi"));
      return;
    }

    fs.mkdir(DATA_DIR, { recursive: true })
      .then(() => {
        const scpArgs = ["-P", String(PI_SSH_PORT)];
        if (PI_SSH_KEY_PATH) {
          scpArgs.push("-i", PI_SSH_KEY_PATH);
        }

        scpArgs.push(`${PI_USER}@${PI_HOST}:${PI_CSV_PATH}`, PACKAGES_CSV_PATH);

        const command = PI_PASSWORD ? "sshpass" : "scp";
        const args = PI_PASSWORD
          ? ["-p", PI_PASSWORD, "scp", ...scpArgs]
          : scpArgs;

        const child = spawn(command, args, { stdio: "pipe" });
        let stderr = "";

        child.stderr.on("data", (chunk) => {
          stderr += String(chunk);
        });

        child.on("error", (error) => {
          if (PI_PASSWORD && error.code === "ENOENT") {
            reject(new Error("sshpass is required for password auth. Install sshpass on this server."));
            return;
          }

          reject(error);
        });

        child.on("close", (code) => {
          if (code === 0) {
            resolve({ targetPath: PACKAGES_CSV_PATH });
            return;
          }

          reject(new Error(stderr.trim() || `scp exited with code ${code}`));
        });
      })
      .catch(reject);
  });
}

module.exports = {
  readPackagesCsv,
  syncPackagesFromPi,
  PACKAGES_CSV_PATH
};
