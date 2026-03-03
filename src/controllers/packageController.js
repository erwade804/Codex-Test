const { readPackagesCsv, syncPackagesFromPi } = require("../services/packageService");

async function getPackages() {
  try {
    const data = await readPackagesCsv();
    return { status: 200, body: { data } };
  } catch {
    return { status: 404, body: { error: "packages.csv not found in /data" } };
  }
}


module.exports = {
  getPackages
};
