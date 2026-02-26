const { readPackagesCsv, syncPackagesFromPi } = require("../services/packageService");

async function getPackages() {
  try {
    const data = await readPackagesCsv();
    return { status: 200, body: { data } };
  } catch {
    return { status: 404, body: { error: "packages.csv not found in /data" } };
  }
}

async function syncPackages() {
  try {
    const result = await syncPackagesFromPi();
    return { status: 200, body: { message: "packages.csv synchronized", ...result } };
  } catch (error) {
    return { status: 500, body: { error: error.message } };
  }
}

module.exports = {
  getPackages,
  syncPackages
};
