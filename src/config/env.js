const PORT = Number(process.env.PORT) || 80;
const DATA_DIR = process.env.DATA_DIR || "/data";
const PI_HOST = process.env.PI_HOST || "webuildpibetter";
const PI_USER = process.env.PI_USER || "pi";
const PI_PASSWORD = process.env.PI_PASSWORD || "";
const PI_CSV_PATH = process.env.PI_CSV_PATH || "/barcode_project/data/packages.csv";
const PI_SSH_PORT = Number(process.env.PI_SSH_PORT) || 22;

module.exports = {
  PORT,
  DATA_DIR,
  PI_HOST,
  PI_USER,
  PI_PASSWORD,
  PI_CSV_PATH,
  PI_SSH_PORT
};
